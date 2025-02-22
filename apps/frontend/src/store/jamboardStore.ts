import { create } from 'zustand';

interface Point {
  x: number;
  y: number;
  color: string;
  width: number;
}

interface Stroke {
  id: string;
  points: Point[];
  color: string;
  width: number;
}

interface JamboardState {
  strokes: Stroke[];
  currentColor: string;
  currentWidth: number;
  isErasing: boolean;
  addStroke: (stroke: Stroke) => void;
  setCurrentColor: (color: string) => void;
  setCurrentWidth: (width: number) => void;
  setIsErasing: (isErasing: boolean) => void;
  clearBoard: () => void;
}

export const useJamboardStore = create<JamboardState>((set) => ({
  strokes: [],
  currentColor: '#000000',
  currentWidth: 2,
  isErasing: false,
  addStroke: (stroke) => set((state) => ({ strokes: [...state.strokes, stroke] })),
  setCurrentColor: (color) => set({ currentColor: color }),
  setCurrentWidth: (width) => set({ currentWidth: width }),
  setIsErasing: (isErasing) => set({ isErasing }),
  clearBoard: () => set({ strokes: [] }),
}));