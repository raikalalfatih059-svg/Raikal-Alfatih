import React from 'react';

interface LyricsProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  artist: string;
  lyrics: string;
}

const Lyrics: React.FC<LyricsProps> = ({ isVisible, onClose, title, artist, lyrics }) => {
  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-lg m-4 flex flex-col"
        style={{ maxHeight: '80vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-4 flex-shrink-0">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{title}</h3>
          <p className="text-md text-gray-500 dark:text-gray-400">{artist}</p>
        </div>

        <div className="overflow-y-auto flex-grow pr-2 text-center">
          <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
            {lyrics || 'No lyrics available for this song.'}
          </p>
        </div>

        <div className="pt-4 mt-auto flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-light-blue-500 text-white rounded-lg hover:bg-light-blue-600 transition-colors font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Lyrics;
