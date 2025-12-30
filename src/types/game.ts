export type CellState = 'hidden' | 'revealed' | 'flagged' | 'questioned';

export type Cell = {
  isMine: boolean;
  state: CellState;
  neighborMines: number;
  x: number;
  y: number;
};

export type GameState = 'playing' | 'won' | 'lost';

export type GameSettings = {
  width: number;
  height: number;
  mines: number;
};

export type DifficultyLevel = 'beginner' | 'intermediate' | 'expert' | 'custom';

export const DIFFICULTY_SETTINGS: Record<DifficultyLevel, GameSettings> = {
  beginner: { width: 9, height: 9, mines: 10 },
  intermediate: { width: 16, height: 16, mines: 40 },
  expert: { width: 30, height: 16, mines: 99 },
  custom: { width: 16, height: 16, mines: 40 },
};

export type GameStats = {
  time: number;
  flagsPlaced: number;
  minesTotal: number;
  gameState: GameState;
};
