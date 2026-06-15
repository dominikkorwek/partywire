import type { RoundType } from '../types/api';
import { ROUND_TYPE_LABELS } from './roundTypes';

export interface RoundTypeTutorialContent {
  title: string;
  steps: string[];
  tip?: string;
}

export const ROUND_TYPE_TUTORIALS: Record<RoundType, RoundTypeTutorialContent> = {
  GUESS_PLAYER_ANSWER: {
    title: ROUND_TYPE_LABELS.GUESS_PLAYER_ANSWER,
    steps: [
      'Wybrany gracz dostaje pytanie i wpisuje 4 odpowiedzi: 3 fałszywe i 1 prawdziwą.',
      'Następnie wskazuje, która odpowiedź jest jego prawdziwa.',
      'Pozostali gracze zgadują poprawną odpowiedź, trafienie daje punkt.',
    ],
    tip: 'Wybrany gracz nie bierze udziału w zgadywaniu.',
  },
  REUSE_QUESTION: {
    title: ROUND_TYPE_LABELS.REUSE_QUESTION,
    steps: [
      'Losowe pytanie o wybranym graczu wraz z 4 gotowymi odpowiedziami.',
      'Wybrany gracz wskazuje, która odpowiedź jest jego prawdziwa, nie wpisuje opcji.',
      'Pozostali gracze zgadują poprawną odpowiedź, trafienie daje punkt.',
    ],
    tip: 'Wybrany gracz nie wpisuje odpowiedzi, tylko wybiera jedną z czterech.',
  },
  VOTE_PERSON: {
    title: ROUND_TYPE_LABELS.VOTE_PERSON,
    steps: [
      'Wszyscy widzą wspólne pytanie o grupie.',
      'Głosujecie na osobę, która najlepiej pasuje do opisu.',
      'Osoba z największą liczbą głosów wygrywa rundę. Przy remisie, ponowne głosowanie.',
    ],
  },
  PLAYER_CREATES_QUESTION: {
    title: ROUND_TYPE_LABELS.PLAYER_CREATES_QUESTION,
    steps: [
      'Wybrany gracz tworzy pytanie i wpisuje 3 fałszywe oraz 1 prawdziwą odpowiedź.',
      'Potem wskazuje swoją prawdziwą odpowiedź.',
      'Pozostali gracze zgadują poprawną opcję.',
    ],
  },
  BEST_ANSWER: {
    title: ROUND_TYPE_LABELS.BEST_ANSWER,
    steps: [
      'Pytanie dotyczy jednego wybranego gracza, wszyscy oprócz niego piszą odpowiedź.',
      'Wybrany gracz czeka i nie pisze, po czasie wybiera najlepszą odpowiedź z listy.',
      'Autor wybranej odpowiedzi zdobywa punkt.',
    ],
    tip: 'Wybrany gracz nie pisze odpowiedzi, tylko wybiera zwycięzcę.',
  },
};
