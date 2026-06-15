import type { VoteCount } from '../../types/game';
import styles from './VoteDistribution.module.css';

interface VoteDistributionProps {
  votes: VoteCount[];
}

export default function VoteDistribution({ votes }: VoteDistributionProps) {
  const maxVotes = Math.max(...votes.map((v) => v.votes), 1);

  return (
    <div className={styles.widget}>
      <p className={styles.title}>Rozkład głosów</p>
      <div className={styles.rows}>
        {votes.map((v) => (
          <div key={v.optionId} className={styles.row}>
            <div className={styles.labelRow}>
              <span className={styles.label}>{v.optionText}</span>
              <span className={styles.count}>
                {v.votes} {v.votes === 1 ? 'głos' : v.votes >= 2 && v.votes <= 4 ? 'głosy' : 'głosów'}
              </span>
            </div>
            <div className={styles.barTrack}>
              <div
                className={styles.barFill}
                style={{ width: `${(v.votes / maxVotes) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
