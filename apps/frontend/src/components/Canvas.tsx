import React, { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import { DrawingPoint } from '../types';
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
  //const [stickyNotes, setStickyNotes] = useState<StickyNote[]>([]);
  //const [newNoteText, setNewNoteText] = useState('');

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
/*
    socket.on('addStickyNote', (note: StickyNote) => {
      setStickyNotes(prev => [...prev, note]);
    });
  */

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
  
    const ctx = contextRef.current;
  
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'; // Makes eraser remove strokes
      ctx.lineWidth = 10; // Adjust eraser thickness
    } else {
      ctx.globalCompositeOperation = 'source-over'; // Regular drawing mode
    }
  
    ctx.lineTo(x, y);
    ctx.stroke();
  
    socket.emit('draw', roomId, {
      x,
      y,
      color: tool === 'eraser' ? '#ffffff' : color,
      lineWidth,
      tool
    });
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
    //setStickyNotes([]);
    socket.emit('clear', roomId);
  };
/*
  const addStickyNote = () => {
    if (!newNoteText.trim()) return;

    const note: StickyNote = {
      id: Math.random().toString(36).substr(2, 9),
      x: Math.random() * 700,
      y: Math.random() * 500,
      text: newNoteText,
      color: color
    };

    //setStickyNotes(prev => [...prev, note]);
    socket.emit('addStickyNote', roomId, note);
    setNewNoteText('');
  };
  */

  return (
    <div className="flex">
      <div className="flex flex-col gap-4 items-center mb-4 bg-white p-4 rounded-lg shadow-md fixed left-0 top-0 h-full">
      <div className="flex flex-col gap-2">
        <button
        onClick={() => setTool('pencil')}
        className={`p-2 rounded ${tool === 'pencil' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        title="Pencil"
        >
        <Pencil size={20} />
        </button>
        <button
          onClick={() => setTool(tool === 'eraser' ? 'pencil' : 'eraser')}
          className={`p-2 rounded transition duration-200 ${
            tool === 'eraser' ? 'bg-red-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
          }`}
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

      <div className="flex flex-col gap-2 mt-4">
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
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        className="w-5 h-5 rounded-full border-none cursor-pointer p-3 bg-transparent shadow-md ring-2 ring-blue-500 hover:ring-blue-700 transition duration-200"
        style={{ backgroundColor: color, border: color === '#ffffff' ? '1px solid #e5e7eb' : 'none' }}
      />

      <input
        type="range"
        min="1"
        max="20"
        value={lineWidth}
        onChange={(e) => setLineWidth(Number(e.target.value))}
        className="w-20 mt-4"
        style={{ margin: '5px 0' }}
      />

      


      <button
        onClick={clearCanvas}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors mt-4"
      >
        Clear Canvas
      </button>
      </div>

      <div className="flex-grow flex justify-center items-center">
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="border border-gray-300 rounded-lg shadow-lg bg-white"
      />
      </div>

      <div className="flex flex-col gap-4 items-center mb-4 bg-white p-4 rounded-lg shadow-md fixed right-0 top-0 h-full">
      {/* Chat component or chat related code goes here */}
      </div>
    </div>
  );
};