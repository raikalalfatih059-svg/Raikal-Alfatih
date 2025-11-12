import React, { useRef, useEffect } from 'react';

interface VisualizerProps {
  analyserNode: AnalyserNode | null;
  isPlaying: boolean;
  isVisible: boolean;
  theme: 'light' | 'dark';
}

const Visualizer: React.FC<VisualizerProps> = ({ analyserNode, isPlaying, isVisible, theme }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isVisible || !analyserNode || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let animationFrameId: number;

    const draw = () => {
      animationFrameId = requestAnimationFrame(draw);
      
      analyserNode.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 1.5;
      let x = 0;

      const primaryColor = theme === 'dark' ? '#38bdf8' : '#0ea5e9'; // light-blue-400 for dark, light-blue-500 for light

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
        gradient.addColorStop(0, primaryColor);
        gradient.addColorStop(1, theme === 'dark' ? '#7dd3fc' : '#38bdf8'); // lighter shades for gradient top

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 2; // Add 2 for spacing between bars
      }
    };
    
    // Clear canvas when not playing
    if (!isPlaying) {
        cancelAnimationFrame(animationFrameId);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [analyserNode, isPlaying, isVisible, theme]);
  
  // Handle canvas resizing
  useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const resizeCanvas = () => {
          const container = canvas.parentElement;
          if (container) {
              canvas.width = container.clientWidth;
              canvas.height = container.clientHeight;
          }
      }
      
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
      return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  if (!isVisible) {
    return <div className="h-20 w-full" />; // Keep space when hidden
  }

  return (
    <div className="h-20 w-full my-2">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

export default Visualizer;
