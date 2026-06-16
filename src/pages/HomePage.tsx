import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { getAuthMe, getRoomByCode, startHostSsoLogin } from '../services/api';
import styles from './HomePage.module.css';

const HOST_LOGIN_INTENT_KEY = 'hostLoginIntent';
const AUTH_CHECK_TIMEOUT_MS = 1500;

async function getAuthMeWithTimeout() {
  return Promise.race([
    getAuthMe(),
    new Promise<null>((resolve) => {
      window.setTimeout(() => resolve(null), AUTH_CHECK_TIMEOUT_MS);
    }),
  ]);
}

export default function HomePage() {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [hostLoading, setHostLoading] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(HOST_LOGIN_INTENT_KEY) !== 'create-room') return;
    let cancelled = false;
    getAuthMeWithTimeout()
      .then((auth) => {
        if (cancelled || !auth?.authenticated) return;
        sessionStorage.removeItem(HOST_LOGIN_INTENT_KEY);
        navigate('/create-room');
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [navigate]);

  async function handleCreateRoom() {
    setHostLoading(true);
    try {
      const auth = await getAuthMeWithTimeout();
      if (auth?.authenticated) {
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

      </div>
    </PageLayout>
  );
}
