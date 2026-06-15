import type { ScoreEntry } from '../../types/game';
import styles from './PodiumPlayer.module.css';

const BLOCK_CLASS: Record<1 | 2 | 3, string> = { 1: 'block1', 2: 'block2', 3: 'block3' };

function PersonIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8H4z" />
    </svg>
  );
}

function CrownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M5 16L3 6l5.5 4L12 4l3.5 6L21 6l-2 10H5zm2 2h10v2H7v-2z" />
    </svg>
  );
}

interface PodiumPlayerProps {
  player: ScoreEntry;
  place: 1 | 2 | 3;
}

export default function PodiumPlayer({ player, place }: PodiumPlayerProps) {
  const isWinner = place === 1;

  return (
    <div className={`${styles.slot} ${isWinner ? styles.winnerSlot : ''}`}>
      <div className={styles.info}>
        <div className={styles.avatarWrap}>
          <div className={`${styles.avatar} ${isWinner ? styles.avatarWinner : ''}`}>
            <PersonIcon size={isWinner ? 30 : 22} />
          </div>
          {isWinner && (
            <span className={styles.crownBadge}>
              <CrownIcon />
            </span>
          )}
        </div>
        <span className={`${styles.name} ${isWinner ? styles.nameWinner : ''}`}>
          {player.nickname}
        </span>
        <span className={`${styles.pts} ${isWinner ? styles.ptsWinner : ''}`}>
          {player.totalScore} pkt
        </span>
      </div>

      {/* podium block */}
      <div
        className={[
          styles.block,
          styles[BLOCK_CLASS[place]],
          isWinner ? styles.blockWinner : '',
        ].join(' ')}
      >
        <span className={styles.placeLabel}>#{place}</span>
      </div>
    </div>
  );
}
