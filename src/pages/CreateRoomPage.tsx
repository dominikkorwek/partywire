import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { getCategories } from '../services/api';
import type { QuestionCategoryResponse, RoundType } from '../types/api';
import CategorySelector, { includedCategoryCount } from '../components/settings/CategorySelector';
import RoundTypeSelector, { includedRoundTypeCount } from '../components/settings/RoundTypeSelector';
import { ALL_ROUND_TYPES } from '../constants/roundTypes';
import layout from '../styles/lobbyLayout.module.css';
import styles from './CreateRoomPage.module.css';

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 12;
const POINT_STEP = 10;

export interface PendingRoomSettings {
  maxPlayers: number;
  pointLimit: number;
  timePerAnswer: number;
  excludedCategoryIds: number[];
  excludedRoundTypes: RoundType[];
}

export const PENDING_SETTINGS_KEY = 'pendingRoomSettings';

export default function CreateRoomPage() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<QuestionCategoryResponse[]>([]);
  const [excludedIds, setExcludedIds] = useState<number[]>([]);
  const [excludedRoundTypes, setExcludedRoundTypes] = useState<RoundType[]>([]);
  const [pointLimit, setPointLimit] = useState(100);
  const [maxPlayers, setMaxPlayers] = useState(8);
  const [timePerAnswer, setTimePerAnswer] = useState(30);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  function handlePointLimitChange(raw: number) {
    const snapped = Math.round(raw / POINT_STEP) * POINT_STEP;
    setPointLimit(Math.max(10, Math.min(1000, snapped)));
  }

  function handleContinue() {
    const settings: PendingRoomSettings = {
      maxPlayers: Math.max(MIN_PLAYERS, Math.min(MAX_PLAYERS, maxPlayers)),
      pointLimit: Math.max(10, Math.min(1000, Math.round(pointLimit / POINT_STEP) * POINT_STEP)),
      timePerAnswer: Math.max(5, Math.min(120, timePerAnswer)),
      excludedCategoryIds: excludedIds,
      excludedRoundTypes,
    };
    sessionStorage.setItem(PENDING_SETTINGS_KEY, JSON.stringify(settings));
    navigate('/join?host=true');
  }

  return (
    <div className={layout.page}>
      <div className={layout.columns}>

        <div className={layout.left}>

          <button className={styles.backLink} onClick={() => navigate('/')}>
            ← Wróć na stronę główną
          </button>

          <div className={styles.pageHeader}>
            <h1 className={styles.title}>Utwórz pokój gry</h1>
            <p className={styles.subtitle}>Skonfiguruj ustawienia gry, a potem ustaw swój profil</p>
          </div>

          {categories.length > 0 && (
            <div className={styles.formSection}>
              <div className={styles.sectionBody}>
                <CategorySelector
                  categories={categories}
                  excludedIds={excludedIds}
                  onChange={setExcludedIds}
                  variant="grid"
                />
              </div>
            </div>
          )}

          <div className={styles.formSection}>
            <div className={styles.sectionBody}>
              <RoundTypeSelector
                excludedTypes={excludedRoundTypes}
                onChange={setExcludedRoundTypes}
                variant="grid"
              />
            </div>
          </div>

          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Ustawienia gry</h2>
            <div className={styles.inputs}>
              <Input
                label="Punkty do wygranej (wielokrotności 10)"
                type="number"
                value={pointLimit}
                onChange={(e) => handlePointLimitChange(Number(e.target.value))}
                min={10}
                max={1000}
                step={POINT_STEP}
              />
              <Input
                label={`Maksymalna liczba graczy (${MIN_PLAYERS}-${MAX_PLAYERS})`}
                type="number"
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(Number(e.target.value))}
                min={MIN_PLAYERS}
                max={MAX_PLAYERS}
              />
              <Input
                label="Limit czasu na odpowiedź (sekundy)"
                type="number"
                value={timePerAnswer}
                onChange={(e) => setTimePerAnswer(Number(e.target.value))}
                min={5}
                max={120}
              />
            </div>
          </div>

        </div>

        <div className={layout.right}>

          <Card padded={false}>
            <div className={styles.panelSection}>
              <p className={styles.panelTitle}>Podsumowanie ustawień</p>
              <div className={styles.summaryRows}>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Typy rund</span>
                  <span className={styles.summaryValue}>
                    {includedRoundTypeCount(excludedRoundTypes)}/{ALL_ROUND_TYPES.length} aktywne
                  </span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Kategorie</span>
                  <span className={styles.summaryValue}>
                    {includedCategoryCount(categories, excludedIds)}/{categories.length} aktywne
                  </span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Punkty do wygranej</span>
                  <span className={styles.summaryValue}>{pointLimit}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Maks. graczy</span>
                  <span className={styles.summaryValue}>{maxPlayers}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Limit czasu</span>
                  <span className={styles.summaryValue}>{timePerAnswer}s</span>
                </div>
              </div>

              <Button onClick={handleContinue} fullWidth>
                Wybierz awatar
              </Button>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
