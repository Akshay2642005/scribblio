import React, { useState } from 'react';
import { useRoomStore } from '../store/roomStore';
import { Users } from 'lucide-react';

interface RoomFormProps {
  type: 'create' | 'join';
}

export const RoomForm: React.FC<RoomFormProps> = ({ type }) => {
  const [roomId, setRoomId] = useState(type === 'create' ? Math.random().toString(36).substring(2, 8) : '');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  
  const { setRoom, setUsername: setStoreUsername } = useRoomStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    if (!roomId.trim()) {
      setError('Please enter a room ID');
      return;
    }

    setStoreUsername(username);
    setRoom(roomId);
  };

  return (
    <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
      <div className="flex items-center justify-center mb-6">
        <div className="bg-indigo-100 p-3 rounded-full">
          <Users className="w-8 h-8 text-indigo-600" />
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-center mb-6">
        {type === 'create' ? 'Create a Room' : 'Join a Room'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Your Name
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter your name"
          />
        </div>

        <div>
          <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 mb-1">
            Room ID
          </label>
          <input
            type="text"
            id="roomId"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter room ID"
            readOnly={type === 'create'}
          />
          {type === 'create' && (
            <p className="mt-1 text-sm text-gray-500">
              Share this room ID with others to let them join
            </p>
          )}
        </div>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {type === 'create' ? 'Create Room' : 'Join Room'}
        </button>
      </form>
    </div>
  );
};