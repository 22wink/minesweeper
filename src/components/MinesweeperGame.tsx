'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MinesweeperGame } from '../utils/gameLogic';
import MinesweeperGrid2D from './MinesweeperGrid2D';
import GameUI from './GameUI';
import DifficultySelector from './DifficultySelector';
import { GameSettings, GameStats, DifficultyLevel, DIFFICULTY_SETTINGS } from '../types/game';

const DEFAULT_SETTINGS: GameSettings = {
  width: 16,
  height: 16,
  mines: 40,
};

const MinesweeperGameComponent: React.FC = () => {
  const [game, setGame] = useState<MinesweeperGame | null>(null);
  const [board, setBoard] = useState<any[][]>([]);
  const [stats, setStats] = useState<GameStats>({
    time: 0,
    flagsPlaced: 0,
    minesTotal: DEFAULT_SETTINGS.mines,
    gameState: 'playing',
  });
  const [currentDifficulty, setCurrentDifficulty] = useState<DifficultyLevel>('intermediate');
  const [customSettings, setCustomSettings] = useState<GameSettings>(DIFFICULTY_SETTINGS.custom);

  // Initialize game
  useEffect(() => {
    const settings = currentDifficulty === 'custom' ? customSettings : DIFFICULTY_SETTINGS[currentDifficulty];
    const newGame = new MinesweeperGame(settings);
    setGame(newGame);
    setBoard(newGame.getBoard());
    setStats(newGame.getStats());
  }, [currentDifficulty, customSettings]);

  // Update stats every second when playing
  useEffect(() => {
    if (!game || stats.gameState !== 'playing') return;

    const interval = setInterval(() => {
      if (game) {
        setStats(game.getStats());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [game, stats.gameState]);

  const updateGameState = useCallback(() => {
    if (!game) return;
    setBoard([...game.getBoard()]);
    setStats(game.getStats());
  }, [game]);

  const handleCellLeftClick = useCallback((x: number, y: number) => {
    if (!game) return;
    game.leftClick(x, y);
    updateGameState();
  }, [game, updateGameState]);

  const handleCellRightClick = useCallback((x: number, y: number) => {
    if (!game) return;
    game.rightClick(x, y);
    updateGameState();
  }, [game, updateGameState]);

  const handleCellDoubleClick = useCallback((x: number, y: number) => {
    if (!game) return;
    game.doubleClick(x, y);
    updateGameState();
  }, [game, updateGameState]);

  const handleDifficultyChange = useCallback((difficulty: DifficultyLevel) => {
    setCurrentDifficulty(difficulty);
  }, []);

  const handleCustomSettingsChange = useCallback((settings: GameSettings) => {
    setCustomSettings(settings);
    // Update DIFFICULTY_SETTINGS.custom for immediate use
    DIFFICULTY_SETTINGS.custom = settings;
  }, []);

  const handleReset = useCallback(() => {
    const settings = currentDifficulty === 'custom' ? customSettings : DIFFICULTY_SETTINGS[currentDifficulty];
    const newGame = new MinesweeperGame(settings);
    setGame(newGame);
    setBoard(newGame.getBoard());
    setStats(newGame.getStats());
  }, [currentDifficulty, customSettings]);

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="mb-4">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">
          扫雷游戏
        </h1>
        <p className="text-center text-gray-600">
          使用鼠标右键标记雷，左键翻开格子，双击数字翻开周围区域
        </p>
      </div>

      <DifficultySelector
        currentDifficulty={currentDifficulty}
        onDifficultyChange={handleDifficultyChange}
        currentCustomSettings={customSettings}
        onCustomSettingsChange={handleCustomSettingsChange}
        disabled={false}
      />

      <GameUI stats={stats} onReset={handleReset} />

      <div className="relative inline-block">
        <MinesweeperGrid2D
          board={board}
          gameState={stats.gameState}
          onCellLeftClick={handleCellLeftClick}
          onCellRightClick={handleCellRightClick}
          onCellDoubleClick={handleCellDoubleClick}
        />

        {/* Game Over Message */}
        {stats.gameState === 'lost' && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-lg shadow-lg animate-bounce">
            💥 游戏结束！你踩到地雷了！
          </div>
        )}

        {/* Victory Message */}
        {stats.gameState === 'won' && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-lg shadow-lg animate-bounce">
            🎉 恭喜胜利！用时 {Math.floor(stats.time / 60)}:{(stats.time % 60).toString().padStart(2, '0')}
          </div>
        )}
      </div>

      <div className="mt-4 text-center text-sm text-gray-600 max-w-2xl">
        <p className="mb-2">
          <strong>电脑操作：</strong>鼠标右键点击标记雷，再点去除标记。
          标记的雷数和数字匹配时，点击数字翻开周围的安全区域。
          鼠标左键点击无标记方块直接打开。
        </p>
        <p>
          <strong>手机/平板：</strong>触屏上点击方块标记为雷，再点去除标记。
          标记的雷数和数字匹配时，点击数字翻开周围的安全区域。
          长按方块直接打开，可改为点击三次。
        </p>
      </div>
    </div>
  );
};

export default MinesweeperGameComponent;
