import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Pencil } from 'lucide-react';

export const PlayerList: React.FC = () => {
  const players = useGameStore((state) => state.players);

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-bold mb-4">Players</h2>
      <div className="space-y-2">
        {players.map((player) => (
          <div
            key={player.id}
            className="flex items-center justify-between p-2 bg-gray-50 rounded"
          >
            <div className="flex items-center gap-2">
              {player.isDrawing && (
                <Pencil className="w-4 h-4 text-blue-500" />
              )}
              <span className="font-medium">{player.name}</span>
            </div>
            <span className="font-bold">{player.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
};