import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import AvatarPicker, { AvatarDisplay, AVATAR_COLORS } from '../components/join/AvatarPicker';
import type { AvatarConfig } from '../components/join/AvatarPicker';
import { generateRandomProfile } from '../utils/randomProfile';
import { getRoomByCode, joinRoom, createRoom, updateSettings, getCategories } from '../services/api';
import { usePlayer } from '../context/PlayerContext';
import { PENDING_SETTINGS_KEY } from './CreateRoomPage';
import type { PendingRoomSettings } from './CreateRoomPage';
import { includedCategoryCount } from '../components/settings/CategorySelector';
import { includedRoundTypeCount } from '../components/settings/RoundTypeSelector';
import { ALL_ROUND_TYPES } from '../constants/roundTypes';
import type { RoomResponse, QuestionCategoryResponse } from '../types/api';
import Toast from '../components/ui/Toast';
import layout from '../styles/lobbyLayout.module.css';
import styles from './JoinRoomPage.module.css';

function PersonIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8H4z" />
    </svg>
  );
}

function DoorIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm4 12H8v-1c0-2.2 1.8-4 4-4s4 1.8 4 4v1z" />
    </svg>
  );
}

const DEFAULT_AVATAR: AvatarConfig = {
  animalId: 'cat',
  color: AVATAR_COLORS[0].value,
};

