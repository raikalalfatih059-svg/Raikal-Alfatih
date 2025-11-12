import React from 'react';

interface EqualizerProps {
  isVisible: boolean;
  onClose: () => void;
  settings: number[];
  onSettingChange: (bandIndex: number, gain: number) => void;
  presets: Record<string, number[]>;
  onPresetChange: (preset: keyof EqualizerProps['presets']) => void;
  isEnabled: boolean;
  onToggle: () => void;
  onReset: () => void;
  bands: { frequency: number; type: BiquadFilterType, label: string }[];
}

const Equalizer: React.FC<EqualizerProps> = ({
  isVisible,
  onClose,
  settings,
  onSettingChange,
  presets,
  onPresetChange,
  isEnabled,
  onToggle,
  onReset,
  bands
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
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-sm m-4 text-center space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Equalizer</h3>
        
        {/* Sliders */}
        <div className="flex justify-around items-end h-48 py-4">
          {bands.map((band, index) => (
            <div key={band.frequency} className="flex flex-col items-center space-y-2">
              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                {settings[index] > 0 ? '+' : ''}{settings[index]}
              </span>
              <input
                type="range"
                min="-12"
                max="12"
                step="1"
                value={settings[index]}
                onChange={(e) => onSettingChange(index, Number(e.target.value))}
                className="w-24 h-4 appearance-none -rotate-90 origin-center cursor-pointer accent-light-blue-500 dark:accent-light-blue-400 bg-light-blue-100 dark:bg-gray-700 rounded-lg"
                aria-label={`${band.label} Hz band`}
              />
              <span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">{band.label}</span>
            </div>
          ))}
        </div>
        
        {/* Controls */}
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label htmlFor="eq-toggle" className="text-gray-700 dark:text-gray-200 font-medium">
                    {isEnabled ? 'Enabled' : 'Disabled'}
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" id="eq-toggle" checked={isEnabled} onChange={onToggle} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-light-blue-300 dark:peer-focus:ring-light-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-light-blue-600"></div>
                </label>
            </div>
            <div>
              <label htmlFor="preset-select" className="sr-only">Select Preset</label>
              <select 
                id="preset-select"
                onChange={(e) => onPresetChange(e.target.value)}
                className="w-full p-2 border border-light-blue-100 dark:border-gray-700 bg-light-blue-50 dark:bg-gray-700/50 rounded-lg text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-light-blue-500 transition-colors"
              >
                <option>Select Preset...</option>
                {Object.keys(presets).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="flex items-center space-x-4">
                <button 
                  onClick={onReset} 
                  className="w-full py-2 px-4 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors font-semibold"
                >
                  Reset
                </button>
                <button 
                  onClick={onClose} 
                  className="w-full py-2 px-4 bg-light-blue-500 text-white rounded-lg hover:bg-light-blue-600 transition-colors font-semibold"
                >
                  Done
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Equalizer;