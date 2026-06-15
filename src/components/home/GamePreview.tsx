import { useState, useEffect } from 'react';
import styles from './GamePreview.module.css';

type Phase = 'question' | 'voting' | 'results';

const PHASE_ORDER: Phase[] = ['question', 'voting', 'results'];

const DURATION: Record<Phase, number> = {
  question: 4000,
  voting: 2200,
  results: 2800,
};

const OPTIONS = [
  { id: 'a', text: 'Maraton seriali', votes: 3, pct: 75, winner: true },
  { id: 'b', text: 'Nocne wypady po płatki', votes: 1, pct: 25, winner: false },
  { id: 'c', text: 'Śpiew pod prysznicem', votes: 0, pct: 0,  winner: false },
  { id: 'd', text: 'Kolekcjonowanie breloczków',  votes: 0, pct: 0,  winner: false },
];

const PLAYERS = [
  { id: 'p1', name: 'Marek', score: 30, correct: true,  color: '#3b82f6' },
  { id: 'p2', name: 'Ania',  score: 25, correct: true,  color: '#8b5cf6' },
  { id: 'p3', name: 'Kasia', score: 20, correct: true,  color: '#ec4899' },
  { id: 'p4', name: 'Tomek', score: 15, correct: false, color: '#10b981' },
];

const CONFETTI = [
  '#f97316','#22c55e','#3b82f6','#8b5cf6',
  '#ec4899','#f59e0b','#f97316','#22c55e',
  '#3b82f6','#8b5cf6','#ec4899','#f59e0b',
];

function CheckIcon() {
  return (
    <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 6l3 3 5-5" />
    </svg>
  );
}

