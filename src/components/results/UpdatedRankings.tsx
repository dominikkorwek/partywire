import type { ScoreEntry } from '../../types/game';
import styles from './UpdatedRankings.module.css';

interface UpdatedRankingsProps {
  entries: ScoreEntry[];
}

export default function UpdatedRankings({ entries }: UpdatedRankingsProps) {
  return (
    <div className={styles.widget}>
      <p className={styles.title}>Aktualna klasyfikacja</p>
      <div className={styles.rows}>
        {entries.map((e) => (
          <div key={e.playerId} className={styles.row}>
            <span className={styles.rank}>{e.rank}</span>
            <span className={styles.name}>{e.nickname}</span>
            <span className={styles.score}>{e.totalScore}</span>
            {e.rankChange != null && e.rankChange > 0 && (
              <span className={styles.change}>+{e.rankChange}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
