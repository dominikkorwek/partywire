import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import GamePreview from '../components/home/GamePreview';
import { getAuthMe, getRoomByCode, startHostSsoLogin } from '../services/api';
import styles from './HomePage.module.css';

const HOST_LOGIN_INTENT_KEY = 'hostLoginIntent';

function IconGame() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="8" y1="12" x2="12" y2="12" />
      <line x1="10" y1="10" x2="10" y2="14" />
      <circle cx="16" cy="11" r="1" fill="currentColor" stroke="none" />
      <circle cx="18" cy="13" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconGroup() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="7" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17" cy="8" r="2.5" />
      <path d="M21 20c0-2.8-1.8-5-4-5.5" />
    </svg>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [hostLoading, setHostLoading] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(HOST_LOGIN_INTENT_KEY) !== 'create-room') return;
    let cancelled = false;
    getAuthMe()
      .then((auth) => {
        if (cancelled || !auth.authenticated) return;
        sessionStorage.removeItem(HOST_LOGIN_INTENT_KEY);
        navigate('/create-room');
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [navigate]);

  async function handleCreateRoom() {
    setHostLoading(true);
    try {
      const auth = await getAuthMe();
      if (auth.authenticated) {
        navigate('/create-room');
        return;
      }
      sessionStorage.setItem(HOST_LOGIN_INTENT_KEY, 'create-room');
      startHostSsoLogin();
    } catch {
      sessionStorage.setItem(HOST_LOGIN_INTENT_KEY, 'create-room');
      startHostSsoLogin();
    } finally {
      setHostLoading(false);
    }
  }

  async function handleJoin() {
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    if (!/^[A-Z0-9]{6}$/.test(code)) {
      setJoinError('Kod pokoju powinien mieć 6 znaków: litery i cyfry.');
      return;
    }

    setJoinLoading(true);
    setJoinError('');
    try {
      const room = await getRoomByCode(code);
      if (room.currentPlayers >= room.maxPlayers) {
        setJoinError('Ten pokój jest już pełny.');
        return;
      }
      navigate(`/join?code=${encodeURIComponent(code)}`);
    } catch {
      setJoinError('Nie znaleziono pokoju o takim kodzie.');
    } finally {
      setJoinLoading(false);
    }
  }

  return (
    <PageLayout wide>
      <div className={styles.page}>

        <div className={styles.hero}>
          <span className={styles.eyebrow}>Połączmy się razem!</span>
          <h1 className={styles.title}>Party Wire</h1>
          <p className={styles.subtitle}>
            Gra towarzyska na żywo. Odpowiadaj na pytania, głosuj,
            rywalizuj i sprawdź, kto najlepiej zna grupę.
          </p>
        </div>

        <div className={styles.actions}>
          <Button onClick={handleCreateRoom} disabled={hostLoading}>
            {hostLoading ? 'Sprawdzanie logowania…' : 'Utwórz pokój gry'}
          </Button>

          <p className={styles.orText}>lub dołącz do istniejącego pokoju (kod, link lub QR)</p>

          <div className={styles.joinRow}>
            <div className={styles.joinInput}>
              <Input
                placeholder="Wpisz kod pokoju (np. ABC123)"
                value={joinCode}
                onChange={(e) => {
                  setJoinCode(e.target.value.toUpperCase());
                  if (joinError) setJoinError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                maxLength={8}
                error={!!joinError}
                helperText={joinError}
              />
            </div>
            <Button
              variant="secondary"
              fullWidth={false}
              onClick={handleJoin}
              disabled={!joinCode.trim() || joinLoading}
            >
              {joinLoading ? 'Sprawdzanie…' : 'Dołącz'}
            </Button>
          </div>
        </div>

        <div className={styles.features}>
          <button className={`${styles.featureCardBtn} ${showPreview ? styles.featureCardBtnActive : ''}`} onClick={() => setShowPreview(v => !v)}>
            <span className={styles.featureIcon}><IconGame /></span>
            <h3 className={styles.featureTitle}>Podgląd gry</h3>
            <p className={styles.featureText}>
              Gracze odpowiadają na pytania o sobie nawzajem. Najczęściej
              wybierana odpowiedź zdobywa punkty. Śledź wyniki na tablicy na żywo.
            </p>
            <span className={styles.previewHint}>
              {showPreview ? 'Ukryj demo ↑' : 'Zobacz demo ↓'}
            </span>
          </button>

          <Card padded={false}>
            <div className={styles.featureCard}>
              <span className={styles.featureIcon}><IconGroup /></span>
              <h3 className={styles.featureTitle}>Lobby wieloosobowe</h3>
              <p className={styles.featureText}>
                Udostępnij kod, link lub kod QR. Poczekaj, aż gracze dołączą. Host
                startuje grę, gdy wszyscy są gotowi. Od 3 do 12 graczy.
              </p>
            </div>
          </Card>
        </div>

        {showPreview && <GamePreview />}

      </div>
    </PageLayout>
  );
}
