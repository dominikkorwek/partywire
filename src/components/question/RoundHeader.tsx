import type { RoundType } from '../../types/api';
import { ROUND_TYPE_LABELS } from '../../constants/roundTypes';
import styles from './RoundHeader.module.css';

interface RoundHeaderProps {
  roundNumber: number;
  category?: string;
  roundType: RoundType | string;
  timeLeft: number;
  timePerAnswer: number;
}

export default function RoundHeader({ roundNumber, category, roundType, timeLeft, timePerAnswer }: RoundHeaderProps) {
  const timeProgress = timePerAnswer > 0 ? (timeLeft / timePerAnswer) * 100 : 0;
  const isLow = timeLeft <= 10;
  const label = ROUND_TYPE_LABELS[roundType as RoundType] ?? roundType;

  return (
    <div className={styles.header}>
      <div className={styles.left}>
        <span className={styles.roundLabel}>Runda {roundNumber}</span>
        <span className={styles.typeLabel}>{label}</span>
      </div>

      <div className={styles.timeTrack}>
        <div
          className={[styles.timeFill, isLow ? styles.timeFillLow : ''].filter(Boolean).join(' ')}
          style={{ width: `${timeProgress}%` }}
        />
      </div>

      <div className={styles.right}>
        {category && <span className={styles.categoryLabel}>Kategoria: {category}</span>}
        <span className={[styles.timeLeft, isLow ? styles.timeLeftLow : ''].filter(Boolean).join(' ')}>
          {timeLeft} s pozostało
        </span>
      </div>
    </div>
  );
}
