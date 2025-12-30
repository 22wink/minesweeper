import React, { useState, useEffect } from 'react';
import { DifficultyLevel, DIFFICULTY_SETTINGS, GameSettings } from '../types/game';

interface DifficultySelectorProps {
  currentDifficulty: DifficultyLevel;
  currentCustomSettings: GameSettings;
  onDifficultyChange: (difficulty: DifficultyLevel) => void;
  onCustomSettingsChange?: (settings: GameSettings) => void;
  disabled?: boolean;
}
const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  currentDifficulty,
  currentCustomSettings,
  onDifficultyChange,
  onCustomSettingsChange,
  disabled = false,
}) => {
  const [localWidth, setLocalWidth] = useState<number>(currentCustomSettings.width);
  const [localHeight, setLocalHeight] = useState<number>(currentCustomSettings.height);
  const [localMines, setLocalMines] = useState<number>(currentCustomSettings.mines);
  useEffect(() => {
    setLocalWidth(currentCustomSettings.width);
    setLocalHeight(currentCustomSettings.height);
    setLocalMines(currentCustomSettings.mines);
  }, [currentCustomSettings]);
  const applyCustomSettings = () => {
    const maxMines = Math.max(1, localWidth * localHeight - 1);
    const width = Math.max(5, Math.min(50, Math.floor(localWidth)));
    const height = Math.max(5, Math.min(50, Math.floor(localHeight)));
    const mines = Math.max(1, Math.min(maxMines, Math.floor(localMines)));
    const newSettings: GameSettings = { width, height, mines };
    if (onCustomSettingsChange) onCustomSettingsChange(newSettings);
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-800">选择难度</h3>

      <div className="flex flex-wrap gap-2 justify-center">
        {(Object.keys(DIFFICULTY_SETTINGS) as DifficultyLevel[]).map((difficulty) => (
          <button
            key={difficulty}
            onClick={() => onDifficultyChange(difficulty)}
            disabled={disabled}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              currentDifficulty === difficulty
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {difficulty === 'beginner' && '初级'}
            {difficulty === 'intermediate' && '中级'}
            {difficulty === 'expert' && '高级'}
            {difficulty === 'custom' && '自定义'}
          </button>
        ))}
      </div>

      {currentDifficulty === 'custom' && onCustomSettingsChange && (
        <div className="flex flex-col items-center space-y-2 p-3 bg-white rounded-md border">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">
              宽度:
              <input
                type="number"
                min={5}
                max={50}
                value={localWidth}
                onChange={(e) => setLocalWidth(Number(e.target.value))}
                disabled={disabled}
                className="ml-1 w-16 px-2 py-1 border border-gray-300 rounded text-center"
              />
            </label>
            <label className="text-sm font-medium text-gray-700">
              高度:
              <input
                type="number"
                min={5}
                max={50}
                value={localHeight}
                onChange={(e) => setLocalHeight(Number(e.target.value))}
                disabled={disabled}
                className="ml-1 w-16 px-2 py-1 border border-gray-300 rounded text-center"
              />
            </label>
            <label className="text-sm font-medium text-gray-700">
              雷数:
              <input
                type="number"
                min={1}
                max={Math.max(1, localWidth * localHeight - 1)}
                value={localMines}
                onChange={(e) => setLocalMines(Number(e.target.value))}
                disabled={disabled}
                className="ml-1 w-20 px-2 py-1 border border-gray-300 rounded text-center"
              />
            </label>
            <button
              onClick={applyCustomSettings}
              disabled={disabled}
              className="ml-2 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              应用
            </button>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 text-center max-w-xs">
        初级: 9×9, 10雷 | 中级: 16×16, 40雷 | 高级: 30×16, 99雷
      </div>
    </div>
  );
};

export default DifficultySelector;
