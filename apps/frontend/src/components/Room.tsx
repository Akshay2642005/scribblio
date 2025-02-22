import React from 'react';
import { Jamboard } from './Jamboard';
import { useRoomStore } from '../store/roomStore';
import { LogOut } from 'lucide-react';

export const Room: React.FC = () => {
  const { roomId, username, leaveRoom } = useRoomStore();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Collaborative Jamboard</h1>
            <p className="text-gray-600">Room: {roomId} | User: {username}</p>
          </div>
          <button
            onClick={leaveRoom}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:bg-gray-50"
          >
            <LogOut className="w-5 h-5" />
            Leave Room
          </button>
        </div>
        <Jamboard />
      </div>
    </div>
  );
};