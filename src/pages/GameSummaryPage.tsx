import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { getGameState, resetLobby } from '../services/api';
import { connectRoom, disconnect } from '../services/stomp';
import { usePlayer } from '../context/PlayerContext';
import type { ScoreEntry } from '../types/game';
import type { GameStateResponse } from '../types/api';
import layout from '../styles/lobbyLayout.module.css';
import styles from './GameSummaryPage.module.css';

function TrophyIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 5h-2V3H7v2H5C3.9 5 3 5.9 3 7v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0011 15.9V18H9v2h6v-2h-2v-2.1a5.01 5.01 0 003.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8H4z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  );
}

function toScoreEntries(gs: GameStateResponse): ScoreEntry[] {
  return gs.ranking.map((s, idx) => ({
    playerId: s.player.id,
    nickname: s.player.nickname,
    totalScore: s.points,
    rank: idx + 1,
  }));
}

export default function GameSummaryPage() {
  const navigate = useNavigate();
  const { session, clearSession } = usePlayer();
  const roomCode = session?.roomCode ?? '';
  const playerId = session?.playerId ?? '';
  const isHost = session?.isHost ?? false;

  const [finalRanking, setFinalRanking] = useState<ScoreEntry[]>([]);
  const [winCondition, setWinCondition] = useState(100);
  const [resetLoading, setResetLoading] = useState(false);

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
    setFinalRanking(toScoreEntries(gs));
    setWinCondition(gs.pointLimit);
  }, [clearSession, navigate, playerId]);

  useEffect(() => {
    if (!roomCode) { navigate('/'); return; }
    let cancelled = false;
    getGameState(roomCode)
      .then((gs) => { if (!cancelled) handleMessage(gs); })
      .catch(() => { if (!cancelled) navigate('/'); });
    connectRoom(roomCode, playerId, (msg) => handleMessage(msg as GameStateResponse), undefined);
    return () => {
      cancelled = true;
      disconnect();
    };
  }, [roomCode, playerId, handleMessage, navigate]);

  async function handleReplay() {
    if (!isHost) {
      navigate('/lobby');
      return;
    }
    setResetLoading(true);
    try {
      const gs = await resetLobby(roomCode);
      handleMessage(gs);
    } finally {
      setResetLoading(false);
    }
  }

  const winner = finalRanking[0];

  return (
    <div className={layout.page}>
      <div className={layout.columns}>

        <div className={layout.left}>
          <div className={styles.pageHeader}>
            <span className={styles.badge}>
              <TrophyIcon size={13} />
              Koniec gry
            </span>
            <h1 className={styles.title}>Gra zakończona!</h1>
            <p className={styles.subtitle}>Dziękujemy za grę w Party Wire</p>
          </div>

          {winner && (
            <div className={styles.winnerCard}>
              <span className={styles.winnerTrophy}>
                <TrophyIcon size={40} />
              </span>
              <p className={styles.winnerName}>{winner.nickname} wygrywa!</p>
              <p className={styles.winnerPts}>{winner.totalScore} punktów</p>
            </div>
          )}

          <Card padded={false}>
            <div className={styles.rankingsPanel}>
              <p className={styles.rankingsTitle}>Końcowa klasyfikacja</p>
              <div className={styles.rankingsList}>
                {finalRanking.map((e) => (
                  <div
                    key={e.playerId}
                    className={`${styles.rankRow} ${e.rank === 1 ? styles.rankRowWinner : ''}`}
                  >
                    <span className={`${styles.rankCircle} ${e.rank === 1 ? styles.rankCircleWinner : ''}`}>
                      {e.rank}
                    </span>
                    <span className={styles.rankAvatar}>
                      <PersonIcon />
                    </span>
                    <div className={styles.rankInfo}>
                      <span className={`${styles.rankName} ${e.rank === 1 ? styles.rankNameWinner : ''}`}>
                        {e.nickname}
                      </span>
                    </div>
                    <span className={styles.rankScore}>{e.totalScore}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <div className={styles.actions}>
            <Button onClick={handleReplay} disabled={resetLoading}>
              <span className={styles.btnInner}><PlayIcon /> {resetLoading ? 'Przywracanie lobby…' : 'Zagraj ponownie'}</span>
            </Button>
            <Button variant="secondary" onClick={() => navigate('/')}>
              <span className={styles.btnInner}><HomeIcon /> Wróć na stronę główną</span>
            </Button>
          </div>

        </div>

        <div className={layout.right}>
          <Card padded={false}>
            <div className={styles.panel}>
              <p className={styles.panelLabel}>Statystyki gry</p>
              <div className={styles.stats}>
                <div className={styles.statBox}>
                  <span className={styles.statIcon}><PersonIcon /></span>
                  <div>
                    <p className={styles.statLabel}>Gracze</p>
                    <p className={styles.statValue}>{finalRanking.length}</p>
                  </div>
                </div>
                <div className={styles.statBox}>
                  <span className={styles.statIcon}><TrophyIcon /></span>
                  <div>
                    <p className={styles.statLabel}>Warunek wygranej</p>
                    <p className={styles.statValue}>{winCondition} pkt</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card padded={false}>
            <div className={styles.panel}>
              <p className={styles.panelLabel}>Podsumowanie wyników</p>
              <div className={styles.breakdown}>
                <div className={styles.breakdownRow}>
                  <span className={styles.breakdownKey}>Zwycięzca:</span>
                  <span className={styles.breakdownVal}>{winner?.nickname ?? '-'}</span>
                </div>
                <div className={styles.breakdownRow}>
                  <span className={styles.breakdownKey}>Wynik zwycięzcy:</span>
                  <span className={`${styles.breakdownVal} ${styles.breakdownAccent}`}>
                    {winner?.totalScore ?? '-'}
                  </span>
                </div>
                <div className={styles.breakdownRow}>
                  <span className={styles.breakdownKey}>Limit punktów:</span>
                  <span className={styles.breakdownVal}>{winCondition}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card padded={false}>
            <div className={styles.panel}>
              <p className={styles.panelLabel}>Co dalej?</p>
              <ul className={styles.nextActions}>
                <li>Rozpocznij nową grę z tymi samymi graczami</li>
                <li>Zmień ustawienia i zagraj ponownie</li>
                <li>Wróć do menu głównego</li>
              </ul>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
