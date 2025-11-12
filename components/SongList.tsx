import React from 'react';
import { Song } from '../types';
import { PlayIcon, PauseIcon, PlusIcon, CheckIcon } from './icons';

interface SongListProps {
  songs: (Song & { originalIndex: number })[];
  currentSongIndex: number;
  onSongSelect: (index: number) => void;
  isPlaying: boolean;
  playQueue: number[];
  onAddToQueue: (index: number) => void;
}

const SongList: React.FC<SongListProps> = ({ songs, currentSongIndex, onSongSelect, isPlaying, playQueue, onAddToQueue }) => {
  return (
    <div className="max-h-48 overflow-y-auto bg-light-blue-50 dark:bg-gray-700/50 rounded-lg p-2">
      <ul className="divide-y divide-light-blue-100 dark:divide-gray-700">
        {songs.map((song) => {
          const index = song.originalIndex;
          const isActive = index === currentSongIndex;
          const isQueued = playQueue.includes(index);
          return (
            <li
              key={index}
              onClick={() => onSongSelect(index)}
              className={`flex items-center p-3 cursor-pointer rounded-lg transition-colors duration-200 ${
                isActive
                  ? 'bg-light-blue-100 dark:bg-light-blue-900/50 text-light-blue-800 dark:text-light-blue-300'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-light-blue-100 dark:hover:bg-gray-700'
              }`}
            >
              <div className="w-10 h-10 mr-4 flex-shrink-0">
                  {isActive && isPlaying ? (
                       <div className="w-10 h-10 bg-light-blue-500 dark:bg-light-blue-600 rounded-md flex items-center justify-center text-white dark:text-gray-100">
                        <PauseIcon className="w-5 h-5"/>
                       </div>
                  ) : isActive && !isPlaying ? (
                       <div className="w-10 h-10 bg-light-blue-500 dark:bg-light-blue-600 rounded-md flex items-center justify-center text-white dark:text-gray-100">
                        <PlayIcon className="w-5 h-5"/>
                       </div>
                  ) : (
                    <img src={song.cover} alt={song.title} className="w-full h-full object-cover rounded-md" />
                  )}
              </div>

              <div className="flex-grow truncate">
                <p className={`font-semibold ${isActive ? 'text-light-blue-800 dark:text-light-blue-300' : 'text-gray-700 dark:text-gray-200'}`}>
                  {song.title}
                </p>
                <p className={`text-sm ${isActive ? 'text-light-blue-600 dark:text-light-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  {song.artist}
                </p>
              </div>
              
              {!isActive && (
                <button
                  onClick={(e) => { e.stopPropagation(); onAddToQueue(index); }}
                  disabled={isQueued}
                  className="ml-4 p-2 rounded-full text-gray-400 hover:text-light-blue-500 dark:hover:text-light-blue-400 disabled:text-green-500 disabled:cursor-not-allowed transition-colors"
                  aria-label={isQueued ? "Added to queue" : "Add to queue"}
                >
                  {isQueued ? <CheckIcon className="w-5 h-5" /> : <PlusIcon className="w-5 h-5" />}
                </button>
              )}

              <span className={`text-sm font-medium ml-2 ${isActive ? 'text-light-blue-700 dark:text-light-blue-400' : 'text-gray-400 dark:text-gray-500'}`}>
                {song.duration}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default SongList;