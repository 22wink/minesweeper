import React from 'react';
import { GameStats } from '../types/game';

interface GameUIProps {
  stats: GameStats;
  onReset: () => void;
}

const GameUI: React.FC<GameUIProps> = ({ stats, onReset }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getFaceEmoji = () => {
    switch (stats.gameState) {
      case 'won':
        return '😎';
      case 'lost':
        return '😵';
      default:
        return '🙂';
    }
  };

  const remainingMines = stats.minesTotal - stats.flagsPlaced;

  return (
    <div className="flex items-center justify-between p-4 bg-gray-800 text-white rounded-lg mb-4">
      {/* Mine counter */}
      <div className="flex items-center space-x-2">
        <span className="text-2xl">💣</span>
        <span className="text-xl font-mono min-w-[3rem]">
          {remainingMines.toString().padStart(3, '0')}
        </span>
      </div>

      {/* Reset button */}
      <button
        onClick={onReset}
        className="text-4xl hover:scale-110 transition-transform cursor-pointer select-none"
        title="重新开始游戏"
      >
        {getFaceEmoji()}
      </button>

      {/* Timer */}
      <div className="flex items-center space-x-2">
        <span className="text-2xl">⏱️</span>
        <span className="text-xl font-mono min-w-[3rem]">
          {formatTime(stats.time)}
        </span>
      </div>
    </div>
  );
};

export default GameUI;
