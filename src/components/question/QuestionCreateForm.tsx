import { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { GUESS_ANSWER_HINT, GUESS_PICK_HINT } from '../../constants/guessRound';
import styles from './QuestionCreateForm.module.css';

type FormStep = 'question' | 'answers' | 'pickCorrect';

interface QuestionCreateFormProps {
  onSubmit: (questionContent: string, answers: string[], correctIndex: number) => void;
  loading?: boolean;
  /** When set, the question already exists: show it read-only and skip the question input */
  existingQuestion?: string;
}

export default function QuestionCreateForm({ onSubmit, loading, existingQuestion }: QuestionCreateFormProps) {
  const [step, setStep] = useState<FormStep>(existingQuestion ? 'answers' : 'question');
  const [questionText, setQuestionText] = useState('');
  const [answers, setAnswers] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);
  const [error, setError] = useState('');

  const hasExisting = Boolean(existingQuestion);
  const filledAnswers = answers.map((a) => a.trim()).filter(Boolean);

  function updateAnswer(i: number, val: string) {
    setAnswers((prev) => prev.map((a, idx) => (idx === i ? val : a)));
  }

  function goToAnswersStep() {
    if (!hasExisting && !questionText.trim()) {
      setError('Treść pytania jest wymagana');
      return;
    }
    setError('');
    setStep('answers');
  }

  function goToPickCorrectStep() {
    if (filledAnswers.length < 2) {
      setError('Wymagane są co najmniej 2 opcje odpowiedzi');
      return;
    }
    setError('');
    setCorrectIndex(null);
    setStep('pickCorrect');
  }

  function handleSubmit() {
    if (correctIndex === null) {
      setError('Wybierz swoją prawdziwą odpowiedź');
      return;
    }
    if (!answers[correctIndex]?.trim()) {
      setError('Poprawna odpowiedź nie może być pusta');
      return;
    }
    setError('');
    onSubmit(hasExisting ? '' : questionText.trim(), answers, correctIndex);
  }

  function renderAnswersInputs(showLettersOnly = false) {
    return (
      <div className={styles.answerGrid}>
        {answers.map((ans, i) => (
          <div key={i} className={styles.answerRow}>
            <span className={styles.answerLetter}>{String.fromCharCode(65 + i)}</span>
            {showLettersOnly ? (
              <span className={styles.answerPreview}>{ans.trim() || '-'}</span>
            ) : (
              <input
                className={styles.answerInput}
                placeholder={`Odpowiedź ${String.fromCharCode(65 + i)}`}
                value={ans}
                onChange={(e) => updateAnswer(i, e.target.value)}
                maxLength={200}
              />
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {hasExisting ? (
          <>
            <span className={styles.badge}>Twoja kolej na odpowiedź</span>
            <h2 className={styles.title}>
              {step === 'answers' ? 'Krok 1: Wpisz opcje odpowiedzi' : 'Krok 2: Wybierz swoją prawdziwą odpowiedź'}
            </h2>
            <p className={styles.hint}>
              {step === 'answers'
                ? GUESS_ANSWER_HINT
                : GUESS_PICK_HINT}
            </p>
          </>
        ) : (
          <>
            <span className={styles.badge}>Twoja kolej na tworzenie</span>
            <h2 className={styles.title}>
              {step === 'question' && 'Krok 1: Napisz pytanie'}
              {step === 'answers' && 'Krok 2: Wpisz opcje odpowiedzi'}
              {step === 'pickCorrect' && 'Krok 3: Wybierz swoją prawdziwą odpowiedź'}
            </h2>
            <p className={styles.hint}>
              {step === 'question' && 'Stwórz pytanie o sobie lub grupie.'}
              {step === 'answers' && GUESS_ANSWER_HINT}
              {step === 'pickCorrect' && GUESS_PICK_HINT}
            </p>
          </>
        )}
      </div>

      {hasExisting && (
        <div className={styles.section}>
          <p className={styles.sectionLabel}>Pytanie</p>
          <p className={styles.existingQuestion}>{existingQuestion}</p>
        </div>
      )}

      {step === 'question' && !hasExisting && (
        <div className={styles.section}>
          <Input
            label="Pytanie"
            placeholder="np. Co robiłem w ostatni weekend?"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            maxLength={200}
          />
          <Button onClick={goToAnswersStep} disabled={!questionText.trim()}>
            Dalej: opcje odpowiedzi →
          </Button>
        </div>
      )}

      {step === 'answers' && (
        <div className={styles.section}>
          <p className={styles.sectionLabel}>Opcje odpowiedzi</p>
          {renderAnswersInputs()}
          <Button onClick={goToPickCorrectStep} disabled={filledAnswers.length < 2}>
            Dalej: wybierz poprawną →
          </Button>
        </div>
      )}

      {step === 'pickCorrect' && (
        <div className={styles.section}>
          <p className={styles.sectionLabel}>Która jest prawdziwa o tobie?</p>
          <div className={styles.pickGrid}>
            {answers.map((ans, i) => {
              if (!ans.trim()) return null;
              return (
                <button
                  key={i}
                  type="button"
                  className={[styles.pickCard, correctIndex === i ? styles.pickCardActive : ''].filter(Boolean).join(' ')}
                  onClick={() => setCorrectIndex(i)}
                >
                  <span className={styles.pickLetter}>{String.fromCharCode(65 + i)}</span>
                  <span className={styles.pickText}>{ans.trim()}</span>
                </button>
              );
            })}
          </div>
          <div className={styles.stepActions}>
            <Button variant="secondary" fullWidth={false} onClick={() => setStep('answers')}>
              ← Wróć
            </Button>
            <Button onClick={handleSubmit} disabled={correctIndex === null || loading}>
              {loading ? 'Wysyłanie…' : 'Wyślij pytanie'}
            </Button>
          </div>
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
