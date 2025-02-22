import React, { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import { DrawingPoint, StickyNote } from '../types';
import { Square, Circle, Pencil, Type, Eraser } from 'lucide-react';

interface CanvasProps {
  socket: Socket;
  roomId: string;
}

export const Canvas: React.FC<CanvasProps> = ({ socket, roomId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(2);
  const [tool, setTool] = useState<string>('pencil');
  const [shape, setShape] = useState<string>('');
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>([]);
  const [newNoteText, setNewNoteText] = useState('');

  const colors = [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', 
    '#ffff00', '#ff00ff', '#00ffff', '#ff9900', '#9900ff'
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 800;
    canvas.height = 600;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    context.lineCap = 'round';
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    contextRef.current = context;
  }, []);

  useEffect(() => {
    if (!contextRef.current) return;
    contextRef.current.strokeStyle = color;
    contextRef.current.lineWidth = lineWidth;
  }, [color, lineWidth]);

  useEffect(() => {
    socket.on('draw', (point: DrawingPoint) => {
      if (!contextRef.current) return;
      
      if (point.tool === 'pencil' || point.tool === 'eraser') {
        contextRef.current.beginPath();
        contextRef.current.moveTo(point.x - 1, point.y - 1);
        contextRef.current.lineTo(point.x, point.y);
        contextRef.current.strokeStyle = point.tool === 'eraser' ? '#ffffff' : point.color;
        contextRef.current.lineWidth = point.lineWidth;
        contextRef.current.stroke();
        contextRef.current.closePath();
      } else if (point.shape) {
        drawShape(point.x, point.y, point.shape, point.color);
      }
      
      contextRef.current.strokeStyle = color;
      contextRef.current.lineWidth = lineWidth;
    });

    socket.on('addStickyNote', (note: StickyNote) => {
      setStickyNotes(prev => [...prev, note]);
    });

    socket.on('clear', () => {
      if (!contextRef.current || !canvasRef.current) return;
      contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    });

    return () => {
      socket.off('draw');
      socket.off('addStickyNote');
      socket.off('clear');
    };
  }, [socket, color, lineWidth]);

  const startDrawing = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === 'shape') {
      setStartPoint({ x, y });
    } else {
      contextRef.current.beginPath();
      contextRef.current.moveTo(x, y);
    }
    setIsDrawing(true);
  };

  const drawShape = (x: number, y: number, shape: string, shapeColor: string) => {
    if (!contextRef.current || !startPoint) return;

    contextRef.current.beginPath();
    contextRef.current.strokeStyle = shapeColor;

    if (shape === 'rectangle') {
      contextRef.current.rect(
        startPoint.x,
        startPoint.y,
        x - startPoint.x,
        y - startPoint.y
      );
    } else if (shape === 'circle') {
      const radius = Math.sqrt(
        Math.pow(x - startPoint.x, 2) + Math.pow(y - startPoint.y, 2)
      );
      contextRef.current.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI);
    }

    contextRef.current.stroke();
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing || !contextRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === 'shape' && startPoint) {
      const ctx = contextRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawShape(x, y, shape, color);
    } else {
      contextRef.current.lineTo(x, y);
      contextRef.current.stroke();

      socket.emit('draw', roomId, {
        x,
        y,
        color: tool === 'eraser' ? '#ffffff' : color,
        lineWidth,
        tool
      });
    }
  };

  const stopDrawing = (e: React.MouseEvent) => {
    if (!contextRef.current) return;

    if (tool === 'shape' && startPoint) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      socket.emit('draw', roomId, {
        x,
        y,
        color,
        lineWidth,
        tool,
        shape
      });
    }

    contextRef.current.closePath();
    setIsDrawing(false);
    setStartPoint(null);
  };

  const clearCanvas = () => {
    if (!contextRef.current || !canvasRef.current) return;
    contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setStickyNotes([]);
    socket.emit('clear', roomId);
  };

  const addStickyNote = () => {
    if (!newNoteText.trim()) return;

    const note: StickyNote = {
      id: Math.random().toString(36).substr(2, 9),
      x: Math.random() * 700,
      y: Math.random() * 500,
      text: newNoteText,
      color: color
    };

    setStickyNotes(prev => [...prev, note]);
    socket.emit('addStickyNote', roomId, note);
    setNewNoteText('');
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-4 items-center mb-4 bg-white p-4 rounded-lg shadow-md">
        <div className="flex gap-2">
          <button
            onClick={() => setTool('pencil')}
            className={`p-2 rounded ${tool === 'pencil' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            title="Pencil"
          >
            <Pencil size={20} />
          </button>
          <button
            onClick={() => setTool('eraser')}
            className={`p-2 rounded ${tool === 'eraser' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            title="Eraser"
          >
            <Eraser size={20} />
          </button>
          <button
            onClick={() => { setTool('shape'); setShape('rectangle'); }}
            className={`p-2 rounded ${tool === 'shape' && shape === 'rectangle' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            title="Rectangle"
          >
            <Square size={20} />
          </button>
          <button
            onClick={() => { setTool('shape'); setShape('circle'); }}
            className={`p-2 rounded ${tool === 'shape' && shape === 'circle' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            title="Circle"
          >
            <Circle size={20} />
          </button>
        </div>

        <div className="flex gap-2">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-6 h-6 rounded-full ${color === c ? 'ring-2 ring-blue-500' : ''}`}
              style={{ backgroundColor: c, border: c === '#ffffff' ? '1px solid #e5e7eb' : 'none' }}
            />
          ))}
        </div>

        <input
          type="range"
          min="1"
          max="20"
          value={lineWidth}
          onChange={(e) => setLineWidth(Number(e.target.value))}
          className="w-32"
        />

        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            placeholder="Add sticky note..."
            className="px-3 py-1 border rounded"
          />
          <button
            onClick={addStickyNote}
            className="p-2 rounded bg-yellow-400 hover:bg-yellow-500"
            title="Add Sticky Note"
          >
            <Type size={20} />
          </button>
        </div>

        <button
          onClick={clearCanvas}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Clear Canvas
        </button>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="border border-gray-300 rounded-lg shadow-lg bg-white"
        />
        
        {stickyNotes.map((note) => (
          <div
            key={note.id}
            style={{
              position: 'absolute',
              left: note.x,
              top: note.y,
              backgroundColor: note.color,
              padding: '8px',
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              maxWidth: '200px',
              wordBreak: 'break-word'
            }}
          >
            {note.text}
          </div>
        ))}
      </div>
    </div>
  );
};