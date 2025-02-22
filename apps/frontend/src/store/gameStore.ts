import { create } from 'zustand';

interface Player {
  id: number;
  name: string;
  score: number;
  isDrawing: boolean;
}

interface GameState {
  players: Player[];
  currentWord: string;
  timeLeft: number;
  isGameStarted: boolean;
  setPlayers: (players: Player[]) => void;
  setCurrentWord: (word: string) => void;
  setTimeLeft: (time: number) => void;
  setGameStarted: (started: boolean) => void;
}

export const useGameStore = create<GameState>((set) => ({
  players: [
    { id: 1, name: 'Player 1', score: 0, isDrawing: true },
    { id: 2, name: 'Player 2', score: 0, isDrawing: false },
    { id: 3, name: 'Player 3', score: 0, isDrawing: false },
    { id: 4, name: 'Player 4', score: 0, isDrawing: false },
    { id: 5, name: 'Player 5', score: 0, isDrawing: false },
  ],
  currentWord: 'elephant',
  timeLeft: 60,
  isGameStarted: false,
  setPlayers: (players) => set({ players }),
  setCurrentWord: (word) => set({ currentWord }),
  setTimeLeft: (time) => set({ timeLeft }),
  setGameStarted: (started) => set({ isGameStarted }),
}));