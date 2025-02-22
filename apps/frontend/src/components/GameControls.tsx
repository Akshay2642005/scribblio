import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Play, Timer } from 'lucide-react';

export const GameControls: React.FC = () => {
  const timeLeft = useGameStore((state) => state.timeLeft);
  const currentWord = useGameStore((state) => state.currentWord);
  const isGameStarted = useGameStore((state) => state.isGameStarted);
  const setGameStarted = useGameStore((state) => state.setGameStarted);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Timer className="w-5 h-5 text-gray-600" />
          <span className="text-xl font-bold">{timeLeft}s</span>
        </div>
        {!isGameStarted && (
          <button
            onClick={() => setGameStarted(true)}
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            <Play className="w-4 h-4" />
            Start Game
          </button>
        )}
      </div>
      {isGameStarted && (
        <div className="text-center">
          <p className="text-gray-600">Current Word:</p>
          <p className="text-2xl font-bold">{currentWord}</p>
        </div>
      )}
    </div>
  );
};