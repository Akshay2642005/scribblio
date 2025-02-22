import React, { useRef, useEffect, useState } from 'react';

interface CanvasProps {
  isDrawing: boolean;
}

export const Canvas: React.FC<CanvasProps> = ({ isDrawing }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawingActive, setIsDrawingActive] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    setContext(ctx);

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas || !context) return;

    setIsDrawingActive(true);
    const rect = canvas.getBoundingClientRect();
    context.beginPath();
    context.moveTo(
      e.clientX - rect.left,
      e.clientY - rect.top
    );
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingActive || !isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas || !context) return;

    const rect = canvas.getBoundingClientRect();
    context.lineTo(
      e.clientX - rect.left,
      e.clientY - rect.top
    );
    context.stroke();
  };

  const stopDrawing = () => {
    setIsDrawingActive(false);
    context?.closePath();
  };

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-[500px] bg-white rounded-lg shadow-md cursor-crosshair"
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
    />
  );
};