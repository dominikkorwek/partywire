import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import RoundHeader from '../components/question/RoundHeader';
import AnswerOptionCard from '../components/question/AnswerOptionCard';
import Scoreboard from '../components/question/Scoreboard';
import WaitingForQuestion from '../components/question/WaitingForQuestion';
import QuestionCreateForm from '../components/question/QuestionCreateForm';
import ClassicQuestionPickForm from '../components/question/ClassicQuestionPickForm';
import VotePersonGrid from '../components/question/VotePersonGrid';
import FreeTextAnswer from '../components/question/FreeTextAnswer';
import { submitAnswer, submitQuestion, getGameState, expireRoundTime } from '../services/api';
import { connectRoom, disconnect } from '../services/stomp';
import { usePlayer } from '../context/PlayerContext';
import {
  isGuessRoundType,
  GUESS_PLAYER_HINT,
  GUESS_SELECTED_PLAYER_HINT,
  WAIT_FOR_OTHERS,
} from '../constants/guessRound';
import type { GameStateResponse, RoundResponse, AnswerResponse } from '../types/api';
import type { ScoreEntry } from '../types/game';
import styles from './QuestionPage.module.css';

function PersonIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8H4z" />
    </svg>
  );
}

function toScoreEntries(gs: GameStateResponse): ScoreEntry[] {
  return gs.ranking.map((s, idx) => ({
    playerId: s.player.id,
    nickname: s.player.nickname,
    totalScore: s.points,
    rank: idx + 1,
  }));
}

