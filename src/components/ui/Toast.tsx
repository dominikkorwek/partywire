import { useEffect } from 'react';
import styles from './Toast.module.css';

interface ToastProps {
  message: string;
  onDismiss: () => void;
  duration?: number;
}

export default function Toast({ message, onDismiss, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const id = setTimeout(onDismiss, duration);
    return () => clearTimeout(id);
  }, [message, onDismiss, duration]);

  return (
    <div className={styles.toast} role="alert" onClick={onDismiss}>
      <span className={styles.icon}>⚠</span>
      <span className={styles.text}>{message}</span>
    </div>
  );
}
