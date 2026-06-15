import styles from './AvatarPicker.module.css';

export interface AvatarConfig {
  animalId: string;
  color: string;
}

export const AVATAR_COLORS = [
  { id: 'orange', value: '#f97316' },
  { id: 'blue',   value: '#3b82f6' },
  { id: 'purple', value: '#8b5cf6' },
  { id: 'green',  value: '#10b981' },
  { id: 'pink',   value: '#ec4899' },
  { id: 'slate',  value: '#64748b' },
  { id: 'red',    value: '#ef4444' },
  { id: 'yellow', value: '#eab308' },
  { id: 'cyan',   value: '#06b6d4' },
  { id: 'indigo', value: '#6366f1' },
  { id: 'rose',   value: '#f43f5e' },
  { id: 'lime',   value: '#84cc16' },
  { id: 'amber',  value: '#f59e0b' },
  { id: 'teal',   value: '#14b8a6' },
  { id: 'violet', value: '#a855f7' },
  { id: 'sky',    value: '#0ea5e9' },
];

const SVG_PROPS = {
  viewBox: '0 0 24 24',
  width: '100%',
  height: '100%',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

function CatIcon() {
  return (
    <svg {...SVG_PROPS}>
      <path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.07 1 2.24 1 3.44C21 17.9 16.97 21 12 21s-9-3-9-7.56c0-1.25.5-2.4 1-3.44 0 0-1.89-6.42-.5-7 1.39-.58 4.72.23 6.5 2.23A9.04 9.04 0 0 1 12 5Z" />
      <path d="M8 14v.5" />
      <path d="M16 14v.5" />
      <path d="M11.25 16.25h1.5L12 17l-.75-.75Z" />
    </svg>
  );
}

function PandaIcon() {
  return (
    <svg {...SVG_PROPS}>
      <path d="M11.25 17.25h1.5L12 18z" />
      <path d="m15 12 2 2" />
      <path d="M18 6.5a.5.5 0 0 0-.5-.5" />
      <path d="M20.69 9.67a4.5 4.5 0 1 0-7.04-5.5 8.35 8.35 0 0 0-3.3 0 4.5 4.5 0 1 0-7.04 5.5C2.49 11.2 2 12.88 2 14.5 2 19.47 6.48 22 12 22s10-2.53 10-7.5c0-1.62-.48-3.3-1.3-4.83" />
      <path d="M6 6.5a.495.495 0 0 1 .5-.5" />
      <path d="m9 12-2 2" />
    </svg>
  );
}

function DogIcon() {
  return (
    <svg {...SVG_PROPS}>
      <path d="M11.25 16.25h1.5L12 17z" />
      <path d="M16 14v.5" />
      <path d="M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444a11.702 11.702 0 0 0-.493-3.309" />
      <path d="M8 14v.5" />
      <path d="M8.5 8.5c-.384 1.05-1.083 2.028-2.344 2.5-1.931.722-3.576-.297-3.656-1-.113-.994 1.177-6.53 4-7 1.923-.321 3.651.845 3.651 2.235A7.497 7.497 0 0 1 14 5.277c0-1.39 1.844-2.598 3.767-2.277 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5" />
    </svg>
  );
}

function SnailIcon() {
  return (
    <svg {...SVG_PROPS}>
      <path d="M2 13a6 6 0 1 0 12 0 4 4 0 1 0-8 0 2 2 0 0 0 4 0" />
      <circle cx="10" cy="13" r="8" />
      <path d="M2 21h12c4.4 0 8-3.6 8-8V7a2 2 0 1 0-4 0v6" />
      <path d="M18 3 19.1 5.2" />
      <path d="M22 3 20.9 5.2" />
    </svg>
  );
}

function BirdIcon() {
  return (
    <svg {...SVG_PROPS}>
      <path d="M16 7h.01" />
      <path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20" />
      <path d="m20 7 2 .5-2 .5" />
      <path d="M10 18v3" />
      <path d="M14 17.75V21" />
      <path d="M7 18a6 6 0 0 0 3.84-10.61" />
    </svg>
  );
}

function FishIcon() {
  return (
    <svg {...SVG_PROPS}>
      <path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z" />
      <path d="M18 12v.5" />
      <path d="M16 17.93a9.77 9.77 0 0 1 0-11.86" />
      <path d="M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33" />
      <path d="M10.46 7.26C10.2 5.88 9.17 4.24 8 3h5.8a2 2 0 0 1 1.98 1.67l.23 1.4" />
      <path d="m16.01 17.93-.23 1.4A2 2 0 0 1 13.8 21H9.5a5.96 5.96 0 0 0 1.49-3.98" />
    </svg>
  );
}

export const ANIMALS = [
  { id: 'cat',   label: 'Kot',    nickname: 'kot',    gender: 'm' as const, Icon: CatIcon },
  { id: 'panda', label: 'Panda',  nickname: 'panda',  gender: 'f' as const, Icon: PandaIcon },
  { id: 'dog',   label: 'Pies',   nickname: 'pies',   gender: 'm' as const, Icon: DogIcon },
  { id: 'snail', label: 'Ślimak', nickname: 'ślimak', gender: 'm' as const, Icon: SnailIcon },
  { id: 'bird',  label: 'Ptak',   nickname: 'ptak',   gender: 'm' as const, Icon: BirdIcon },
  { id: 'fish',  label: 'Ryba',   nickname: 'ryba',   gender: 'f' as const, Icon: FishIcon },
];

interface AvatarDisplayProps {
  animalId: string;
  color: string;
  size?: number;
  className?: string;
}

export function AvatarDisplay({ animalId, color, size = 48, className = '' }: AvatarDisplayProps) {
  const animal = ANIMALS.find((a) => a.id === animalId) ?? ANIMALS[0];
  const padding = Math.round(size * 0.18);

  return (
    <div
      className={[styles.display, className].filter(Boolean).join(' ')}
      style={{ width: size, height: size, background: color, padding }}
      aria-label={animal.label}
    >
      <animal.Icon />
    </div>
  );
}

interface AvatarPickerProps {
  value: AvatarConfig;
  onChange: (config: AvatarConfig) => void;
}

export default function AvatarPicker({ value, onChange }: AvatarPickerProps) {
  return (
    <div className={styles.picker}>
      <p className={styles.sectionLabel}>Twój awatar</p>

      <div className={styles.body}>
        <AvatarDisplay animalId={value.animalId} color={value.color} size={64} className={styles.previewDisplay} />

        <div className={styles.controls}>
          <div className={styles.animalGrid}>
            {ANIMALS.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                className={[
                  styles.animalBtn,
                  value.animalId === id ? styles.animalBtnActive : '',
                ].join(' ')}
                onClick={() => onChange({ ...value, animalId: id })}
                aria-label={label}
                title={label}
              >
                <Icon />
              </button>
            ))}
          </div>

          <div className={styles.colorRow}>
            {AVATAR_COLORS.map(({ id, value: hex }) => (
              <button
                key={id}
                type="button"
                className={[
                  styles.colorSwatch,
                  value.color === hex ? styles.colorSwatchActive : '',
                ].join(' ')}
                style={{ background: hex }}
                onClick={() => onChange({ ...value, color: hex })}
                aria-label={id}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
