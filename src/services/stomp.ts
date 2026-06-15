import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { GameStateResponse, RoomResponse } from '../types/api';
import { backendOrigin } from './api';

export type RoomMessage = RoomResponse | GameStateResponse | { event: 'ROOM_CLOSED' };

type MessageCallback = (msg: RoomMessage) => void;

let client: Client | null = null;
let currentRoomCode: string | null = null;

export function connectRoom(
  roomCode: string,
  playerId: string,
  onMessage: MessageCallback,
  onConnected?: () => void,
): void {
  if (client?.active) {
    disconnect();
  }

  currentRoomCode = roomCode.toUpperCase();

  client = new Client({
    webSocketFactory: () => new SockJS(`${backendOrigin()}/ws`),
    reconnectDelay: 3000,
    onConnect: () => {
      client!.subscribe(`/topic/room/${currentRoomCode}`, (frame) => {
        try {
          const parsed = JSON.parse(frame.body) as RoomMessage;
          onMessage(parsed);
        } catch {
          // ignore unparsable frames
        }
      });

      client!.publish({
        destination: '/app/register',
        body: JSON.stringify({ roomCode: currentRoomCode, playerId }),
      });

      onConnected?.();
    },
    onStompError: (frame) => {
      console.error('STOMP error', frame.headers['message']);
    },
  });

  client.activate();
}

export function disconnect(): void {
  client?.deactivate();
  client = null;
  currentRoomCode = null;
}

export function isConnected(): boolean {
  return client?.active ?? false;
}
