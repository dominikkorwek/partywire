import styles from './WinnerCard.module.css';

function TrophyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 5h-2V3H7v2H5C3.9 5 3 5.9 3 7v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0011 15.9V18H9v2h6v-2h-2v-2.1a5.01 5.01 0 003.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
    </svg>
  );
}

interface WinnerCardProps {
  winningAnswerText: string;
  voteCount?: number;
  headerLabel?: string;
  subtitle?: string;
}

export default function WinnerCard({ winningAnswerText, voteCount, headerLabel = 'Zwycięska odpowiedź', subtitle }: WinnerCardProps) {
  const defaultSubtitle = voteCount != null && voteCount > 0
    ? `${voteCount} ${voteCount === 1 ? 'głos' : voteCount >= 2 && voteCount <= 4 ? 'głosy' : 'głosów'} na tę odpowiedź`
    : null;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <TrophyIcon />
        <span className={styles.headerLabel}>{headerLabel}</span>
      </div>

      <p className={styles.answer}>{winningAnswerText}</p>
      {(subtitle ?? defaultSubtitle) && (
        <p className={styles.subtitle}>{subtitle ?? defaultSubtitle}</p>
      )}
    </div>
  );
}
