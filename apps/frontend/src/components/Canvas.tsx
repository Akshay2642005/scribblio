import React, { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import { DrawingPoint } from '../types';
import { Square, Circle, Pencil, Eraser } from 'lucide-react';

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
  const [canvasImageData, setCanvasImageData] = useState<ImageData | null>(null);

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
        contextRef.current.strokeStyle = point.tool === 'eraser' ? '#f3f4f6' : point.color;
        contextRef.current.lineWidth = point.lineWidth;
        contextRef.current.stroke();
        contextRef.current.closePath();
      } else if (point.shape) {
        if (point.startX !== undefined && point.startY !== undefined) {
          drawShape(point.startX, point.startY, point.x, point.y, point.shape, point.color);
        }
      }
      
      contextRef.current.strokeStyle = color;
      contextRef.current.lineWidth = lineWidth;
    });

    socket.on('clear', () => {
      if (!contextRef.current || !canvasRef.current) return;
      contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    });

    return () => {
      socket.off('draw');
      socket.off('clear');
    };
  }, [socket, color, lineWidth]);

  const drawShape = (startX: number, startY: number, endX: number, endY: number, shape: string, shapeColor: string) => {
    if (!contextRef.current) return;

    const ctx = contextRef.current;
    ctx.beginPath();
    ctx.strokeStyle = shapeColor;

    if (shape === 'rectangle') {
      ctx.rect(startX, startY, endX - startX, endY - startY);
    } else if (shape === 'circle') {
      const radius = Math.sqrt(
        Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
      );
      ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
    }

    ctx.stroke();
    ctx.closePath();
  };

  const startDrawing = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === 'shape') {
      setStartPoint({ x, y });
      setCanvasImageData(contextRef.current.getImageData(0, 0, canvas.width, canvas.height));
    } else {
      contextRef.current.beginPath();
      contextRef.current.moveTo(x, y);
    }
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing || !contextRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = contextRef.current;

    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 20;
    } else {
      ctx.globalCompositeOperation = 'source-over';
    }

    if (tool === 'shape' && startPoint) {
      if (canvasImageData) {
        ctx.putImageData(canvasImageData, 0, 0);
      }
      drawShape(startPoint.x, startPoint.y, x, y, shape, color);
    } else {
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    socket.emit('draw', roomId, {
      x,
      y,
      color: tool === 'eraser' ? '#ffffff' : color,
      lineWidth,
      tool,
      shape: tool === 'shape' ? shape : '',
      startX: startPoint?.x,
      startY: startPoint?.y
    });
  };

  const stopDrawing = (e: React.MouseEvent) => {
    if (!contextRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === 'shape' && startPoint) {
      drawShape(startPoint.x, startPoint.y, x, y, shape, color);
      socket.emit('draw', roomId, {
        x,
        y,
        startX: startPoint.x,
        startY: startPoint.y,
        color,
        lineWidth,
        tool,
        shape
      });
    }

    contextRef.current.closePath();
    setIsDrawing(false);
    setStartPoint(null);
    setCanvasImageData(contextRef.current.getImageData(0, 0, canvas.width, canvas.height));
  };

  const clearCanvas = () => {
    if (!contextRef.current || !canvasRef.current) return;
    contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    socket.emit('clear', roomId);
  };

  return (
    <div className="flex">
      <div className="flex flex-col gap-4 items-center mb-4 bg-white p-4 rounded-lg shadow-md fixed left-0 top-0 h-full">
        <div className="flex flex-col gap-4">
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