export default function GamePreview() {
  const [phase, setPhase] = useState<Phase>('question');
  const [cycle, setCycle] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);

  useEffect(() => {
    const t = setTimeout(() => {
      setPhase(prev => {
        const next = PHASE_ORDER[(PHASE_ORDER.indexOf(prev) + 1) % PHASE_ORDER.length];
        if (next === 'question') setCycle(c => c + 1);
        return next;
      });
    }, DURATION[phase]);
    return () => clearTimeout(t);
  }, [phase, cycle]);

  useEffect(() => {
    if (phase !== 'question') return;
    setTimeLeft(20);
    const id = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [phase, cycle]);

  const phaseIdx = PHASE_ORDER.indexOf(phase);

  return (
    <div className={styles.preview}>
      <div className={styles.header}>
        <span className={styles.liveBadge}>
          <span className={styles.liveDot} />
          Demo na żywo
        </span>
        <div className={styles.phasePips}>
          {PHASE_ORDER.map((p, i) => (
            <span key={p} className={`${styles.pip} ${i === phaseIdx ? styles.pipActive : i < phaseIdx ? styles.pipDone : ''}`} />
          ))}
        </div>
        <span className={styles.phaseLabel}>
          {phase === 'question' ? 'Odpowiadanie' : phase === 'voting' ? 'Głosowanie' : 'Wyniki!'}
        </span>
      </div>

      <div className={styles.body}>
        <div className={styles.main} key={`${phase}-${cycle}`}>

          {phase === 'question' && (
            <div className={styles.fade}>
              <div className={styles.roundRow}>
                <span className={styles.roundTag}>Runda 3 · Nawyki</span>
                <span className={styles.timerNum}>{timeLeft}s</span>
              </div>
              <div className={styles.timerTrack}>
                <div className={styles.timerFill} style={{ animationDuration: `${DURATION.question}ms` }} />
              </div>
              <p className={styles.question}>Jaka jest ukryta słabość Ani?</p>
              <div className={styles.options}>
                {OPTIONS.map(opt => (
                  <div key={opt.id} className={styles.option}>
                    <span className={styles.optLetter}>{opt.id.toUpperCase()}</span>
                    <span className={styles.optText}>{opt.text}</span>
                  </div>
                ))}
              </div>
              <div className={styles.thinking}>
                <div className={styles.thinkDots}>
                  {PLAYERS.map((p, i) => (
                    <span key={p.id} className={styles.thinkDot} style={{ animationDelay: `${i * 0.18}s`, background: p.color }} />
                  ))}
                </div>
                <span>4 graczy myśli…</span>
              </div>
            </div>
          )}

          {phase === 'voting' && (
            <div className={styles.fade}>
              <div className={styles.roundRow}>
                <span className={styles.roundTag}>Runda 3 · Nawyki</span>
                <span className={styles.allVoted}>✓ Wszyscy zagłosowali!</span>
              </div>
              <p className={styles.question}>Jaka jest ukryta słabość Ani?</p>
              <div className={styles.optionsVote}>
                {OPTIONS.map((opt, i) => (
                  <div key={opt.id} className={styles.optionVote} style={{ animationDelay: `${i * 0.08}s` }}>
                    <div className={styles.optVoteTop}>
                      <span className={styles.optText}>{opt.text}</span>
                      <span className={styles.voteCount}>
                        {opt.votes} {opt.votes === 1 ? 'głos' : opt.votes >= 2 && opt.votes <= 4 ? 'głosy' : 'głosów'}
                      </span>
                    </div>
                    <div className={styles.barTrack}>
                      <div
                        className={styles.barFill}
                        style={{ '--pct': `${opt.pct}%`, animationDelay: `${0.2 + i * 0.1}s` } as React.CSSProperties}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {phase === 'results' && (
            <div className={styles.fade}>
              <div className={styles.roundRow}>
                <span className={styles.resultTag}>🎉 Runda zakończona!</span>
              </div>
              <div className={styles.winnerBox}>
                <span className={styles.winnerLabel}>Zwycięska odpowiedź</span>
                <span className={styles.winnerText}>Maraton seriali</span>
              </div>
              <div className={styles.optionsResult}>
                {OPTIONS.map((opt, i) => (
                  <div
                    key={opt.id}
                    className={`${styles.optionResult} ${opt.winner ? styles.optionWinner : styles.optionLoser}`}
                    style={{ animationDelay: `${i * 0.07}s` }}
                  >
                    {opt.winner && <span className={styles.winStar}>★</span>}
                    <span className={styles.optText}>{opt.text}</span>
                    {opt.pct > 0 && <span className={styles.voteCount}>{opt.pct}%</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        <div className={styles.sidebar}>
          <span className={styles.sideTitle}>
            {phase === 'results' ? 'Aktualne wyniki' : 'Gracze'}
          </span>
          <div className={styles.playerList}>
            {PLAYERS.map((p, i) => {
              const newScore = phase === 'results' && p.correct ? p.score + 10 : p.score;
              return (
                <div key={p.id} className={styles.playerRow} style={{ animationDelay: `${i * 0.06}s` }}>
                  <span className={styles.playerAvatar} style={{ background: p.color }} />
                  <span className={styles.playerName}>{p.name}</span>

                  {phase === 'question' && (
                    <span className={styles.thinkingIndicator} style={{ animationDelay: `${i * 0.18}s` }} />
                  )}

                  {phase === 'voting' && (
                    <span className={styles.votedBadge} style={{ animationDelay: `${i * 0.15}s` }}>
                      <CheckIcon />
                    </span>
                  )}

                  {phase === 'results' && p.correct && (
                    <span className={styles.pointsBadge} style={{ animationDelay: `${i * 0.12}s` }}>+10</span>
                  )}

                  <span className={styles.playerScore}>{newScore}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {phase === 'results' && (
        <div className={styles.confetti} key={`confetti-${cycle}`}>
          {CONFETTI.map((color, i) => (
            <span
              key={i}
              className={styles.confettiDot}
              style={{
                left: `${6 + i * 7.5}%`,
                background: color,
                animationDuration: `${0.9 + (i % 4) * 0.25}s`,
                animationDelay: `${(i % 6) * 0.12}s`,
                width: `${4 + (i % 3) * 3}px`,
                height: `${4 + (i % 3) * 3}px`,
                borderRadius: i % 2 === 0 ? '50%' : '2px',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
