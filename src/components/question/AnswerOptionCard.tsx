import type { AnswerOption } from '../../types/game';
import styles from './AnswerOptionCard.module.css';

interface AnswerOptionCardProps {
  option: AnswerOption;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
  readonly?: boolean;
  dimmed?: boolean;
}

export default function AnswerOptionCard({ option, selected, onSelect, disabled, readonly, dimmed }: AnswerOptionCardProps) {
  return (
    <button
      className={[
        styles.card,
        selected ? styles.selected : '',
        readonly ? styles.readonly : '',
        dimmed ? styles.dimmed : '',
      ].filter(Boolean).join(' ')}
      onClick={onSelect}
      disabled={disabled || readonly}
      tabIndex={readonly ? -1 : undefined}
    >
      <span className={styles.text}>{option.content}</span>
      <span className={[styles.radio, selected ? styles.radioSelected : ''].filter(Boolean).join(' ')} />
    </button>
  );
}