export default function QuestionPage() {
  const navigate = useNavigate();
  const { session, clearSession } = usePlayer();

  const roomCode = session?.roomCode ?? '';
  const playerId = session?.playerId ?? '';

  const [gameState, setGameState] = useState<GameStateResponse | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [timerActive, setTimerActive] = useState(false);

  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [freeText, setFreeText] = useState('');
  const [selectedVoteAnswerId, setSelectedVoteAnswerId] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const expiredPhaseKey = useRef<string | null>(null);

  const handleMessage = useCallback(
    (msg: GameStateResponse | { event?: string }) => {
      if ('event' in msg && msg.event === 'ROOM_CLOSED') {
        clearSession();
        navigate('/');
        return;
      }
      if (!('status' in msg)) return;
      const gs = msg as GameStateResponse;
      const stillInRoom = gs.room.players.some((player) => player.id === playerId);
      if (!stillInRoom) {
        clearSession();
        navigate('/');
        return;
      }
      setGameState(gs);

      if (gs.status === 'FINISHED') { navigate('/game/podium'); return; }

      const round = gs.currentRound;
      if (!round) return;

      if (round.status === 'COMPLETED') {
        navigate('/game/results');
        return;
      }

      if (round.status === 'WAITING_FOR_ANSWERS') {
        expiredPhaseKey.current = null;
        setTimeLeft(gs.timePerAnswer);
        setTimerActive(true);
        setSubmitted(false);
        setSelectedOptionId(null);
        setSelectedPersonId(null);
        setFreeText('');
        setSelectedVoteAnswerId(null);
      }

      if (round.status === 'REVEALING') {
        expiredPhaseKey.current = null;
        setTimeLeft(gs.timePerAnswer);
        setTimerActive(true);
        setSubmitted(false);
        setSelectedVoteAnswerId(null);
      }

      if (round.status === 'WAITING_FOR_QUESTION') {
        setTimerActive(false);
      }
    },
    [navigate, clearSession, playerId]
  );

  useEffect(() => {
    if (!roomCode) { navigate('/'); return; }

    let cancelled = false;
    getGameState(roomCode)
      .then((gs) => { if (!cancelled) handleMessage(gs); })
      .catch(() => { if (!cancelled) navigate('/'); });
    connectRoom(roomCode, playerId, (msg) => handleMessage(msg as GameStateResponse), undefined);

    return () => {
      cancelled = true;
      disconnect();
    };
  }, [roomCode, playerId, handleMessage, navigate]);

  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return;
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, timerActive]);

  const round: RoundResponse | null = gameState?.currentRound ?? null;

  useEffect(() => {
    if (!timerActive || timeLeft > 0 || !round) return;
    if (round.status !== 'WAITING_FOR_ANSWERS' && round.status !== 'REVEALING') return;

    const phaseKey = `${round.id}-${round.status}`;
    if (expiredPhaseKey.current === phaseKey) return;
    expiredPhaseKey.current = phaseKey;
    setTimerActive(false);

    let cancelled = false;
    expireRoundTime(round.id)
      .then((gs) => { if (!cancelled) handleMessage(gs); })
      .catch(() => { expiredPhaseKey.current = null; });

    return () => { cancelled = true; };
  }, [timeLeft, timerActive, round, handleMessage]);

  async function handleSubmitAnswer(answerId: number | null, ft: string | null, selectedAnswId: number | null) {
    const currentRound = gameState?.currentRound;
    if (!currentRound || submitted || loading) return;
    setLoading(true);
    try {
      await submitAnswer(currentRound.id, { playerId, answerId, freeText: ft, selectedAnswerId: selectedAnswId });
      setSubmitted(true);
      setTimerActive(false);
    } catch {
      // ignore, user can retry
    } finally {
      setLoading(false);
    }
  }

  function handleGuessSelect(answerId: number) {
    if (submitted || loading) return;
    setSelectedOptionId(answerId);
    handleSubmitAnswer(answerId, null, null);
  }

  function handlePersonVote(personId: string, round: RoundResponse) {
    if (submitted || loading) return;
    const ans = round.answers.find((a) => a.targetPlayer?.id === personId);
    if (!ans) return;
    setSelectedPersonId(personId);
    setSelectedOptionId(ans.id);
    handleSubmitAnswer(ans.id, null, null);
  }

  function handleBestAnswerPick(answerId: number) {
    if (submitted || loading) return;
    setSelectedVoteAnswerId(answerId);
    handleSubmitAnswer(answerId, null, null);
  }

  async function handleMarkClassicCorrect(correctAnswerId: number) {
    const currentRound = gameState?.currentRound;
    if (!currentRound || loading) return;
    setLoading(true);
    try {
      const gs = await submitQuestion(currentRound.id, {
        playerId,
        questionContent: '',
        answers: [],
        answersArePlayers: false,
        correctAnswerId,
      });
      handleMessage(gs);
    } catch {
      // retry allowed
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateQuestion(questionContent: string, answers: string[], correctIndex: number) {
    const currentRound = gameState?.currentRound;
    if (!currentRound) return;
    setLoading(true);
    try {
      const answerOptions = answers
        .filter((a) => a.trim())
        .map((a, i) => ({ content: a, correct: i === correctIndex, targetPlayerId: null }));
      await submitQuestion(currentRound.id, {
        playerId,
        questionContent,
        answers: answerOptions,
        answersArePlayers: false,
      });
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  const scoreboard: ScoreEntry[] = gameState ? toScoreEntries(gameState) : [];
  const winCondition = gameState?.pointLimit ?? 100;
  const totalPlayers = gameState?.room.currentPlayers ?? 0;
  const isSelectedPlayer = round?.selectedPlayer?.id === playerId;
  const isGuessRound = round ? isGuessRoundType(round.roundType) : false;
  const guessAnsweredCount = round?.answers.reduce((sum, a) => sum + a.voteCount, 0) ?? 0;
  const guessExpectedCount = Math.max(0, totalPlayers - 1);
  const bestAnswerWritersExpected = round?.roundType === 'BEST_ANSWER'
    ? Math.max(0, totalPlayers - (round.selectedPlayer ? 1 : 0))
    : 0;
  const bestAnswerWritersDone = round?.answers.filter((a) => a.author !== null).length ?? 0;
  const answeredCount = isGuessRound
    ? guessAnsweredCount
    : round?.roundType === 'BEST_ANSWER'
      ? bestAnswerWritersDone
      : (round?.answers.filter((a) => a.author !== null).length ?? 0);
  const answeredTotal = isGuessRound
    ? guessExpectedCount
    : round?.roundType === 'BEST_ANSWER'
      ? bestAnswerWritersExpected
      : totalPlayers;

  function renderBestAnswerSubjectCard(round: RoundResponse) {
    if (!round.selectedPlayer) return null;
    return (
      <Card padded={false}>
        <div className={styles.playerInfo}>
          <span className={styles.aboutBadge}>Pytanie dotyczy</span>
          <div className={styles.playerRow}>
            <div className={styles.playerAvatar}><PersonIcon /></div>
            <div>
              <p className={styles.playerName}>{round.selectedPlayer.nickname}</p>
              <p className={styles.playerSubtitle}>O tej osobie piszecie odpowiedzi</p>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  function renderBestAnswerRound(round: RoundResponse) {
    const myAnswer = round.answers.find((a: AnswerResponse) => a.author?.id === playerId);
    const judgeName = round.selectedPlayer?.nickname ?? 'Wybrany gracz';

    if (round.status === 'WAITING_FOR_ANSWERS') {
      if (isSelectedPlayer) {
        return (
          <>
            {renderBestAnswerSubjectCard(round)}
            <h2 className={styles.questionText}>{round.question?.content ?? ''}</h2>
            <p className={styles.statusHint}>
              Pozostali gracze piszą odpowiedzi. Ty wybierzesz najlepszą, gdy skończą.
            </p>
            {renderSubmitBar(null, WAIT_FOR_OTHERS)}
          </>
        );
      }

      return (
        <>
          {renderBestAnswerSubjectCard(round)}
          <h2 className={styles.questionText}>{round.question?.content ?? ''}</h2>
          {!submitted && (
            <p className={styles.statusHint}>Napisz, co Twoim zdaniem pasuje do {judgeName}.</p>
          )}
          {submitted && (
            <p className={styles.waitingMessage}>Odpowiedź wysłana! Oczekiwanie na pozostałych…</p>
          )}
          <FreeTextAnswer
            phase="writing"
            freeText={freeText}
            onFreeTextChange={setFreeText}
            answers={round.answers}
            selectedAnswerId={null}
            onSelectAnswer={() => {}}
            submitted={submitted}
            currentPlayerId={playerId}
            loading={loading}
          />
          {renderSubmitBar(
            !submitted ? (
              <Button fullWidth={false} disabled={!freeText.trim() || loading} onClick={() => handleSubmitAnswer(null, freeText, null)}>
                {loading ? 'Wysyłanie…' : 'Wyślij odpowiedź'}
              </Button>
            ) : null
          )}
        </>
      );
    }

    if (round.status === 'REVEALING') {
      if (isSelectedPlayer) {
        return (
          <>
            {renderBestAnswerSubjectCard(round)}
            <h2 className={styles.questionText}>{round.question?.content ?? ''}</h2>
            {!submitted && (
              <p className={styles.statusHint}>Wybierz najlepszą odpowiedź, kliknięcie od razu ją zatwierdza.</p>
            )}
            {submitted && (
              <p className={styles.waitingMessage}>{WAIT_FOR_OTHERS}</p>
            )}
            <FreeTextAnswer
              phase="voting"
              freeText=""
              onFreeTextChange={() => {}}
              answers={round.answers}
              selectedAnswerId={selectedVoteAnswerId}
              onSelectAnswer={handleBestAnswerPick}
              submitted={submitted}
              currentPlayerId={playerId}
              loading={loading}
              pickerMode
            />
            {renderSubmitBar(null)}
          </>
        );
      }

      if (!myAnswer) {
        return (
          <>
            {renderBestAnswerSubjectCard(round)}
            <h2 className={styles.questionText}>{round.question?.content ?? ''}</h2>
            <p className={styles.waitingMessage}>
              Nie zdążyłeś wysłać odpowiedzi. {judgeName} wybiera najlepszą z pozostałych…
            </p>
            {renderSubmitBar(null, WAIT_FOR_OTHERS)}
          </>
        );
      }

      return (
        <>
          {renderBestAnswerSubjectCard(round)}
          <h2 className={styles.questionText}>{round.question?.content ?? ''}</h2>
          <p className={styles.waitingMessage}>
            Oczekiwanie, aż {judgeName} wybierze najlepszą odpowiedź…
          </p>
          {renderSubmitBar(null, WAIT_FOR_OTHERS)}
        </>
      );
    }

    return null;
  }

  function renderQuestionContent() {
    if (!round) return <div className={styles.loadingText}>Ładowanie rundy…</div>;

    if (round.status === 'WAITING_FOR_QUESTION') {
      if (isSelectedPlayer) {
        if (round.roundType === 'REUSE_QUESTION') {
          return (
            <ClassicQuestionPickForm
              key={round.id}
              roundId={round.id}
              playerId={playerId}
              onSubmit={handleMarkClassicCorrect}
              loading={loading}
            />
          );
        }
        const existingQ =
          round.roundType === 'GUESS_PLAYER_ANSWER'
            ? (round.question?.content ?? undefined)
            : undefined;
        return <QuestionCreateForm key={round.id} onSubmit={handleCreateQuestion} loading={loading} existingQuestion={existingQ} />;
      }
      const waitingHint = round.roundType === 'REUSE_QUESTION'
        ? `${round.selectedPlayer?.nickname ?? 'Wybrany gracz'} wybiera swoją prawdziwą odpowiedź, poczekaj chwilę.`
        : `${round.selectedPlayer?.nickname ?? 'Wybrany gracz'} tworzy pytanie i odpowiedzi, poczekaj chwilę.`;
      return (
        <>
          <WaitingForQuestion selectedPlayerNickname={round.selectedPlayer?.nickname ?? 'Gracz'} />
          <p className={styles.statusHint}>{waitingHint}</p>
        </>
      );
    }

    if (round.status === 'WAITING_FOR_ANSWERS' || round.status === 'REVEALING') {
      const rt = round.roundType;

      if (rt === 'VOTE_PERSON') {
        const votePlayers = round.answers
          .map((a) => a.targetPlayer)
          .filter((p): p is NonNullable<typeof p> => p != null);

        return (
          <>
            <h2 className={styles.questionText}>{round.question?.content ?? ''}</h2>
            {round.tiebreakRevote && (
              <p className={styles.tiebreakNotice}>
                Remis! Głosuj ponownie, w grze zostały tylko osoby z remisem.
              </p>
            )}
            {!submitted && (
              <p className={styles.statusHint}>Kliknij osobę pasującą do pytania.</p>
            )}
            {submitted && (
              <p className={styles.waitingMessage}>{WAIT_FOR_OTHERS}</p>
            )}
            <VotePersonGrid
              players={votePlayers}
              selectedId={selectedPersonId}
              onSelect={(id) => handlePersonVote(id, round)}
              disabled={loading}
              locked={submitted}
            />
            {renderSubmitBar(null)}
          </>
        );
      }

      if (rt === 'BEST_ANSWER') {
        return renderBestAnswerRound(round);
      }

      if (isGuessRoundType(rt)) {
        return renderGuessRoundAnswers(round);
      }

      return null;
    }

    return null;
  }

  function renderGuessRoundAnswers(round: RoundResponse) {
    if (isSelectedPlayer) {
      return (
        <>
          <Card padded={false}>
            <div className={styles.playerInfo}>
              <span className={styles.aboutBadge}>Twoja runda</span>
              <div className={styles.playerRow}>
                <div className={styles.playerAvatar}><PersonIcon /></div>
                <div>
                  <p className={styles.playerName}>{round.selectedPlayer?.nickname}</p>
                  <p className={styles.playerSubtitle}>Podałeś odpowiedzi, nie zgadujesz</p>
                </div>
              </div>
            </div>
          </Card>

          <h2 className={styles.questionText}>{round.question?.content ?? ''}</h2>
          <p className={styles.statusHint}>{GUESS_SELECTED_PLAYER_HINT}</p>

          <div className={styles.options}>
            {round.answers.map((opt) => (
              <AnswerOptionCard
                key={opt.id}
                option={{ id: opt.id, content: opt.content, correct: opt.correct, voteCount: opt.voteCount, author: null, targetPlayer: null }}
                selected={false}
                onSelect={() => {}}
                readonly
              />
            ))}
          </div>

          {renderSubmitBar(null, WAIT_FOR_OTHERS)}
        </>
      );
    }

    return (
      <>
        {round.selectedPlayer && (
          <Card padded={false}>
            <div className={styles.playerInfo}>
              <span className={styles.aboutBadge}>O tym graczu</span>
              <div className={styles.playerRow}>
                <div className={styles.playerAvatar}><PersonIcon /></div>
                <div>
                  <p className={styles.playerName}>{round.selectedPlayer.nickname}</p>
                  <p className={styles.playerSubtitle}>Wybrany gracz w tej rundzie</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        <h2 className={styles.questionText}>{round.question?.content ?? ''}</h2>
        {!submitted && (
          <p className={styles.statusHint}>{GUESS_PLAYER_HINT}</p>
        )}
        {submitted && (
          <p className={styles.waitingMessage}>{WAIT_FOR_OTHERS}</p>
        )}

        <div className={styles.options}>
          {round.answers.map((opt) => (
            <AnswerOptionCard
              key={opt.id}
              option={{ id: opt.id, content: opt.content, correct: opt.correct, voteCount: opt.voteCount, author: null, targetPlayer: null }}
              selected={selectedOptionId === opt.id}
              dimmed={submitted && selectedOptionId !== opt.id}
              onSelect={() => handleGuessSelect(opt.id)}
              disabled={submitted || loading}
            />
          ))}
        </div>

        {renderSubmitBar(null)}
      </>
    );
  }

  function renderSubmitBar(actionButton: React.ReactNode, waitingLabel?: string) {
    return (
      <div className={styles.bottomBar}>
        <div className={styles.answeredInfo}>
          <PersonIcon />
          <span>{answeredCount} z {answeredTotal} graczy odpowiedziało</span>
        </div>
        {waitingLabel ? (
          <span className={styles.pendingAction}>{waitingLabel}</span>
        ) : actionButton}
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.content}>

        <RoundHeader
          roundNumber={round?.roundNumber ?? 1}
          category={round?.question?.category ?? undefined}
          roundType={round?.roundType ?? 'GUESS_PLAYER_ANSWER'}
          timeLeft={timeLeft}
          timePerAnswer={gameState?.timePerAnswer ?? 30}
        />

        <div className={styles.columns}>

          <div className={styles.main}>
            {renderQuestionContent()}
          </div>

          <div className={styles.sidebar}>
            <Scoreboard entries={scoreboard} winCondition={winCondition} />

            <Card padded={false}>
              <div className={styles.sideSection}>
                <p className={styles.sideTitle}>Status rundy</p>
                <div className={styles.statusList}>
                  <div className={styles.statusItem}>
                    <span className={[styles.statusDot, round?.status === 'WAITING_FOR_QUESTION' ? styles.statusActive : round?.status === 'WAITING_FOR_ANSWERS' || round?.status === 'REVEALING' || round?.status === 'COMPLETED' ? styles.statusDone : styles.statusPending].join(' ')} />
                    <span className={styles.statusText}>
                      {round?.status === 'WAITING_FOR_QUESTION' && isSelectedPlayer
                        ? 'Twoja kolej, utwórz pytanie'
                        : round?.status === 'WAITING_FOR_QUESTION'
                          ? 'Oczekiwanie na pytanie'
                          : 'Pytanie gotowe'}
                    </span>
                  </div>
                  <div className={styles.statusItem}>
                    <span className={[styles.statusDot, round?.status === 'WAITING_FOR_ANSWERS' ? styles.statusActive : round?.status === 'REVEALING' || round?.status === 'COMPLETED' ? styles.statusDone : styles.statusPending].join(' ')} />
                    <span className={[styles.statusText, round?.status === 'WAITING_FOR_ANSWERS' ? styles.statusTextActive : styles.statusTextMuted].join(' ')}>
                      Oczekiwanie na odpowiedzi
                    </span>
                  </div>
                  <div className={styles.statusItem}>
                    <span className={[styles.statusDot, round?.status === 'REVEALING' ? styles.statusActive : styles.statusPending].join(' ')} />
                    <span className={[styles.statusText, styles.statusTextMuted].join(' ')}>
                      Ujawnienie wyników
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
