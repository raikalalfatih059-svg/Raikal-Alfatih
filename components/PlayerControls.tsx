import React from 'react';
import { PlayIcon, PauseIcon, NextIcon, PrevIcon, RepeatIcon, ShuffleIcon, VolumeIcon, EqualizerIcon, VisualizerIcon } from './icons';

interface PlayerControlsProps {
  isPlaying: boolean;
  isLooping: boolean;
  isShuffled: boolean;
  isVisualizerVisible: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  toggleLoop: () => void;
  toggleShuffle: () => void;
  onEqToggle: () => void;
  onVisualizerToggle: () => void;
  volume: number;
  onVolumeChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isFading: boolean;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({
  isPlaying,
  isLooping,
  isShuffled,
  isVisualizerVisible,
  onPlayPause,
  onNext,
  onPrev,
  toggleLoop,
  toggleShuffle,
  onEqToggle,
  onVisualizerToggle,
  volume,
  onVolumeChange,
  isFading,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={toggleShuffle}
          className={`p-2 rounded-full transition-colors duration-200 ${isShuffled ? 'text-light-blue-500 dark:text-light-blue-400' : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'}`}
          aria-label="Shuffle"
        >
          <ShuffleIcon className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        
        <button
          onClick={onEqToggle}
          className="p-2 rounded-full text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors duration-200"
          aria-label="Equalizer"
        >
          <EqualizerIcon className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <button 
            onClick={onPrev} 
            className="p-2 rounded-full text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
            aria-label="Previous song"
            disabled={isFading}
        >
          <PrevIcon className="w-7 h-7 sm:w-8 sm:h-8" />
        </button>

        <button
          onClick={onPlayPause}
          className="p-4 bg-light-blue-500 dark:bg-light-blue-600 text-white dark:text-gray-100 rounded-full shadow-lg hover:bg-light-blue-600 dark:hover:bg-light-blue-500 transition-transform transform hover:scale-105 duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          aria-label={isPlaying ? 'Pause' : 'Play'}
          disabled={isFading}
        >
          {isPlaying ? <PauseIcon className="w-8 h-8" /> : <PlayIcon className="w-8 h-8" />}
        </button>

        <button 
            onClick={onNext} 
            className="p-2 rounded-full text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
            aria-label="Next song"
            disabled={isFading}
        >
          <NextIcon className="w-7 h-7 sm:w-8 sm:h-8" />
        </button>
        
        <button
          onClick={onVisualizerToggle}
          className={`p-2 rounded-full transition-colors duration-200 ${isVisualizerVisible ? 'text-light-blue-500 dark:text-light-blue-400' : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'}`}
          aria-label="Toggle Visualizer"
        >
          <VisualizerIcon className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <button
          onClick={toggleLoop}
          className={`p-2 rounded-full transition-colors duration-200 ${isLooping ? 'text-light-blue-500 dark:text-light-blue-400' : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'}`}
          aria-label="Repeat"
        >
          <RepeatIcon className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>
      <div className="flex items-center space-x-3">
        <VolumeIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={onVolumeChange}
          className="w-full h-2 bg-light-blue-100 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-light-blue-500 dark:accent-light-blue-400"
          aria-label="Volume"
        />
      </div>
    </div>
  );
};

export default PlayerControls;