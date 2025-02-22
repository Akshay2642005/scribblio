import React, { useState } from 'react';
import { Socket } from 'socket.io-client';
import { nanoid } from 'nanoid';
import { Users, UserPlus } from 'lucide-react';

interface RoomManagerProps {
  socket: Socket;
  onJoinRoom: (roomId: string) => void;
}

export const RoomManager: React.FC<RoomManagerProps> = ({ socket, onJoinRoom }) => {
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');

  const createRoom = () => {
    const newRoomId = nanoid(8);
    socket.emit('createRoom', newRoomId, (response: { success: boolean; error?: string }) => {
      if (response.success) {
        onJoinRoom(newRoomId);
      } else {
        setError(response.error || 'Failed to create room');
      }
    });
  };

  const joinRoom = () => {
    if (!roomId.trim()) {
      setError('Please enter a room ID');
      return;
    }

    socket.emit('joinRoom', roomId, (response: { success: boolean; error?: string }) => {
      if (response.success) {
        onJoinRoom(roomId);
      } else {
        setError(response.error || 'Failed to join room');
      }
    });
  };

  return (
    <div className="flex flex-col items-center gap-6 p-8 bg-white rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-800">Join Drawing Room</h2>
      
      <div className="w-full">
        <button
          onClick={createRoom}
          className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <UserPlus size={20} />
          Create New Room
        </button>
      </div>

      <div className="w-full flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter Room ID"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={joinRoom}
            className="flex items-center gap-2 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            <Users size={20} />
            Join
          </button>
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
};