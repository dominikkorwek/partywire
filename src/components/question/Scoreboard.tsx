import type { ScoreEntry } from '../../types/game';
import Card from '../ui/Card';
import styles from './Scoreboard.module.css';

interface ScoreboardProps {
  entries: ScoreEntry[];
  winCondition: number;
}

export default function Scoreboard({ entries, winCondition }: ScoreboardProps) {
  const max = Math.max(...entries.map((e) => e.totalScore), 1);

  return (
    <Card padded={false}>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <span className={styles.title}>Tablica wyników</span>
          <span className={styles.winLabel}>Wygrana przy {winCondition} pkt</span>
        </div>

        <ul className={styles.list}>
          {entries.map((entry) => (
            <li key={entry.playerId} className={styles.row}>
              <span className={styles.rank}>{entry.rank}</span>
              <span className={styles.name}>{entry.nickname}</span>
              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  style={{ width: `${(entry.totalScore / Math.max(winCondition, max)) * 100}%` }}
                />
              </div>
              <span className={styles.score}>{entry.totalScore}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
