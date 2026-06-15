import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import RoomCodeBox from '../components/lobby/RoomCodeBox';
import PlayerCard from '../components/lobby/PlayerCard';
import GameSettingsSummary from '../components/lobby/GameSettingsSummary';
import Button from '../components/ui/Button';
import { closeRoom, leaveRoom, startGame, getGameState, getCategories, updateSettings } from '../services/api';
import { connectRoom, disconnect } from '../services/stomp';
import { usePlayer } from '../context/PlayerContext';
import type { PlayerResponse, RoomResponse, GameStateResponse, GameStatus, QuestionCategoryResponse, RoundType } from '../types/api';
import type { GameSettings, Player } from '../types/game';
import layout from '../styles/lobbyLayout.module.css';
import styles from './LobbyPage.module.css';

function toGameSettings(gs: GameStateResponse): GameSettings {
  return {
    maxPlayers: gs.room.maxPlayers,
    pointLimit: gs.pointLimit,
    timePerAnswer: gs.timePerAnswer,
  };
}

function toPlayer(p: PlayerResponse, ownId?: string, ownAvatar?: { animalId: string; color: string }): Player {
  const isSelf = ownId === p.id && ownAvatar;
  return {
    id: p.id,
    nickname: p.nickname,
    isHost: p.isHost,
    avatarAnimal: p.avatarAnimal ?? (isSelf ? ownAvatar.animalId : 'cat'),
    avatarColor: p.avatarColor ?? (isSelf ? ownAvatar.color : '#f97316'),
  };
}

