export interface DrawingPoint {
  x: number;
  y: number;
  color: string;
  lineWidth: number;
  tool: string;
  shape?: string;
}

export interface Room {
  id: string;
  users: string[];
  maxUsers: number;
}
/*
export interface StickyNote {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
}
*/

export interface ChatMessage {
  id: string;
  userId: string;
  text: string;
  timestamp: string;
}