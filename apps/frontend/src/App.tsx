import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Canvas } from './components/Canvas';
import { RoomManager } from './components/RoomManager';
import { Chat } from './components/Chat';

// Create socket with explicit configuration
const socket = io('http://localhost:3001', {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  transports: ['websocket', 'polling']
});

function App() {
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleConnect = () => {
      console.log('Connected to server');
      setConnected(true);
      setError(null);
    };

    const handleDisconnect = () => {
      console.log('Disconnected from server');
      setConnected(false);
      setError('Lost connection to server');
    };

    const handleConnectError = (err: Error) => {
      console.error('Connection error:', err);
      setError(`Connection error: ${err.message}`);
      setConnected(false);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
    };
  }, []);

  const handleJoinRoom = (roomId: string) => {
    setCurrentRoom(roomId);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Collaborative Drawing Board
        </h1>
        
        {error && (
          <div className="text-center text-red-500 mb-4 p-4 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        {!connected && !error && (
          <div className="text-center text-blue-500 mb-4 p-4 bg-blue-100 rounded-lg">
            Connecting to server...
          </div>
        )}

        {connected && !currentRoom && (
          <RoomManager socket={socket} onJoinRoom={handleJoinRoom} />
        )}

        {connected && currentRoom && (
            <>
            <div className="flex flex-col items-center gap-4">
              <div className="bg-white p-4 rounded-lg shadow mb-4 flex items-center gap-2">
              <p className="text-gray-600">
                Room ID: <span className="font-mono font-bold">{currentRoom}</span>
              </p>
              <button
                className="bg-blue-500 text-white px-2 py-1 rounded"
                onClick={() => navigator.clipboard.writeText(currentRoom || '')}
              >
                Copy
              </button>
              </div>
              <Canvas socket={socket} roomId={currentRoom} />
            </div>
            <Chat socket={socket} roomId={currentRoom} />
            </>
        )}
      </div>
    </div>
  );
}

export default App;