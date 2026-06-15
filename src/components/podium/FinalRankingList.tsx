import type { ScoreEntry } from '../../types/game';
import styles from './FinalRankingList.module.css';

interface FinalRankingListProps {
  entries: ScoreEntry[];
  winnerId: string;
}

export default function FinalRankingList({ entries, winnerId }: FinalRankingListProps) {
  return (
    <div className={styles.widget}>
      <p className={styles.title}>Końcowa klasyfikacja</p>
      <div className={styles.rows}>
        {entries.map((e) => {
          const isWinner = e.playerId === winnerId;
          return (
            <div
              key={e.playerId}
              className={`${styles.row} ${isWinner ? styles.winnerRow : ''}`}
            >
              <span className={`${styles.rank} ${isWinner ? styles.rankWinner : ''}`}>
                {e.rank}
              </span>
              <span className={`${styles.name} ${isWinner ? styles.nameWinner : ''}`}>
                {e.nickname}
                {isWinner && <span className={styles.star}> ★</span>}
              </span>
              <span className={styles.score}>{e.totalScore}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
