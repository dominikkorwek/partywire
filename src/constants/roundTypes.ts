import type { RoundType } from '../types/api';

export const ALL_ROUND_TYPES: RoundType[] = [
  'GUESS_PLAYER_ANSWER',
  'REUSE_QUESTION',
  'VOTE_PERSON',
  'PLAYER_CREATES_QUESTION',
  'BEST_ANSWER',
];

export const ROUND_TYPE_LABELS: Record<RoundType, string> = {
  GUESS_PLAYER_ANSWER: 'Zgadnij odpowiedź',
  REUSE_QUESTION: 'Klasyczne pytanie',
  VOTE_PERSON: 'Głosowanie na osobę',
  PLAYER_CREATES_QUESTION: 'Własne pytanie',
  BEST_ANSWER: 'Najlepsza odpowiedź',
};

export function toggleRoundTypeExclusion(excluded: RoundType[], roundType: RoundType): RoundType[] {
  return excluded.includes(roundType)
    ? excluded.filter((t) => t !== roundType)
    : [...excluded, roundType];
}

export function includedRoundTypeCount(excluded: RoundType[]): number {
  return ALL_ROUND_TYPES.length - excluded.length;
}
