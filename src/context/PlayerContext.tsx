import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { backendOrigin, heartbeatPresence } from '../services/api';

export interface AvatarConfig {
  animalId: string;
  color: string;
}

export interface PlayerSession {
  playerId: string;
  nickname: string;
  roomCode: string;
  isHost: boolean;
  avatar: AvatarConfig;
}

interface PlayerContextValue {
  session: PlayerSession | null;
  setSession: (session: PlayerSession) => void;
  clearSession: () => void;
}

const STORAGE_KEY = 'kumple_player_session';

function loadSession(): PlayerSession | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PlayerSession) : null;
  } catch {
    return null;
  }
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<PlayerSession | null>(loadSession);

  const setSession = useCallback((s: PlayerSession) => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    setSessionState(s);
  }, []);

  const clearSession = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setSessionState(null);
  }, []);

  useEffect(() => {
    if (!session) return;

    const roomCode = session.roomCode;
    const playerId = session.playerId;
    const heartbeat = () => {
      void heartbeatPresence(roomCode, playerId).catch(() => {});
    };
    heartbeat();
    const heartbeatId = window.setInterval(heartbeat, 5000);

    const notifyExit = () => {
      const url = `${backendOrigin()}/api/rooms/${encodeURIComponent(roomCode)}/leave`;
      const body = JSON.stringify({ playerId });

      void fetch(url, {
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body,
      }).catch(() => {});
    };

    window.addEventListener('pagehide', notifyExit);
    window.addEventListener('beforeunload', notifyExit);

    return () => {
      window.clearInterval(heartbeatId);
      window.removeEventListener('pagehide', notifyExit);
      window.removeEventListener('beforeunload', notifyExit);
    };
  }, [session]);

  return (
    <PlayerContext.Provider value={{ session, setSession, clearSession }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used inside PlayerProvider');
  return ctx;
}
