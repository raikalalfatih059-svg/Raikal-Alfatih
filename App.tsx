import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Song } from './types';
import { SONGS, EQ_BANDS, EQ_PRESETS } from './constants';
import PlayerControls from './components/PlayerControls';
import ProgressBar from './components/ProgressBar';
import SongList from './components/SongList';
import AlbumArt from './components/AlbumArt';
import SearchBar from './components/SearchBar';
import Equalizer from './components/Equalizer';
import Settings from './components/Settings';
import { SettingsIcon } from './components/icons';

const App: React.FC = () => {
  const [songs] = useState<Song[]>(SONGS);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [shuffledPlaylist, setShuffledPlaylist] = useState<number[]>([]);
  const [volume, setVolume] = useState(1);
  const [playQueue, setPlayQueue] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  // Fix: Explicitly type the theme state to satisfy the Settings component's theme prop type.
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        return 'dark';
      }
    }
    return 'light';
  });

  const [isEqVisible, setIsEqVisible] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isEqEnabled, setIsEqEnabled] = useState(true);
  const [eqSettings, setEqSettings] = useState<number[]>(EQ_PRESETS.Flat);

  const audioRef = useRef<HTMLAudioElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const filterNodesRef = useRef<BiquadFilterNode[]>([]);

  const currentSong = songs[currentSongIndex];
  
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  // Web Audio API setup for Equalizer
  useEffect(() => {
    if (!audioRef.current) return;

    const setupAudioContext = () => {
      if (!audioCtxRef.current) {
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioCtxRef.current = context;

        if (!sourceNodeRef.current) {
          sourceNodeRef.current = context.createMediaElementSource(audioRef.current as HTMLAudioElement);
        }
        
        const filters = EQ_BANDS.map(band => {
          const filter = context.createBiquadFilter();
          filter.type = band.type;
          filter.frequency.value = band.frequency;
          filter.Q.value = 1;
          filter.gain.value = 0;
          return filter;
        });
        filterNodesRef.current = filters;

        let lastNode: AudioNode = sourceNodeRef.current;
        filters.forEach(filter => {
          lastNode.connect(filter);
          lastNode = filter;
        });
        lastNode.connect(context.destination);
      }
    };
    
    setupAudioContext();

    const resumeAudioContext = () => {
        if (audioCtxRef.current?.state === 'suspended') {
            audioCtxRef.current.resume();
        }
    };

    const audioEl = audioRef.current;
    audioEl.addEventListener('play', resumeAudioContext);

    return () => {
        audioEl.removeEventListener('play', resumeAudioContext);
    };
  }, []);

  useEffect(() => {
    filterNodesRef.current.forEach((filter, index) => {
        if (filter) {
            filter.gain.value = isEqEnabled ? eqSettings[index] : 0;
        }
    });
  }, [eqSettings, isEqEnabled]);


  const createShuffledPlaylist = useCallback(() => {
    const originalIndexes = songs.map((_, index) => index);
    const shuffled = originalIndexes.sort(() => Math.random() - 0.5);
    setShuffledPlaylist(shuffled);
  }, [songs]);

  useEffect(() => {
    if (isShuffled) {
      createShuffledPlaylist();
    }
  }, [isShuffled, createShuffledPlaylist]);

  useEffect(() => {
    if (isPlaying) {
      audioCtxRef.current?.resume();
      audioRef.current?.play().catch(error => console.error("Error playing audio:", error));
    } else {
      audioRef.current?.pause();
    }
  }, [isPlaying, currentSongIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);
  
  const filteredSongs = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (!query) {
      return songs.map((song, index) => ({ ...song, originalIndex: index }));
    }
    return songs
      .map((song, index) => ({ ...song, originalIndex: index }))
      .filter(song =>
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query)
      );
  }, [songs, searchQuery]);


  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };
  
  const getNextSongIndex = useCallback(() => {
    if (isShuffled) {
      const currentPlaylistIndex = shuffledPlaylist.indexOf(currentSongIndex);
      const nextPlaylistIndex = (currentPlaylistIndex + 1) % shuffledPlaylist.length;
      return shuffledPlaylist[nextPlaylistIndex];
    } else {
      return (currentSongIndex + 1) % songs.length;
    }
  }, [currentSongIndex, songs.length, isShuffled, shuffledPlaylist]);

  const handleNext = useCallback(() => {
    if (playQueue.length > 0) {
      const nextSongIndex = playQueue[0];
      setPlayQueue(q => q.slice(1));
      setCurrentSongIndex(nextSongIndex);
      return;
    }
    setCurrentSongIndex(getNextSongIndex());
  }, [getNextSongIndex, playQueue]);

  const handleSongEnd = useCallback(() => {
    if (isLooping) {
      if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play();
      }
    } else {
        handleNext();
    }
  }, [isLooping, handleNext]);
  
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePrev = () => {
    if (isShuffled) {
      const currentPlaylistIndex = shuffledPlaylist.indexOf(currentSongIndex);
      const prevPlaylistIndex = (currentPlaylistIndex - 1 + shuffledPlaylist.length) % shuffledPlaylist.length;
      setCurrentSongIndex(shuffledPlaylist[prevPlaylistIndex]);
    } else {
       setCurrentSongIndex((prevIndex) => (prevIndex - 1 + songs.length) % songs.length);
    }
  };
  
  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Number(event.target.value);
      setCurrentTime(Number(event.target.value));
    }
  };
  
  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(event.target.value));
  };

  const handleSongSelect = (index: number) => {
    setCurrentSongIndex(index);
    setIsPlaying(true);
  };
  
  const handleAddToQueue = (index: number) => {
    if (index === currentSongIndex || playQueue.includes(index)) {
      return;
    }
    setPlayQueue((prevQueue) => [...prevQueue, index]);
  };
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };
  
  const handleEqChange = (bandIndex: number, gain: number) => {
    const newSettings = [...eqSettings];
    newSettings[bandIndex] = gain;
    setEqSettings(newSettings);
  };
  
  const handlePresetChange = (preset: keyof typeof EQ_PRESETS) => {
    setEqSettings(EQ_PRESETS[preset]);
  };
  
  const handleClearQueue = () => {
    setPlayQueue([]);
  };
  
  const handleResetPlayer = () => {
    setIsPlaying(false);
    setCurrentSongIndex(0);
    setPlayQueue([]);
    setIsLooping(false);
    setIsShuffled(false);
    setVolume(1);
    setEqSettings(EQ_PRESETS.Flat);
    setIsEqEnabled(true);
    setSearchQuery('');
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  const toggleLoop = () => setIsLooping(!isLooping);
  const toggleShuffle = () => setIsShuffled(!isShuffled);
  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  return (
    <div className="min-h-screen bg-light-blue-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 flex items-center justify-center p-4 font-sans transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 space-y-6 relative">
        <Equalizer
          isVisible={isEqVisible}
          onClose={() => setIsEqVisible(false)}
          settings={eqSettings}
          onSettingChange={handleEqChange}
          presets={EQ_PRESETS}
          onPresetChange={handlePresetChange}
          isEnabled={isEqEnabled}
          onToggle={() => setIsEqEnabled(!isEqEnabled)}
          onReset={() => setEqSettings(EQ_PRESETS.Flat)}
          bands={EQ_BANDS}
        />
        
        <Settings
          isVisible={isSettingsVisible}
          onClose={() => setIsSettingsVisible(false)}
          onClearQueue={handleClearQueue}
          onResetPlayer={handleResetPlayer}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        <div className="flex justify-between items-center">
            <button onClick={() => setIsSettingsVisible(true)} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="Settings">
                <SettingsIcon className="w-6 h-6"/>
            </button>
            <h1 className="text-2xl font-bold text-light-blue-800 dark:text-light-blue-400">Simple MP3 Player</h1>
            <div className="w-10"></div> {/* Spacer to keep title centered */}
        </div>

        <AlbumArt cover={currentSong.cover} />
        
        <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-100 truncate">{currentSong.title}</h2>
            <p className="text-md text-gray-500 dark:text-gray-400">{currentSong.artist}</p>
        </div>
        
        <audio
          ref={audioRef}
          src={currentSong.url}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleSongEnd}
          loop={isLooping}
          crossOrigin="anonymous"
        />
        
        <ProgressBar duration={duration} currentTime={currentTime} onSeek={handleSeek} />
        
        <PlayerControls
          isPlaying={isPlaying}
          isLooping={isLooping}
          isShuffled={isShuffled}
          onPlayPause={handlePlayPause}
          onNext={handleNext}
          onPrev={handlePrev}
          toggleLoop={toggleLoop}
          toggleShuffle={toggleShuffle}
          onEqToggle={() => setIsEqVisible(!isEqVisible)}
          volume={volume}
          onVolumeChange={handleVolumeChange}
        />
        
        <SearchBar value={searchQuery} onChange={handleSearchChange} />
        
        <SongList 
          songs={filteredSongs} 
          currentSongIndex={currentSongIndex} 
          onSongSelect={handleSongSelect} 
          isPlaying={isPlaying}
          playQueue={playQueue}
          onAddToQueue={handleAddToQueue}
        />
      </div>
    </div>
  );
};

export default App;