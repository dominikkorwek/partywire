import type { GameSettings } from '../../types/game';
import type { QuestionCategoryResponse, RoundType } from '../../types/api';
import CategorySelector from '../settings/CategorySelector';
import RoundTypeSelector from '../settings/RoundTypeSelector';
import Card from '../ui/Card';
import Button from '../ui/Button';
import styles from './GameSettingsSummary.module.css';

interface GameSettingsSummaryProps {
  settings: GameSettings;
  categories: QuestionCategoryResponse[];
  excludedCategoryIds: number[];
  excludedRoundTypes: RoundType[];
  onCategoriesChange?: (excludedCategoryIds: number[]) => void;
  onRoundTypesChange?: (excludedRoundTypes: RoundType[]) => void;
  onStartGame?: () => void;
  onCancel: () => void;
  isHost?: boolean;
  starting?: boolean;
  savingSettings?: boolean;
}

export default function GameSettingsSummary({
  settings,
  categories,
  excludedCategoryIds,
  excludedRoundTypes,
  onCategoriesChange,
  onRoundTypesChange,
  onStartGame,
  onCancel,
  isHost = true,
  starting = false,
  savingSettings = false,
}: GameSettingsSummaryProps) {
  const disabled = !isHost || savingSettings;

  return (
    <>
      <Card padded={false}>
        <div className={styles.section}>
          <p className={styles.title}>Ustawienia gry</p>

          <RoundTypeSelector
            excludedTypes={excludedRoundTypes}
            onChange={onRoundTypesChange}
            disabled={disabled}
          />

          <CategorySelector
            categories={categories}
            excludedIds={excludedCategoryIds}
            onChange={onCategoriesChange}
            disabled={disabled}
          />

          <div className={styles.settingRows}>
            <div className={styles.settingRow}>
              <span className={styles.settingLabel}>Warunek wygranej</span>
              <span className={styles.settingValue}>{settings.pointLimit} punktów</span>
            </div>
            <div className={styles.settingRow}>
              <span className={styles.settingLabel}>Czas na odpowiedź</span>
              <span className={styles.settingValue}>{settings.timePerAnswer} sekund</span>
            </div>
            <div className={styles.settingRow}>
              <span className={styles.settingLabel}>Pojemność pokoju</span>
              <span className={styles.settingValue}>{settings.maxPlayers} graczy</span>
            </div>
          </div>
        </div>
      </Card>

      <Card padded={false}>
        <div className={styles.section}>
          <p className={styles.title}>Synchronizacja na żywo</p>
          <div className={styles.syncRow}>
            <span className={styles.liveDot} />
            <span className={styles.syncLabel}>Lobby aktualizuje się na żywo</span>
          </div>
          <p className={styles.syncDesc}>
            Gracze mogą dołączać lub wychodzić w dowolnym momencie. Host decyduje, kiedy rozpocząć grę.
          </p>
        </div>
      </Card>

      <Card padded={false}>
        <div className={styles.section}>
          <p className={styles.title}>Panel hosta</p>
          <ul className={styles.controlsList}>
            <li>Rozpocznij grę, gdy wszyscy są gotowi</li>
            <li>W razie potrzeby wyrzuć graczy</li>
            <li>Anuluj i zamknij pokój</li>
          </ul>
          <div className={styles.actions}>
            {isHost && (
              <Button onClick={onStartGame} disabled={starting}>
                {starting ? 'Rozpoczynanie…' : 'Rozpocznij grę'}
              </Button>
            )}
            <Button variant="ghost" onClick={onCancel}>
              {isHost ? 'Anuluj' : 'Opuść'}
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
}
