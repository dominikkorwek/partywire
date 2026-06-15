import type { InputHTMLAttributes } from 'react';
import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: boolean;
}

export default function Input({ label, helperText, error, id, className, ...props }: InputProps) {
  return (
    <div className={styles.wrapper}>
      {label && (
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
      )}
      <input
        className={[styles.input, error ? styles.inputError : '', className].filter(Boolean).join(' ')}
        id={id}
        aria-describedby={helperText && id ? `${id}-helper` : undefined}
        aria-invalid={error}
        {...props}
      />
      {helperText && (
        <p
          id={id ? `${id}-helper` : undefined}
          className={[styles.helperText, error ? styles.helperError : ''].filter(Boolean).join(' ')}
        >
          {helperText}
        </p>
      )}
    </div>
  );
}
