import { useState } from 'react';
import type { RoundType } from '../../types/api';
import { ALL_ROUND_TYPES, ROUND_TYPE_LABELS, toggleRoundTypeExclusion, includedRoundTypeCount } from '../../constants/roundTypes';
import RoundTypeInfoModal from './RoundTypeInfoModal';
import styles from './CategorySelector.module.css';

interface RoundTypeSelectorProps {
  excludedTypes: RoundType[];
  onChange?: (excludedTypes: RoundType[]) => void;
  disabled?: boolean;
  variant?: 'chips' | 'grid';
  hint?: string;
  showInfo?: boolean;
}

function RoundTypeInfoButton({
  roundType,
  onOpen,
}: {
  roundType: RoundType;
  onOpen: (roundType: RoundType) => void;
}) {
  return (
    <button
      type="button"
      className={styles.infoBtn}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onOpen(roundType);
      }}
      aria-label={`Instrukcja: ${ROUND_TYPE_LABELS[roundType]}`}
      title="Zobacz instrukcję"
    >
      i
    </button>
  );
}

export default function RoundTypeSelector({
  excludedTypes,
  onChange,
  disabled = false,
  variant = 'chips',
  hint = 'Aktywne typy rund biorą udział w grze. Kliknij, aby włączyć lub wyłączyć.',
  showInfo = true,
}: RoundTypeSelectorProps) {
  const [infoRoundType, setInfoRoundType] = useState<RoundType | null>(null);

  function handleToggle(roundType: RoundType) {
    if (disabled || !onChange) return;
    const next = toggleRoundTypeExclusion(excludedTypes, roundType);
    if (includedRoundTypeCount(next) <= 0) return;
    onChange(next);
  }

  if (variant === 'grid') {
    return (
      <>
        <div className={styles.block}>
          <p className={styles.label}>Typy rund</p>
          {hint && <p className={styles.hint}>{hint}</p>}
          <div className={styles.grid}>
            {ALL_ROUND_TYPES.map((roundType) => {
              const included = !excludedTypes.includes(roundType);
              return (
                <div key={roundType} className={styles.gridRow}>
                  <label className={styles.gridRowMain}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={included}
                      disabled={disabled}
                      onChange={() => handleToggle(roundType)}
                    />
                    <span>{ROUND_TYPE_LABELS[roundType]}</span>
                  </label>
                  {showInfo && (
                    <RoundTypeInfoButton roundType={roundType} onOpen={setInfoRoundType} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
        {infoRoundType && (
          <RoundTypeInfoModal roundType={infoRoundType} onClose={() => setInfoRoundType(null)} />
        )}
      </>
    );
  }

  return (
    <>
      <div className={styles.block}>
        <p className={styles.label}>Typy rund</p>
        {hint && <p className={styles.hint}>{hint}</p>}
        <div className={styles.chips}>
          {ALL_ROUND_TYPES.map((roundType) => {
            const included = !excludedTypes.includes(roundType);
            return (
              <div key={roundType} className={styles.chipWrap}>
                <button
                  type="button"
                  className={[styles.chip, included ? styles.chipActive : ''].filter(Boolean).join(' ')}
                  onClick={() => handleToggle(roundType)}
                  disabled={disabled}
                >
                  {ROUND_TYPE_LABELS[roundType]}
                </button>
                {showInfo && (
                  <RoundTypeInfoButton roundType={roundType} onOpen={setInfoRoundType} />
                )}
              </div>
            );
          })}
        </div>
      </div>
      {infoRoundType && (
        <RoundTypeInfoModal roundType={infoRoundType} onClose={() => setInfoRoundType(null)} />
      )}
    </>
  );
}

export { includedRoundTypeCount };
