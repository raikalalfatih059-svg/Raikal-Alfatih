import React from 'react';
import { MoonIcon, SunIcon } from './icons';

interface SettingsProps {
  isVisible: boolean;
  onClose: () => void;
  onClearQueue: () => void;
  onResetPlayer: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  playbackRate: number;
  onPlaybackRateChange: (rate: number) => void;
}

const PLAYBACK_SPEEDS = [0.5, 1.0, 1.5, 2.0];

const Settings: React.FC<SettingsProps> = ({
  isVisible,
  onClose,
  onClearQueue,
  onResetPlayer,
  theme,
  onToggleTheme,
  playbackRate,
  onPlaybackRateChange,
}) => {
  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-sm m-4 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-center text-gray-800 dark:text-gray-100">Settings</h3>
        
        {/* Appearance Section */}
        <div className="space-y-4">
            <h4 className="font-semibold text-gray-600 dark:text-gray-300">Appearance</h4>
            <div className="flex items-center justify-between p-3 bg-light-blue-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center space-x-2">
                    {theme === 'light' ? <SunIcon className="w-5 h-5 text-yellow-500" /> : <MoonIcon className="w-5 h-5 text-indigo-400" />}
                    <label htmlFor="theme-toggle" className="text-gray-700 dark:text-gray-200 font-medium">
                        {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
                    </label>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" id="theme-toggle" checked={theme === 'dark'} onChange={onToggleTheme} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-light-blue-300 dark:peer-focus:ring-light-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-light-blue-600"></div>
                </label>
            </div>
        </div>
        
        {/* Playback Speed Section */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-600 dark:text-gray-300">Playback Speed</h4>
          <div className="flex items-center justify-between p-2 bg-light-blue-50 dark:bg-gray-700/50 rounded-lg space-x-1">
            {PLAYBACK_SPEEDS.map((rate) => (
              <button
                key={rate}
                onClick={() => onPlaybackRateChange(rate)}
                className={`flex-1 py-2 px-3 text-sm font-bold rounded-md transition-colors duration-200 ${
                  playbackRate === rate
                    ? 'bg-light-blue-500 text-white shadow'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-light-blue-100 dark:hover:bg-gray-600'
                }`}
                aria-pressed={playbackRate === rate}
              >
                {rate.toFixed(1)}x
              </button>
            ))}
          </div>
        </div>

        {/* Actions Section */}
        <div className="space-y-2">
            <h4 className="font-semibold text-gray-600 dark:text-gray-300">Actions</h4>
            <button 
              onClick={onClearQueue} 
              className="w-full text-left py-2 px-4 bg-light-blue-50 dark:bg-gray-700/50 text-gray-800 dark:text-gray-100 rounded-lg hover:bg-light-blue-100 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Clear Queue
            </button>
            <button 
              onClick={onResetPlayer} 
              className="w-full text-left py-2 px-4 bg-light-blue-50 dark:bg-gray-700/50 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors font-medium"
            >
              Reset Player
            </button>
        </div>
        
        <div className="pt-4">
            <button 
              onClick={onClose} 
              className="w-full py-2 px-4 bg-light-blue-500 text-white rounded-lg hover:bg-light-blue-600 transition-colors font-semibold"
            >
              Done
            </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;