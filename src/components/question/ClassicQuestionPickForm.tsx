import { useEffect, useState } from 'react';
import Button from '../ui/Button';
import { getClassicSetup } from '../../services/api';
import type { ClassicOptionResponse } from '../../types/api';
import { CLASSIC_PICK_HINT } from '../../constants/guessRound';
import styles from './QuestionCreateForm.module.css';

interface ClassicQuestionPickFormProps {
  roundId: number;
  playerId: string;
  onSubmit: (correctAnswerId: number) => void;
  loading?: boolean;
}

export default function ClassicQuestionPickForm({
  roundId,
  playerId,
  onSubmit,
  loading,
}: ClassicQuestionPickFormProps) {
  const [questionContent, setQuestionContent] = useState('');
  const [options, setOptions] = useState<ClassicOptionResponse[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setFetching(true);
    setLoadError('');
    getClassicSetup(roundId, playerId)
      .then((setup) => {
        if (cancelled) return;
        setQuestionContent(setup.questionContent);
        setOptions(setup.options);
      })
      .catch((e) => {
        if (cancelled) return;
        setLoadError(e instanceof Error ? e.message : 'Nie udało się załadować opcji');
      })
      .finally(() => {
        if (!cancelled) setFetching(false);
      });
    return () => { cancelled = true; };
  }, [roundId, playerId]);

  function handleSubmit() {
    if (selectedId === null) {
      setError('Wybierz swoją prawdziwą odpowiedź');
      return;
    }
    setError('');
    onSubmit(selectedId);
  }

  if (fetching) {
    return <p className={styles.hint}>Ładowanie opcji odpowiedzi…</p>;
  }

  if (loadError) {
    return <p className={styles.error}>{loadError}</p>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.badge}>Klasyczne pytanie</span>
        <h2 className={styles.title}>Wybierz swoją prawdziwą odpowiedź</h2>
        <p className={styles.hint}>{CLASSIC_PICK_HINT}</p>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionLabel}>Pytanie</p>
        <p className={styles.existingQuestion}>{questionContent}</p>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionLabel}>Która odpowiedź jest o Tobie?</p>
        <div className={styles.pickGrid}>
          {options.map((opt, i) => (
            <button
              key={opt.id}
              type="button"
              className={[styles.pickCard, selectedId === opt.id ? styles.pickCardActive : ''].filter(Boolean).join(' ')}
              onClick={() => setSelectedId(opt.id)}
            >
              <span className={styles.pickLetter}>{String.fromCharCode(65 + i)}</span>
              <span className={styles.pickText}>{opt.content}</span>
            </button>
          ))}
        </div>
        <Button onClick={handleSubmit} disabled={selectedId === null || loading}>
          {loading ? 'Wysyłanie…' : 'Potwierdź wybór'}
        </Button>
      </div>

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
