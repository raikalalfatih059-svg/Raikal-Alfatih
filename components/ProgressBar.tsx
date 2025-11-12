import React from 'react';

interface ProgressBarProps {
  duration: number;
  currentTime: number;
  onSeek: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ duration, currentTime, onSeek }) => {
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-1">
      <input
        type="range"
        min="0"
        max={duration || 0}
        value={currentTime}
        onChange={onSeek}
        className="w-full h-2 bg-light-blue-100 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-light-blue-500 dark:accent-light-blue-400"
      />
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 font-medium">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};

export default ProgressBar;