import React, { useState } from 'react';
import axios from "axios";
import { Socket } from 'socket.io-client';
import { Users, UserPlus } from 'lucide-react';

interface RoomManagerProps {
  socket: Socket;
  onJoinRoom: (roomId: string) => void;
}

export const RoomManager: React.FC<RoomManagerProps> = ({onJoinRoom }) => {
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');

  const createRoom = async () => {
    if (!roomId.trim()) {
      setError("Room name cannot be empty");
      return;
    }

    try {
      const response = await axios.post("/api/room/create", { name: roomId });

      if (response.data.success) {
        onJoinRoom(roomId);
      } else {
        setError(response.data.error || "Failed to create room");
      }
    } catch (error) {
      console.error("Error creating room:", error);
      setError("Failed to create room. Please try again.");
    }
  };

  const joinRoom = async () => {
    if (!roomId.trim()) {
      setError('Please enter a room ID');
      return;
    }

    try {
      const response = await axios.post("http:/localhost:5000/api/room/join", { name: roomId });

      if (response.data.success) {
        onJoinRoom(roomId);
      } else {
        setError(response.data.error || 'Failed to join room');
      }
    } catch (error) {
      console.error("Error joining room:", error);
      setError("Failed to join room. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-8 bg-gradient-to-r from-blue-100 to-blue-300 rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-3xl font-extrabold text-gray-800">Ready to Draw?</h2>

      <div className="w-full flex flex-col gap-4">
        <div className="w-full">
          <div className="flex flex-col items-center gap-4 p-4 bg-white rounded-lg shadow-md">
            <h3 className="text-2xl font-bold text-gray-700">Create Room</h3>
            <input
              type="text"
              placeholder="Enter Room Name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
            />
            <button
              onClick={createRoom}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 ease-in-out shadow-md transform hover:scale-105"
            >
              <UserPlus size={20} />
              Create New Room
            </button>
          </div>
        </div>

        <div className="w-full">
          <div className="flex flex-col items-center gap-4 p-4 bg-white rounded-lg shadow-md">
            <h3 className="text-2xl font-bold text-gray-700">Join Room</h3>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter Room Name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
            />
            <button
              onClick={joinRoom}
              className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 ease-in-out shadow-md transform hover:scale-105"
            >
              <Users size={20} />
              Join Room
            </button>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-red-600 text-sm font-semibold">{error}</p>
      )}
    </div>
  );
};

/* todo:

multidraw icon

*/
