import { create } from 'zustand';

interface RoomState {
  roomId: string | null;
  username: string;
  setRoom: (roomId: string) => void;
  setUsername: (username: string) => void;
  leaveRoom: () => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  roomId: null,
  username: '',
  setRoom: (roomId) => set({ roomId }),
  setUsername: (username) => set({ username }),
  leaveRoom: () => set({ roomId: null }),
}));