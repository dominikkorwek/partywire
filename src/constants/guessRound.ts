import type { RoundType } from '../types/api';

export function isGuessRoundType(roundType: RoundType): boolean {
  return roundType === 'GUESS_PLAYER_ANSWER'
    || roundType === 'REUSE_QUESTION'
    || roundType === 'PLAYER_CREATES_QUESTION';
}

export function isClassicQuestionRoundType(roundType: RoundType): boolean {
  return roundType === 'REUSE_QUESTION';
}

export const CLASSIC_PICK_HINT =
  'Pytanie i odpowiedzi są gotowe, wskaż tę, która naprawdę do Ciebie pasuje. Reszta graczy będzie zgadywać.';

export const GUESS_ANSWER_HINT =
  'Wpisz 4 odpowiedzi: 3 fałszywe (zmyślone) i 1 prawdziwa (twoja). Na kolejnym kroku wskażesz, która jest poprawna.';

export const GUESS_PICK_HINT =
  'Wskaż swoją prawdziwą odpowiedź. Reszta graczy będzie musiała odróżnić ją od fałszywych.';

export const   GUESS_PLAYER_HINT =
  'Jedna odpowiedź jest prawdziwa, a pozostałe to zmyślone opcje, kliknij tę, która pasuje do tego gracza.';

export const GUESS_SELECTED_PLAYER_HINT =
  'To ty podałeś odpowiedzi, w tej rundzie nie zgadujesz. Poczekaj, aż reszta wybierze.';

export const WAIT_FOR_OTHERS = 'Czekaj, aż reszta odpowie…';
