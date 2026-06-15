import type { Player } from '../../types/game';
import { AvatarDisplay } from '../join/AvatarPicker';
import styles from './PlayerCard.module.css';

function EmptyAvatarIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8H4z" />
    </svg>
  );
}

interface PlayerCardProps {
  player?: Player;
  onKick?: (id: string) => void;
}

export default function PlayerCard({ player, onKick }: PlayerCardProps) {
  if (!player) {
    return (
      <div className={[styles.card, styles.empty].join(' ')}>
        <div className={styles.emptyAvatar}>
          <EmptyAvatarIcon />
        </div>
        <p className={styles.waitingText}>Oczekiwanie na gracza…</p>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      {!player.isHost && onKick && (
        <button className={styles.kickBtn} onClick={() => onKick(player.id)}>
          Wyrzuć
        </button>
      )}
      <AvatarDisplay animalId={player.avatarAnimal} color={player.avatarColor} size={56} />
      <p className={styles.name}>
        {player.nickname}
        {player.isHost && <span className={styles.hostStar}> ⭐</span>}
      </p>
      <p className={styles.role}>{player.isHost ? 'Host' : 'Gracz'}</p>
      <span className={styles.onlineDot} />
    </div>
  );
}
