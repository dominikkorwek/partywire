import { AvatarDisplay } from '../join/AvatarPicker';
import type { PlayerAnswerResponse } from '../../types/api';
import styles from './PlayerAnswersBreakdown.module.css';

interface PlayerAnswersBreakdownProps {
  entries: PlayerAnswerResponse[];
}

export default function PlayerAnswersBreakdown({ entries }: PlayerAnswersBreakdownProps) {
  if (entries.length === 0) return null;

  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>Odpowiedzi graczy</p>
      <ul className={styles.list}>
        {entries.map((entry) => (
          <li
            key={entry.player.id}
            className={[
              styles.row,
              entry.correct ? styles.correct : '',
              entry.missed ? styles.missed : '',
            ].filter(Boolean).join(' ')}
          >
            <div className={styles.player}>
              <AvatarDisplay
                animalId={entry.player.avatarAnimal}
                color={entry.player.avatarColor}
                size={36}
              />
              <span className={styles.nickname}>{entry.player.nickname}</span>
            </div>
            <div className={styles.answerCol}>
              {entry.missed ? (
                <span className={styles.missedLabel}>Brak odpowiedzi</span>
              ) : (
                <span className={styles.answerText}>{entry.answerText ?? '-'}</span>
              )}
              {entry.correct && <span className={styles.correctBadge}>Poprawnie</span>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
