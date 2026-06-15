import type { QuestionCategoryResponse } from '../../types/api';
import styles from './CategorySelector.module.css';

export function toggleCategoryExclusion(excludedIds: number[], categoryId: number): number[] {
  return excludedIds.includes(categoryId)
    ? excludedIds.filter((id) => id !== categoryId)
    : [...excludedIds, categoryId];
}

export function includedCategoryCount(categories: QuestionCategoryResponse[], excludedIds: number[]): number {
  return categories.filter((c) => !excludedIds.includes(c.id)).length;
}

interface CategorySelectorProps {
  categories: QuestionCategoryResponse[];
  excludedIds: number[];
  onChange?: (excludedIds: number[]) => void;
  disabled?: boolean;
  variant?: 'chips' | 'grid';
  hint?: string;
}

export default function CategorySelector({
  categories,
  excludedIds,
  onChange,
  disabled = false,
  variant = 'chips',
  hint = 'Aktywne kategorie biorą udział w grze. Kliknij, aby włączyć lub wyłączyć.',
}: CategorySelectorProps) {
  if (categories.length === 0) return null;

  function handleToggle(categoryId: number) {
    if (disabled || !onChange) return;
    const next = toggleCategoryExclusion(excludedIds, categoryId);
    if (includedCategoryCount(categories, next) <= 0) return;
    onChange(next);
  }

  if (variant === 'grid') {
    return (
      <div className={styles.block}>
        <p className={styles.label}>Kategorie pytań</p>
        {hint && <p className={styles.hint}>{hint}</p>}
        <div className={styles.grid}>
          {categories.map((cat) => {
            const included = !excludedIds.includes(cat.id);
            return (
              <label key={cat.id} className={styles.gridRow}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={included}
                  disabled={disabled}
                  onChange={() => handleToggle(cat.id)}
                />
                <span>{cat.name}</span>
              </label>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.block}>
      <p className={styles.label}>Kategorie pytań</p>
      {hint && <p className={styles.hint}>{hint}</p>}
      <div className={styles.chips}>
        {categories.map((cat) => {
          const included = !excludedIds.includes(cat.id);
          return (
            <button
              key={cat.id}
              type="button"
              className={[styles.chip, included ? styles.chipActive : ''].filter(Boolean).join(' ')}
              onClick={() => handleToggle(cat.id)}
              disabled={disabled}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
