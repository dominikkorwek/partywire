import type { ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}

export default function Card({ children, className, padded = true }: CardProps) {
  const classes = [
    styles.card,
    padded ? styles.padded : '',
    className,
  ].filter(Boolean).join(' ');

  return <div className={classes}>{children}</div>;
}
