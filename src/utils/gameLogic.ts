import { Cell, CellState, GameState, GameSettings } from '../types/game';

export class MinesweeperGame {
  private board: Cell[][] = [];
  private settings: GameSettings;
  private gameState: GameState = 'playing';
  private firstClick = true;
  private startTime = 0;
  private endTime = 0;

  constructor(settings: GameSettings) {
    this.settings = settings;
    this.initializeBoard();
  }

  private initializeBoard() {
    this.board = [];
    for (let y = 0; y < this.settings.height; y++) {
      this.board[y] = [];
      for (let x = 0; x < this.settings.width; x++) {
        this.board[y][x] = {
          isMine: false,
          state: 'hidden',
          neighborMines: 0,
          x,
          y,
        };
      }
    }
  }

  private placeMines(firstClickX: number, firstClickY: number) {
    const totalCells = this.settings.width * this.settings.height;
    const minesToPlace = Math.min(this.settings.mines, totalCells - 9); // Leave space for first click area

    const positions: { x: number; y: number }[] = [];

    // Generate all possible positions except first click area
    for (let y = 0; y < this.settings.height; y++) {
      for (let x = 0; x < this.settings.width; x++) {
        // Skip 3x3 area around first click
        if (
          x >= firstClickX - 1 &&
          x <= firstClickX + 1 &&
          y >= firstClickY - 1 &&
          y <= firstClickY + 1
        ) {
          continue;
        }
        positions.push({ x, y });
      }
    }

    // Randomly select mine positions
    for (let i = 0; i < minesToPlace && positions.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * positions.length);
      const pos = positions.splice(randomIndex, 1)[0];
      this.board[pos.y][pos.x].isMine = true;
    }

    // Calculate neighbor mine counts
    this.calculateNeighborCounts();
  }

  private calculateNeighborCounts() {
    for (let y = 0; y < this.settings.height; y++) {
      for (let x = 0; x < this.settings.width; x++) {
        if (!this.board[y][x].isMine) {
          let count = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const nx = x + dx;
              const ny = y + dy;
              if (
                nx >= 0 &&
                nx < this.settings.width &&
                ny >= 0 &&
                ny < this.settings.height &&
                this.board[ny][nx].isMine
              ) {
                count++;
              }
            }
          }
          this.board[y][x].neighborMines = count;
        }
      }
    }
  }

  private getNeighbors(x: number, y: number): Cell[] {
    const neighbors: Cell[] = [];
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (
          nx >= 0 &&
          nx < this.settings.width &&
          ny >= 0 &&
          ny < this.settings.height
        ) {
          neighbors.push(this.board[ny][nx]);
        }
      }
    }
    return neighbors;
  }

  private revealArea(x: number, y: number) {
    const cell = this.board[y][x];
    if (cell.state !== 'hidden') return;

    cell.state = 'revealed';

    if (cell.isMine) {
      this.gameState = 'lost';
      this.endTime = Date.now();
      // Reveal all mines
      for (let y = 0; y < this.settings.height; y++) {
        for (let x = 0; x < this.settings.width; x++) {
          if (this.board[y][x].isMine) {
            this.board[y][x].state = 'revealed';
          }
        }
      }
      return;
    }

    // If cell has no neighboring mines, reveal all neighbors
    if (cell.neighborMines === 0) {
      const neighbors = this.getNeighbors(x, y);
      for (const neighbor of neighbors) {
        if (neighbor.state === 'hidden') {
          this.revealArea(neighbor.x, neighbor.y);
        }
      }
    }

    this.checkWinCondition();
  }

  private checkWinCondition() {
    let hiddenCells = 0;
    for (let y = 0; y < this.settings.height; y++) {
      for (let x = 0; x < this.settings.width; x++) {
        if (this.board[y][x].state === 'hidden') {
          hiddenCells++;
        }
      }
    }

    if (hiddenCells === this.settings.mines) {
      this.gameState = 'won';
      this.endTime = Date.now();
      // Auto-flag remaining mines
      for (let y = 0; y < this.settings.height; y++) {
        for (let x = 0; x < this.settings.width; x++) {
          if (this.board[y][x].isMine && this.board[y][x].state === 'hidden') {
            this.board[y][x].state = 'flagged';
          }
        }
      }
    }
  }

  public leftClick(x: number, y: number) {
    if (this.gameState !== 'playing') return;

    const cell = this.board[y][x];

    if (cell.state === 'flagged' || cell.state === 'questioned') return;

    if (this.firstClick) {
      this.placeMines(x, y);
      this.startTime = Date.now();
      this.firstClick = false;
    }

    this.revealArea(x, y);
  }

  public rightClick(x: number, y: number) {
    if (this.gameState !== 'playing') return;

    const cell = this.board[y][x];

    if (cell.state === 'hidden') {
      cell.state = 'flagged';
    } else if (cell.state === 'flagged') {
      cell.state = 'questioned';
    } else if (cell.state === 'questioned') {
      cell.state = 'hidden';
    }
  }

  public doubleClick(x: number, y: number) {
    if (this.gameState !== 'playing') return;

    const cell = this.board[y][x];
    if (cell.state !== 'revealed' || cell.neighborMines === 0) return;

    // Count flagged neighbors
    const neighbors = this.getNeighbors(x, y);
    let flaggedCount = 0;
    for (const neighbor of neighbors) {
      if (neighbor.state === 'flagged') {
        flaggedCount++;
      }
    }

    // If flagged count matches neighbor mines, reveal all unflagged neighbors
    if (flaggedCount === cell.neighborMines) {
      for (const neighbor of neighbors) {
        if (neighbor.state === 'hidden') {
          this.revealArea(neighbor.x, neighbor.y);
        }
      }
    }
  }

  public reset() {
    this.gameState = 'playing';
    this.firstClick = true;
    this.startTime = 0;
    this.endTime = 0;
    this.initializeBoard();
  }

  public getBoard(): Cell[][] {
    return this.board;
  }

  public getGameState(): GameState {
    return this.gameState;
  }

  public getStats() {
    const time = this.startTime > 0
      ? Math.floor((this.endTime || Date.now()) - this.startTime) / 1000
      : 0;

    let flagsPlaced = 0;
    for (let y = 0; y < this.settings.height; y++) {
      for (let x = 0; x < this.settings.width; x++) {
        if (this.board[y][x].state === 'flagged') {
          flagsPlaced++;
        }
      }
    }

    return {
      time,
      flagsPlaced,
      minesTotal: this.settings.mines,
      gameState: this.gameState,
    };
  }

  public getSettings(): GameSettings {
    return this.settings;
  }
}
