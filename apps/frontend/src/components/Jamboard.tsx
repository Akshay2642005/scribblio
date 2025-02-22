import React, { useRef, useEffect, useState } from 'react';
import { useJamboardStore } from '../store/jamboardStore';
import { Eraser, Paintbrush, Trash2 } from 'lucide-react';

interface Point {
  x: number;
  y: number;
  color: string;
  width: number;
}

export const Jamboard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  
  const {
    strokes,
    currentColor,
    currentWidth,
    isErasing,
    addStroke,
    setCurrentColor,
    setCurrentWidth,
    setIsErasing,
    clearBoard
  } = useJamboardStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Redraw all strokes
    strokes.forEach(stroke => {
      if (stroke.points.length < 2) return;
      
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    });
  }, [strokes]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setCurrentStroke([{ x, y, color: isErasing ? '#ffffff' : currentColor, width: isErasing ? 20 : currentWidth }]);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentStroke(prev => [...prev, { x, y, color: isErasing ? '#ffffff' : currentColor, width: isErasing ? 20 : currentWidth }]);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const points = currentStroke;
    if (points.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(points[points.length - 2].x, points[points.length - 2].y);
    ctx.lineTo(x, y);
    ctx.strokeStyle = isErasing ? '#ffffff' : currentColor;
    ctx.lineWidth = isErasing ? 20 : currentWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;

    setIsDrawing(false);
    if (currentStroke.length > 0) {
      addStroke({
        id: Date.now().toString(),
        points: currentStroke,
        color: isErasing ? '#ffffff' : currentColor,
        width: isErasing ? 20 : currentWidth
      });
      setCurrentStroke([]);
    }
  };

  const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
  const widths = [2, 4, 6, 8, 10];

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {colors.map(color => (
              <button
                key={color}
                className={`w-8 h-8 rounded-full border-2 ${currentColor === color ? 'border-gray-600' : 'border-gray-200'}`}
                style={{ backgroundColor: color }}
                onClick={() => {
                  setCurrentColor(color);
                  setIsErasing(false);
                }}
              />
            ))}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {widths.map(width => (
                <button
                  key={width}
                  className={`w-8 h-8 rounded flex items-center justify-center ${currentWidth === width && !isErasing ? 'bg-gray-200' : 'bg-white'}`}
                  onClick={() => {
                    setCurrentWidth(width);
                    setIsErasing(false);
                  }}
                >
                  <div
                    className="rounded-full bg-black"
                    style={{ width: width, height: width }}
                  />
                </button>
              ))}
            </div>
            <button
              className={`p-2 rounded ${isErasing ? 'bg-gray-200' : 'bg-white'} hover:bg-gray-100`}
              onClick={() => setIsErasing(!isErasing)}
            >
              {isErasing ? <Eraser className="w-6 h-6" /> : <Paintbrush className="w-6 h-6" />}
            </button>
            <button
              className="p-2 rounded bg-white hover:bg-gray-100"
              onClick={clearBoard}
            >
              <Trash2 className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full h-[600px] bg-white rounded-lg shadow-md cursor-crosshair"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
    </div>
  );
};