export default function LobbyPage() {
  const navigate = useNavigate();
  const { session, clearSession } = usePlayer();

  const roomCode = session?.roomCode ?? '';
  const playerId = session?.playerId ?? '';
  const isHost = session?.isHost ?? false;
  const ownAvatar = session?.avatar;

  const mapPlayers = useCallback(
    (list: PlayerResponse[]) => list.map((p) => toPlayer(p, playerId, ownAvatar)),
    [playerId, ownAvatar],
  );

  const [players, setPlayers] = useState<Player[]>([]);
  const [settings, setSettings] = useState<GameSettings>({ maxPlayers: 8, pointLimit: 100, timePerAnswer: 30 });
  const [maxPlayers, setMaxPlayers] = useState(8);
  const [categories, setCategories] = useState<QuestionCategoryResponse[]>([]);
  const [excludedCategoryIds, setExcludedCategoryIds] = useState<number[]>([]);
  const [excludedRoundTypes, setExcludedRoundTypes] = useState<RoundType[]>([]);
  const [savingSettings, setSavingSettings] = useState(false);
  const [kickTarget, setKickTarget] = useState<Player | null>(null);
  const [starting, setStarting] = useState(false);
  const [connected, setConnected] = useState(false);

  const handleMessage = useCallback(
    (msg: RoomResponse | GameStateResponse | { event: string }) => {
      if ('event' in msg && msg.event === 'ROOM_CLOSED') {
        clearSession();
        navigate('/');
        return;
      }
      if ('status' in msg) {
        const gs = msg as GameStateResponse;
        const stillInRoom = gs.room.players.some((player) => player.id === playerId);
        if (!stillInRoom) {
          clearSession();
          navigate('/');
          return;
        }
        setPlayers(mapPlayers(gs.room.players));
        setSettings(toGameSettings(gs));
        setMaxPlayers(gs.room.maxPlayers);
        setExcludedCategoryIds(gs.excludedCategoryIds ?? []);
        setExcludedRoundTypes(gs.excludedRoundTypes ?? []);
        const status: GameStatus = gs.status;
        if (status === 'IN_PROGRESS') navigate('/game/question');
        return;
      }
      if ('players' in msg) {
        const rm = msg as RoomResponse;
        const stillInRoom = rm.players.some((player) => player.id === playerId);
        if (!stillInRoom) {
          clearSession();
          navigate('/');
          return;
        }
        setPlayers(mapPlayers(rm.players));
        setMaxPlayers(rm.maxPlayers);
      }
    },
    [navigate, mapPlayers, clearSession, playerId]
  );

  useEffect(() => {
    if (!roomCode) return;

    getCategories()
      .then(setCategories)
      .catch(() => {});

    getGameState(roomCode)
      .then((gs) => {
        setPlayers(mapPlayers(gs.room.players));
        setSettings(toGameSettings(gs));
        setMaxPlayers(gs.room.maxPlayers);
        setExcludedCategoryIds(gs.excludedCategoryIds ?? []);
        setExcludedRoundTypes(gs.excludedRoundTypes ?? []);
      })
      .catch(() => {});

    connectRoom(roomCode, playerId, handleMessage, () => setConnected(true));

    return () => { disconnect(); };
  }, [roomCode, playerId, handleMessage, mapPlayers]);

  async function saveSettings(updates: {
    excludedCategoryIds?: number[];
    excludedRoundTypes?: RoundType[];
  }) {
    if (!isHost) return;
    const nextCategories = updates.excludedCategoryIds ?? excludedCategoryIds;
    const nextRoundTypes = updates.excludedRoundTypes ?? excludedRoundTypes;
    const prevCategories = excludedCategoryIds;
    const prevRoundTypes = excludedRoundTypes;
    setExcludedCategoryIds(nextCategories);
    setExcludedRoundTypes(nextRoundTypes);
    setSavingSettings(true);
    try {
      await updateSettings(roomCode, {
        pointLimit: settings.pointLimit,
        timePerAnswer: settings.timePerAnswer,
        excludedCategoryIds: nextCategories,
        excludedRoundTypes: nextRoundTypes,
      });
    } catch {
      setExcludedCategoryIds(prevCategories);
      setExcludedRoundTypes(prevRoundTypes);
    } finally {
      setSavingSettings(false);
    }
  }

  function handleKickRequest(id: string) {
    const player = players.find((p) => p.id === id);
    if (player) setKickTarget(player);
  }

  async function confirmKick() {
    if (!kickTarget) return;
    try {
      await leaveRoom(roomCode, kickTarget.id);
    } catch {
      // player will be removed via WS anyway
    }
    setKickTarget(null);
  }

  async function handleStartGame() {
    setStarting(true);
    try {
      await startGame(roomCode);
    } catch {
      setStarting(false);
    }
  }

  async function handleExitLobby() {
    if (!roomCode) {
      clearSession();
      navigate('/');
      return;
    }
    try {
      if (isHost) {
        await closeRoom(roomCode);
      } else if (playerId) {
        await leaveRoom(roomCode, playerId);
      }
    } catch {
      // Even if the server already removed the player or room, clear local session and leave lobby.
    } finally {
      clearSession();
      navigate('/');
    }
  }

  const emptySlots = Math.max(0, maxPlayers - players.length);
  const fillPct = maxPlayers > 0 ? (players.length / maxPlayers) * 100 : 0;

  return (
    <>
      <div className={layout.page}>
        <div className={layout.columns}>

          <div className={layout.left}>
            <div className={layout.pageHeader}>
              <div className={layout.titleRow}>
                <h1 className={layout.title}>Lobby gry</h1>
                <span className={layout.statusBadge}>
                  {connected ? 'Na żywo' : 'Łączenie…'}
                </span>
              </div>
              <p className={layout.subtitle}>
                Udostępnij kod pokoju lub link zaproszenia znajomym
              </p>
            </div>

            <RoomCodeBox code={roomCode} />

            <div className={layout.playersSection}>
              <div className={layout.playersHeader}>
                <h2 className={layout.playersTitle}>
                  Gracze ({players.length}/{maxPlayers})
                </h2>
                <div className={layout.progressTrack}>
                  <div className={layout.progressFill} style={{ width: `${fillPct}%` }} />
                </div>
              </div>

              <div className={layout.playersGrid}>
                {players.map((player) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    onKick={isHost && !player.isHost ? handleKickRequest : undefined}
                  />
                ))}
                {Array.from({ length: emptySlots }).map((_, i) => (
                  <PlayerCard key={`empty-${i}`} />
                ))}
              </div>
            </div>
          </div>

          <div className={layout.right}>
            <GameSettingsSummary
              settings={settings}
              categories={categories}
              excludedCategoryIds={excludedCategoryIds}
              excludedRoundTypes={excludedRoundTypes}
              onCategoriesChange={isHost ? (ids) => saveSettings({ excludedCategoryIds: ids }) : undefined}
              onRoundTypesChange={isHost ? (types) => saveSettings({ excludedRoundTypes: types }) : undefined}
              onStartGame={isHost ? handleStartGame : undefined}
              onCancel={handleExitLobby}
              isHost={isHost}
              starting={starting}
              savingSettings={savingSettings}
            />
          </div>

        </div>
      </div>

      {kickTarget && (
        <div className={styles.overlay} onClick={() => setKickTarget(null)}>
          <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
            <p className={styles.dialogTitle}>Wyrzucić gracza?</p>
            <p className={styles.dialogBody}>
              Czy na pewno chcesz wyrzucić{' '}
              <span className={styles.dialogName}>{kickTarget.nickname}</span>{' '}
              z lobby? Będzie mógł dołączyć ponownie, używając kodu pokoju.
            </p>
            <div className={styles.dialogActions}>
              <Button variant="secondary" fullWidth={false} onClick={() => setKickTarget(null)}>
                Anuluj
              </Button>
              <Button fullWidth={false} onClick={confirmKick}>
                Wyrzuć
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
