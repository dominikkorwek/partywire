import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

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
