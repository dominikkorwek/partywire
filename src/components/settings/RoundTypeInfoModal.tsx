import type { RoundType } from '../../types/api';
import { ROUND_TYPE_TUTORIALS } from '../../constants/roundTypeTutorials';
import Button from '../ui/Button';
import styles from './RoundTypeInfoModal.module.css';

interface RoundTypeInfoModalProps {
  roundType: RoundType;
  onClose: () => void;
}

export default function RoundTypeInfoModal({ roundType, onClose }: RoundTypeInfoModalProps) {
  const content = ROUND_TYPE_TUTORIALS[roundType];

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div
        className={styles.dialog}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="round-type-info-title"
      >
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Zamknij">
          ×
        </button>

        <span className={styles.badge}>Instrukcja</span>
        <h2 id="round-type-info-title" className={styles.title}>{content.title}</h2>
        <p className={styles.intro}>Jak działa ten typ rundy:</p>

        <ol className={styles.steps}>
          {content.steps.map((step, i) => (
            <li key={i} className={styles.step}>{step}</li>
          ))}
        </ol>

        {content.tip && <p className={styles.tip}>{content.tip}</p>}

        <Button onClick={onClose}>Zamknij</Button>
      </div>
    </div>
  );
}
