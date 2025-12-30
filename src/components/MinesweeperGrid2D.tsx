'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Cell } from '../types/game';

interface MinesweeperGrid2DProps {
  board: Cell[][];
  gameState: 'playing' | 'won' | 'lost';
  onCellLeftClick: (x: number, y: number) => void;
  onCellRightClick: (x: number, y: number) => void;
  onCellDoubleClick: (x: number, y: number) => void;
}

const CELL_SIZE = 30;
const GRID_GAP = 1;

const MinesweeperGrid2D: React.FC<MinesweeperGrid2DProps> = ({
  board,
  gameState,
  onCellLeftClick,
  onCellRightClick,
  onCellDoubleClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getCellColor = (cell: Cell) => {
    if (cell.state === 'revealed') {
      // Don't color revealed mines red — show mines as bomb icons instead.
      return '#e0e0e0'; // Light gray for revealed cell
    } else if (cell.state === 'flagged') {
      return '#ffb3b3'; // Light red for flagged
    } else if (cell.state === 'questioned') {
      return '#fff2b3'; // Light yellow for questioned
    }
    return '#c0c0c0'; // Gray for hidden
  };

  const getNumberColor = (num: number) => {
    const colors = [
      '#000000', // 1
      '#008000', // 2
      '#ff0000', // 3
      '#000080', // 4
      '#800000', // 5
      '#008080', // 6
      '#000000', // 7
      '#808080', // 8
    ];
    return colors[num - 1] || '#000000';
  };

  const drawCell = useCallback((ctx: CanvasRenderingContext2D, cell: Cell, x: number, y: number, gameState: 'playing' | 'won' | 'lost') => {
    const cellX = x * (CELL_SIZE + GRID_GAP);
    const cellY = y * (CELL_SIZE + GRID_GAP);

    // Draw cell background
    ctx.fillStyle = getCellColor(cell);
    ctx.fillRect(cellX, cellY, CELL_SIZE, CELL_SIZE);

    // Draw cell border
    ctx.strokeStyle = '#808080';
    ctx.lineWidth = 1;
    ctx.strokeRect(cellX, cellY, CELL_SIZE, CELL_SIZE);

    // Draw inner highlight for 3D effect
    if (cell.state === 'hidden') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cellX + 1, cellY + 1);
      ctx.lineTo(cellX + CELL_SIZE - 1, cellY + 1);
      ctx.lineTo(cellX + CELL_SIZE - 1, cellY + CELL_SIZE - 1);
      ctx.stroke();
    }

    // Draw cell content: numbers for revealed non-mine cells
    if (cell.state === 'revealed' && !cell.isMine && cell.neighborMines > 0) {
      // Draw number
      ctx.fillStyle = getNumberColor(cell.neighborMines);
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        cell.neighborMines.toString(),
        cellX + CELL_SIZE / 2,
        cellY + CELL_SIZE / 2
      );
    } else if (cell.state === 'flagged') {
      // Draw flag
      ctx.fillStyle = '#ff0000';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🚩', cellX + CELL_SIZE / 2, cellY + CELL_SIZE / 2);
    } else if (cell.state === 'questioned') {
      // Draw question mark
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('❓', cellX + CELL_SIZE / 2, cellY + CELL_SIZE / 2);
    }

    // Show mines when game is lost and cell is a mine that wasn't flagged
    if (gameState === 'lost' && cell.isMine && cell.state !== 'flagged') {
      // Simple bomb icon display (no explosion animation)
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('💣', cellX + CELL_SIZE / 2, cellY + CELL_SIZE / 2);
    }
  }, []);

  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Don't draw if board is empty
    if (board.length === 0 || !board[0]) return;

    // Draw all cells
    for (let y = 0; y < board.length; y++) {
      for (let x = 0; x < board[y].length; x++) {
        drawCell(ctx, board[y][x], x, y, gameState);
      }
    }
  }, [board, gameState, drawCell]);

  useEffect(() => {
    drawGrid();
  }, [drawGrid, board, gameState]);

  const getCellFromMouseEvent = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || board.length === 0 || !board[0]) return null;

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const cellX = Math.floor(mouseX / (CELL_SIZE + GRID_GAP));
    const cellY = Math.floor(mouseY / (CELL_SIZE + GRID_GAP));

    if (cellX >= 0 && cellX < board[0].length && cellY >= 0 && cellY < board.length) {
      return { x: cellX, y: cellY };
    }
    return null;
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const cellPos = getCellFromMouseEvent(event);
    if (!cellPos) return;

    if (event.button === 0) { // Left click
      onCellLeftClick(cellPos.x, cellPos.y);
    } else if (event.button === 2) { // Right click
      onCellRightClick(cellPos.x, cellPos.y);
    }
  };

  const handleDoubleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const cellPos = getCellFromMouseEvent(event);
    if (!cellPos) return;

    onCellDoubleClick(cellPos.x, cellPos.y);
  };

  const canvasWidth = board.length > 0 && board[0] ? board[0].length * (CELL_SIZE + GRID_GAP) - GRID_GAP : 0;
  const canvasHeight = board.length * (CELL_SIZE + GRID_GAP) - GRID_GAP;

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        onContextMenu={(e) => e.preventDefault()}
        className="cursor-pointer block"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
};

export default MinesweeperGrid2D;
