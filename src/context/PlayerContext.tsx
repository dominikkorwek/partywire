import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { backendOrigin } from '../services/api';

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
    const isHost = session.isHost;

    const notifyExit = () => {
      const url = isHost
        ? `${backendOrigin()}/api/rooms/${encodeURIComponent(roomCode)}/close`
        : `${backendOrigin()}/api/rooms/${encodeURIComponent(roomCode)}/leave`;

      const body = isHost ? undefined : JSON.stringify({ playerId });

      void fetch(url, {
        method: 'POST',
        credentials: 'include',
        keepalive: true,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body,
      }).catch(() => {});
    };

    window.addEventListener('pagehide', notifyExit);
    window.addEventListener('beforeunload', notifyExit);

    return () => {
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
