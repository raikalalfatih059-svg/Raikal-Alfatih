import React, { useRef } from 'react';
import { Song } from '../types';
import { CloseIcon, DragHandleIcon } from './icons';

interface PlayQueueProps {
  songs: Song[];
  playQueue: number[];
  currentSongIndex: number;
  onSongSelect: (index: number) => void;
  onReorderQueue: (startIndex: number, endIndex: number) => void;
  onRemoveFromQueue: (songIndex: number) => void;
}

const PlayQueue: React.FC<PlayQueueProps> = ({ songs, playQueue, currentSongIndex, onSongSelect, onReorderQueue, onRemoveFromQueue }) => {
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const queuedSongs = playQueue.map(index => ({ ...songs[index], originalIndex: index }));

  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, position: number) => {
    dragItem.current = position;
  };

  const handleDragEnter = (e: React.DragEvent<HTMLLIElement>, position: number) => {
    dragOverItem.current = position;
  };

  const handleDrop = () => {
    if (dragItem.current !== null && dragOverItem.current !== null) {
      onReorderQueue(dragItem.current, dragOverItem.current);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };
  
  const handleDragEnd = () => {
    // Clean up refs
    dragItem.current = null;
    dragOverItem.current = null;
  };

  if (queuedSongs.length === 0) {
    return (
      <div className="max-h-48 h-48 flex items-center justify-center bg-light-blue-50 dark:bg-gray-700/50 rounded-lg p-2">
        <p className="text-gray-500 dark:text-gray-400">The play queue is empty.</p>
      </div>
    );
  }

  return (
    <div className="max-h-48 overflow-y-auto bg-light-blue-50 dark:bg-gray-700/50 rounded-lg p-2">
      <ul onDrop={handleDrop} onDragEnd={handleDragEnd} className="divide-y divide-light-blue-100 dark:divide-gray-700">
        {queuedSongs.map((song, index) => {
          const isActive = song.originalIndex === currentSongIndex;
          return (
            <li
              key={`${song.originalIndex}-${index}`}
              className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
                isActive
                  ? 'bg-light-blue-100 dark:bg-light-blue-900/50 text-light-blue-800 dark:text-light-blue-300'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-light-blue-100 dark:hover:bg-gray-700'
              }`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnter={(e) => handleDragEnter(e, index)}
              onDragOver={(e) => e.preventDefault()}
            >
              <div className="cursor-grab mr-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                <DragHandleIcon className="w-5 h-5" />
              </div>
              <div className="flex-grow truncate cursor-pointer" onClick={() => onSongSelect(song.originalIndex)}>
                <p className={`font-semibold ${isActive ? 'text-light-blue-800 dark:text-light-blue-300' : 'text-gray-700 dark:text-gray-200'}`}>
                  {song.title}
                </p>
                <p className={`text-sm ${isActive ? 'text-light-blue-600 dark:text-light-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  {song.artist}
                </p>
              </div>
              
              <button
                onClick={(e) => { e.stopPropagation(); onRemoveFromQueue(song.originalIndex); }}
                className="ml-4 p-2 rounded-full text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                aria-label="Remove from queue"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default PlayQueue;