export default function JoinRoomPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { setSession } = usePlayer();

  const code = (params.get('code') ?? '').toUpperCase();
  const isHost = params.get('host') === 'true';

  const [pendingSettings] = useState<PendingRoomSettings | null>(() => {
    if (!isHost) return null;
    const raw = sessionStorage.getItem(PENDING_SETTINGS_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as PendingRoomSettings;
    } catch {
      return null;
    }
  });
  const [room, setRoom] = useState<RoomResponse | null>(null);
  const [blockingJoinError, setBlockingJoinError] = useState<{ code: string; message: string } | null>(null);
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState<AvatarConfig>(DEFAULT_AVATAR);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [toast, setToast] = useState('');
  const [categories, setCategories] = useState<QuestionCategoryResponse[]>([]);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isHost) return;
    if (!code) return;
    let cancelled = false;
    getRoomByCode(code)
      .then((nextRoom) => {
        if (cancelled) return;
        setRoom(nextRoom);
        setBlockingJoinError(null);
      })
      .catch(() => {
        if (cancelled) return;
        setRoom(null);
        setBlockingJoinError({ code, message: 'Nie znaleziono pokoju' });
      });
    return () => { cancelled = true; };
  }, [code, isHost]);

  function handleRandomize() {
    const { nickname: randomNick, avatar: randomAvatar } = generateRandomProfile();
    setNickname(randomNick);
    setAvatar(randomAvatar);
  }

  async function handleJoin() {
    const trimmed = nickname.trim();
    if (!trimmed) { setToast('Wpisz swój nickname, aby kontynuować'); return; }
    if (trimmed.length < 2) { setToast('Nickname musi mieć co najmniej 2 znaki'); return; }
    if (trimmed.length > 30) { setToast('Nickname może mieć maksymalnie 30 znaków'); return; }
    setLoading(true);
    setApiError('');

    try {
      if (isHost) {
        const settings = pendingSettings ?? {
          maxPlayers: 8,
          pointLimit: 100,
          timePerAnswer: 30,
          excludedCategoryIds: [],
          excludedRoundTypes: [],
        };
        const { player, room: newRoom } = await createRoom(trimmed, settings.maxPlayers, avatar.animalId, avatar.color);
        await updateSettings(newRoom.code, {
          pointLimit: settings.pointLimit,
          timePerAnswer: settings.timePerAnswer,
          excludedCategoryIds: settings.excludedCategoryIds,
          excludedRoundTypes: settings.excludedRoundTypes,
        });
        sessionStorage.removeItem(PENDING_SETTINGS_KEY);
        setSession({
          playerId: player.id,
          nickname: player.nickname,
          roomCode: newRoom.code,
          isHost: true,
          avatar: {
            animalId: player.avatarAnimal ?? avatar.animalId,
            color: player.avatarColor ?? avatar.color,
          },
        });
        navigate('/lobby');
        return;
      }

      const { player } = await joinRoom(code, trimmed, avatar.animalId, avatar.color);
      setSession({
        playerId: player.id,
        nickname: player.nickname,
        roomCode: code,
        isHost: false,
        avatar: {
          animalId: player.avatarAnimal ?? avatar.animalId,
          color: player.avatarColor ?? avatar.color,
        },
      });
      navigate('/lobby');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Nie udało się dołączyć do pokoju';
      const blockingJoinError = !isHost && (
        message.toLowerCase().includes('nie istnieje')
        || message.toLowerCase().includes('pełny')
      );
      if (blockingJoinError) {
        setRoom(null);
        setBlockingJoinError({ code, message });
      } else {
        setApiError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  const verifiedRoom = room?.code.toUpperCase() === code ? room : null;
  const roomError = !isHost
    ? (!code
      ? 'Nie podano kodu pokoju'
      : blockingJoinError?.code === code
        ? blockingJoinError.message
        : '')
    : '';
  const roomLoading = !isHost && !!code && !verifiedRoom && !roomError;
  const isFull = verifiedRoom ? verifiedRoom.currentPlayers >= verifiedRoom.maxPlayers : false;
  const joinBlockedMessage = !isHost
    ? (roomLoading ? 'Sprawdzanie pokoju…' : roomError || (isFull ? 'Pokój jest pełny' : ''))
    : '';
  const canShowJoinForm = isHost || (!!verifiedRoom && !roomLoading && !roomError && !isFull);
  const occupiedSlots = verifiedRoom?.players ?? [];
  const previewMaxPlayers = isHost ? (pendingSettings?.maxPlayers ?? 8) : (verifiedRoom?.maxPlayers ?? 0);
  const emptySlots = isHost
    ? Math.max(0, previewMaxPlayers - 1)
    : (verifiedRoom ? Math.max(0, verifiedRoom.maxPlayers - verifiedRoom.currentPlayers - 1) : 0);

  return (
    <>
    <div className={layout.page}>
      <div className={layout.columns}>

        <div className={layout.left}>

          <button className={styles.backLink} onClick={() => navigate(isHost ? '/create-room' : '/')}>
            ← {isHost ? 'Wróć do konfiguracji pokoju' : 'Wróć na stronę główną'}
          </button>

          <div className={styles.pageHeader}>
            <span className={styles.badge}>
              <DoorIcon />
              {isHost ? 'Twój profil' : 'Dołącz do pokoju'}
            </span>
            <h1 className={styles.title}>{isHost ? 'Skonfiguruj swój profil' : 'Dołącz do gry'}</h1>
            <p className={styles.subtitle}>
              {isHost
                ? 'Wpisz nickname i wybierz awatar, pokój zostanie utworzony po kontynuacji'
                : 'Wpisz nickname i wybierz awatar, aby dołączyć do sesji'}
            </p>
          </div>

          <Card padded={false}>
            <div className={styles.roomConfirm}>
              <span className={styles.roomLabel}>Kod pokoju</span>
              <span className={styles.roomCode}>{code || '-'}</span>
              {isFull && !isHost && <span className={styles.fullBadge}>Pokój pełny</span>}
            </div>
          </Card>

          {!canShowJoinForm ? (
            <Card padded={false}>
              <div className={styles.statusCard}>
                <p className={styles.panelLabel}>
                  {roomLoading ? 'Sprawdzanie pokoju' : 'Nie można dołączyć'}
                </p>
                <p className={roomLoading ? styles.statusText : styles.errorText}>
                  {joinBlockedMessage}
                </p>
                {!roomLoading && (
                  <Button
                    type="button"
                    variant="secondary"
                    fullWidth={false}
                    onClick={() => navigate('/')}
                  >
                    Wróć i wpisz inny kod
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <>
              <AvatarPicker value={avatar} onChange={setAvatar} />

              <div className={styles.nicknameSection}>
                <div className={styles.nicknameRow}>
                  <Input
                    label="Twój nickname"
                    placeholder="np. cierpliwa panda"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                    maxLength={30}
                    autoFocus
                  />
                  <Button type="button" variant="secondary" fullWidth={false} onClick={handleRandomize} className={styles.randomBtn}>
                    Losuj
                  </Button>
                </div>
                <p className={styles.nicknameHint}>Możesz wpisać własny nick albo wylosować, np. „nieśmiały kot”</p>
              </div>

              {apiError && <p className={styles.errorText}>{apiError}</p>}

              <Button
                onClick={handleJoin}
                disabled={loading}
              >
                {loading ? (isHost ? 'Tworzenie pokoju…' : 'Dołączanie…') : isHost ? 'Utwórz pokój i wejdź do lobby' : 'Dołącz do gry'}
              </Button>
            </>
          )}

        </div>

        <div className={layout.right}>

          {(isHost || canShowJoinForm) && (
            <Card padded={false}>
              <div className={styles.panel}>
                <p className={styles.panelLabel}>Podgląd pokoju</p>

                <div className={styles.playerCount}>
                  <PersonIcon size={16} />
                  <span>
                    {isHost
                      ? `1 / ${previewMaxPlayers} graczy`
                      : verifiedRoom ? `${verifiedRoom.currentPlayers + 1} / ${verifiedRoom.maxPlayers} graczy` : '- / -'}
                  </span>
                </div>

                <div className={styles.playerList}>

                  {occupiedSlots.map((p) => (
                    <div key={p.id} className={styles.playerRow}>
                      <AvatarDisplay
                        animalId={p.avatarAnimal ?? 'cat'}
                        color={p.avatarColor ?? '#f97316'}
                        size={28}
                      />
                      <span className={styles.playerName}>{p.nickname}</span>
                      {p.isHost && <span className={styles.hostTag}>Host</span>}
                    </div>
                  ))}

                  <div className={`${styles.playerRow} ${styles.youRow}`}>
                    <AvatarDisplay animalId={avatar.animalId} color={avatar.color} size={28} />
                    <span className={styles.playerName}>{nickname.trim() || 'Ty'}</span>
                    <span className={styles.youTag}>{isHost ? 'Host' : 'Dołączasz…'}</span>
                  </div>

                  {emptySlots > 0 &&
                    Array.from({ length: Math.min(emptySlots, 4) }).map((_, i) => (
                      <div key={`empty-${i}`} className={`${styles.playerRow} ${styles.emptyRow}`}>
                        <div className={`${styles.playerAvatar} ${styles.emptyAvatar}`}>
                          <PersonIcon size={14} />
                        </div>
                        <span className={styles.emptySlot}>Oczekiwanie na gracza…</span>
                      </div>
                    ))}

                </div>
              </div>
            </Card>
          )}

          {(isHost ? pendingSettings : verifiedRoom) && (
            <Card padded={false}>
              <div className={styles.panel}>
                <p className={styles.panelLabel}>Ustawienia gry</p>
                <div className={styles.settingsList}>
                  <div className={styles.settingRow}>
                    <span className={styles.settingKey}>Punkty do wygranej</span>
                    <span className={styles.settingVal}>
                      {isHost ? pendingSettings!.pointLimit : '-'}
                    </span>
                  </div>
                  <div className={styles.settingRow}>
                    <span className={styles.settingKey}>Czas na odpowiedź</span>
                    <span className={styles.settingVal}>
                      {isHost ? `${pendingSettings!.timePerAnswer}s` : '-'}
                    </span>
                  </div>
                  <div className={styles.settingRow}>
                    <span className={styles.settingKey}>Maks. graczy</span>
                    <span className={styles.settingVal}>{previewMaxPlayers}</span>
                  </div>
                  {isHost && pendingSettings && categories.length > 0 && (
                    <div className={styles.settingRow}>
                      <span className={styles.settingKey}>Kategorie</span>
                      <span className={styles.settingVal}>
                        {includedCategoryCount(categories, pendingSettings.excludedCategoryIds)}/{categories.length} aktywne
                      </span>
                    </div>
                  )}
                  {isHost && pendingSettings && (
                    <div className={styles.settingRow}>
                      <span className={styles.settingKey}>Typy rund</span>
                      <span className={styles.settingVal}>
                        {includedRoundTypeCount(pendingSettings.excludedRoundTypes)}/{ALL_ROUND_TYPES.length} aktywne
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

        </div>
      </div>
    </div>

    {toast && <Toast message={toast} onDismiss={() => setToast('')} />}
    </>
  );
}
