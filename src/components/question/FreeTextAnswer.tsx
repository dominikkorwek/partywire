import type { AnswerResponse } from '../../types/api';
import styles from './FreeTextAnswer.module.css';

interface FreeTextAnswerProps {
  phase: 'writing' | 'voting';
  freeText: string;
  onFreeTextChange: (val: string) => void;
  answers: AnswerResponse[];
  selectedAnswerId: number | null;
  onSelectAnswer: (id: number) => void;
  submitted: boolean;
  currentPlayerId: string;
  loading?: boolean;
  pickerMode?: boolean;
}

export default function FreeTextAnswer({
  phase,
  freeText,
  onFreeTextChange,
  answers,
  selectedAnswerId,
  onSelectAnswer,
  submitted,
  currentPlayerId,
  loading,
  pickerMode = false,
}: FreeTextAnswerProps) {
  if (phase === 'writing') {
    return (
      <div className={styles.container}>
        {submitted ? (
          <div className={styles.waiting}>
            <span className={styles.check}>✓</span>
            <p className={styles.waitLabel}>Odpowiedź wysłana! Oczekiwanie na innych…</p>
          </div>
        ) : (
          <>
            <textarea
              className={styles.textarea}
              placeholder="Napisz swoją odpowiedź…"
              value={freeText}
              onChange={(e) => onFreeTextChange(e.target.value)}
              maxLength={500}
              rows={4}
            />
            <p className={styles.charCount}>{freeText.length} / 500</p>
          </>
        )}
      </div>
    );
  }

  const pickableAnswers = pickerMode
    ? answers.filter((a) => a.author != null)
    : answers.filter((a) => a.author?.id !== currentPlayerId);

  return (
    <div className={styles.container}>
      {!pickerMode && (
        <p className={styles.votePrompt}>Głosuj na najlepszą odpowiedź:</p>
      )}
      <div className={styles.voteList}>
        {pickableAnswers.map((ans) => (
          <button
            key={ans.id}
            className={[
              styles.voteCard,
              selectedAnswerId === ans.id ? styles.voteCardSelected : '',
              submitted && selectedAnswerId !== ans.id ? styles.voteCardDimmed : '',
            ].filter(Boolean).join(' ')}
            onClick={() => onSelectAnswer(ans.id)}
            disabled={submitted || loading}
          >
            <span className={styles.voteText}>{ans.content}</span>
            {selectedAnswerId === ans.id && <span className={styles.voteCheck}>✓</span>}
          </button>
        ))}
        {pickableAnswers.length === 0 && (
          <p className={styles.noAnswers}>Brak odpowiedzi do wyboru.</p>
        )}
      </div>
    </div>
  );
}
