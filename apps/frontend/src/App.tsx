import React from 'react';
import { Home } from './components/Home';
import { Room } from './components/Room';
import { useRoomStore } from './store/roomStore';

function App() {
  const roomId = useRoomStore((state) => state.roomId);

  return roomId ? <Room /> : <Home />;
}

export default App;