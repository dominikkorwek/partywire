import styles from './PlayerAvatar.module.css';

function PersonIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8H4z" />
    </svg>
  );
}

interface PlayerAvatarProps {
  isHost?: boolean;
  isEmpty?: boolean;
}

export default function PlayerAvatar({ isHost = false, isEmpty = false }: PlayerAvatarProps) {
  const cls = [
    styles.avatar,
    isEmpty ? styles.empty : isHost ? styles.host : styles.player,
  ].join(' ');

  return (
    <div className={cls}>
      <PersonIcon size={isEmpty ? 20 : 26} />
    </div>
  );
}
