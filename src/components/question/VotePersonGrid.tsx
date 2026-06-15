import type { PlayerResponse } from '../../types/api';
import styles from './VotePersonGrid.module.css';

interface VotePersonGridProps {
  players: PlayerResponse[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  disabled?: boolean;
  locked?: boolean;
}

export default function VotePersonGrid({ players, selectedId, onSelect, disabled, locked }: VotePersonGridProps) {
  return (
    <div className={styles.grid}>
      {players.map((p) => (
          <button
            key={p.id}
            className={[
              styles.card,
              selectedId === p.id ? styles.selected : '',
              locked && selectedId !== p.id ? styles.dimmed : '',
            ].filter(Boolean).join(' ')}
            onClick={() => onSelect(p.id)}
            disabled={disabled || locked}
          >
            <span className={styles.avatar}>{p.nickname.charAt(0).toUpperCase()}</span>
            <span className={styles.name}>{p.nickname}</span>
            {p.isHost && <span className={styles.hostTag}>Host</span>}
          </button>
        ))}
    </div>
  );
}
