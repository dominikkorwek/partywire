export type GameStatus = 'LOBBY' | 'IN_PROGRESS' | 'FINISHED';

export type RoundStatus =
  | 'WAITING_FOR_QUESTION'
  | 'WAITING_FOR_ANSWERS'
  | 'REVEALING'
  | 'COMPLETED';

export type RoundType =
  | 'GUESS_PLAYER_ANSWER'
  | 'REUSE_QUESTION'
  | 'VOTE_PERSON'
  | 'PLAYER_CREATES_QUESTION'
  | 'BEST_ANSWER';

export interface PlayerResponse {
  id: string;
  nickname: string;
  isHost: boolean;
  avatarAnimal: string;
  avatarColor: string;
}

export interface RoomResponse {
  code: string;
  maxPlayers: number;
  currentPlayers: number;
  players: PlayerResponse[];
}

export interface QuestionCategoryResponse {
  id: number;
  name: string;
}

export interface QuestionResponse {
  id: number;
  content: string;
  roundType: RoundType;
  category: string | null;
}

export interface AnswerResponse {
  id: number;
  content: string;
  author: PlayerResponse | null;
  targetPlayer: PlayerResponse | null;
  correct: boolean;
  voteCount: number;
}

export interface ScoreResponse {
  player: PlayerResponse;
  points: number;
}

export interface PlayerAnswerResponse {
  player: PlayerResponse;
  answerText: string | null;
  correct: boolean;
  missed: boolean;
}

export interface RoundResponse {
  id: number;
  roundNumber: number;
  roundType: RoundType;
  status: RoundStatus;
  question: QuestionResponse | null;
  selectedPlayer: PlayerResponse | null;
  winningAnswer: AnswerResponse | null;
  answers: AnswerResponse[];
  tiebreakRevote: boolean;
  answerPhaseStartedAt: string | null;
  playerAnswers: PlayerAnswerResponse[];
}

export interface GameStateResponse {
  id: number;
  status: GameStatus;
  room: RoomResponse;
  pointLimit: number;
  timePerAnswer: number;
  currentRound: RoundResponse | null;
  ranking: ScoreResponse[];
  excludedCategoryIds: number[];
  excludedRoundTypes: RoundType[];
}

export interface CreateRoomRequest {
  hostNickname: string;
  maxPlayers: number;
  avatarAnimal: string;
  avatarColor: string;
}

export interface JoinRoomRequest {
  nickname: string;
  avatarAnimal: string;
  avatarColor: string;
}

export interface LeaveRoomRequest {
  playerId: string;
}

export interface GameSettingsRequest {
  pointLimit: number;
  timePerAnswer: number;
  excludedCategoryIds: number[];
  excludedRoundTypes: RoundType[];
}

export interface AnswerOptionRequest {
  content: string;
  correct: boolean;
  targetPlayerId: string | null;
}

export interface SubmitQuestionRequest {
  playerId?: string | null;
  questionContent: string;
  answers: AnswerOptionRequest[];
  answersArePlayers: boolean;
  correctAnswerId?: number | null;
}

export interface ClassicOptionResponse {
  id: number;
  content: string;
}

export interface ClassicSetupResponse {
  questionContent: string;
  options: ClassicOptionResponse[];
}

export interface SubmitAnswerRequest {
  playerId: string;
  answerId: number | null;
  freeText: string | null;
  selectedAnswerId: number | null;
}

export interface JoinRoomResponse {
  player: PlayerResponse;
  room: RoomResponse;
}

export interface AuthUserResponse {
  authenticated: boolean;
  subject: string | null;
  displayName: string | null;
  email: string | null;
}
