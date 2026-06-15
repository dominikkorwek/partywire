import type { ReactNode } from 'react';
import styles from './PageLayout.module.css';

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  wide?: boolean;
}

export default function PageLayout({ children, title, subtitle, wide }: PageLayoutProps) {
  const maxWidth = wide ? 680 : 440;

  return (
    <div className={styles.layout}>
      <div className={styles.inner} style={{ maxWidth }}>
        {(title || subtitle) && (
          <header className={styles.header}>
            {title && <h1 className={styles.title}>{title}</h1>}
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </header>
        )}
        {children}
      </div>
    </div>
  );
}
