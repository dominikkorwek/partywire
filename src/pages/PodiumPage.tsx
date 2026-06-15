import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PodiumPlayer from '../components/podium/PodiumPlayer';
import FinalRankingList from '../components/podium/FinalRankingList';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { getGameState } from '../services/api';
import { connectRoom, disconnect } from '../services/stomp';
import { usePlayer } from '../context/PlayerContext';
import type { GameStateResponse } from '../types/api';
import type { ScoreEntry } from '../types/game';
import layout from '../styles/lobbyLayout.module.css';
import styles from './PodiumPage.module.css';

function TrophyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 5h-2V3H7v2H5C3.9 5 3 5.9 3 7v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0011 15.9V18H9v2h6v-2h-2v-2.1a5.01 5.01 0 003.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
    </svg>
  );
}

function CrownIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M5 16L3 6l5.5 4L12 4l3.5 6L21 6l-2 10H5zm2 2h10v2H7v-2z" />
    </svg>
  );
}

// 2nd left, 1st center, 3rd right
const PODIUM_ORDER: Array<1 | 2 | 3> = [2, 1, 3];

function toScoreEntries(gs: GameStateResponse): ScoreEntry[] {
  return gs.ranking.map((s, idx) => ({
    playerId: s.player.id,
    nickname: s.player.nickname,
    totalScore: s.points,
    rank: idx + 1,
  }));
}

export default function PodiumPage() {
  const navigate = useNavigate();
  const { session, clearSession } = usePlayer();

  const roomCode = session?.roomCode ?? '';
  const playerId = session?.playerId ?? '';

  const [finalRanking, setFinalRanking] = useState<ScoreEntry[]>([]);
  const [winCondition, setWinCondition] = useState(100);

  const handleMessage = useCallback((msg: GameStateResponse | { event?: string }) => {
    if ('event' in msg && msg.event === 'ROOM_CLOSED') {
      clearSession();
      navigate('/');
      return;
    }
    if (!('status' in msg)) return;
    const gs = msg as GameStateResponse;
    const stillInRoom = gs.room.players.some((player) => player.id === playerId);
    if (!stillInRoom) {
      clearSession();
      navigate('/');
      return;
    }
    if (gs.status === 'LOBBY') {
      navigate('/lobby');
      return;
    }
    if (gs.status === 'FINISHED' || gs.status === 'IN_PROGRESS') {
      setFinalRanking(toScoreEntries(gs));
      setWinCondition(gs.pointLimit);
    }
  }, [clearSession, navigate, playerId]);

  useEffect(() => {
    if (!roomCode) { navigate('/'); return; }
    let cancelled = false;
    getGameState(roomCode)
      .then((gs) => {
        if (!cancelled) {
          handleMessage(gs);
        }
      })
      .catch(() => { if (!cancelled) navigate('/'); });
    connectRoom(roomCode, playerId, (msg) => handleMessage(msg as GameStateResponse), undefined);
    return () => {
      cancelled = true;
      disconnect();
    };
  }, [roomCode, playerId, handleMessage, navigate]);

  const top3 = finalRanking.slice(0, 3);
  const winner = finalRanking[0];

  return (
    <div className={layout.page}>
      <div className={layout.columns}>

        <div className={layout.left}>
          <div className={styles.pageHeader}>
            <span className={styles.badge}>
              <TrophyIcon />
              Podium zwycięstwa
            </span>
            <h1 className={styles.title}>Gra zakończona!</h1>
            <p className={styles.subtitle}>Gratulacje dla wszystkich graczy</p>
          </div>

          <div className={styles.podiumWrap}>
            <div className={styles.podium}>
              {PODIUM_ORDER.map((place) => {
                const player = top3[place - 1];
                if (!player) return null;
                return <PodiumPlayer key={player.playerId} player={player} place={place} />;
              })}
            </div>
          </div>

          <Button onClick={() => navigate('/game/summary')}>Zobacz podsumowanie</Button>
        </div>

        <div className={layout.right}>
          <Card padded={false}>
            <div className={styles.panel}>
              <FinalRankingList entries={finalRanking} winnerId={winner?.playerId ?? ''} />
            </div>
          </Card>

          {winner && (
            <Card padded={false}>
              <div className={styles.panel}>
                <p className={styles.panelLabel}>Zwycięzca</p>
                <div className={styles.winnerHighlight}>
                  <span className={styles.winnerIcon}>
                    <CrownIcon />
                  </span>
                  <div className={styles.winnerInfo}>
                    <p className={styles.winnerName}>{winner.nickname}</p>
                    <p className={styles.winnerSub}>Osiągnięto {winCondition} punktów</p>
                  </div>
                </div>
                <p className={styles.winnerDesc}>
                  Pierwszy gracz, który przekroczył próg {winCondition} punktów. Gratulacje!
                </p>
              </div>
            </Card>
          )}
        </div>

      </div>
    </div>
  );
}
