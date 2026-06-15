export type { RoundType, RoundStatus, GameStatus } from './api';

export interface Player {
  id: string;
  nickname: string;
  isHost: boolean;
  avatarAnimal: string;
  avatarColor: string;
}

export interface GameSettings {
  maxPlayers: number;
  pointLimit: number;
  timePerAnswer: number;
}

export interface Room {
  code: string;
  inviteLink?: string;
  settings: GameSettings;
  players: Player[];
}

export interface AnswerOption {
  id: number;
  content: string;
  correct: boolean;
  voteCount: number;
  author: Player | null;
  targetPlayer: Player | null;
}

export interface Question {
  id: number;
  roundNumber: number;
  content: string;
  options: AnswerOption[];
  timePerAnswer: number;
}

export interface ScoreEntry {
  playerId: string;
  nickname: string;
  totalScore: number;
  rank: number;
  rankChange?: number; // positive = moved up, negative = moved down
  roundsWon?: number;
}

export interface VoteCount {
  optionId: number;
  optionText: string;
  votes: number;
}

export interface PlayerRoundAnswer {
  playerId: string;
  nickname: string;
  selectedOptionId: number | null;
  isCorrect: boolean;
  pointsEarned: number;
}

export interface RoundResult {
  roundNumber: number;
  winningAnswerText: string;
  playerAnswers: PlayerRoundAnswer[];
  scoreboard: ScoreEntry[];
  voteDistribution: VoteCount[];
}

export interface GameSummary {
  gameDurationMinutes?: number;
  finalRanking: ScoreEntry[];
}
