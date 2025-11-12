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
import Lyrics from './components/Lyrics';
import Visualizer from './components/Visualizer';
import { SettingsIcon, LyricsIcon } from './components/icons';
import PlayQueue from './components/PlayQueue';

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
  const [playbackRate, setPlaybackRate] = useState(1);
  const [playQueue, setPlayQueue] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [currentLyrics, setCurrentLyrics] = useState<string>('');
  
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
  const [isLyricsVisible, setIsLyricsVisible] = useState(false);
  const [isQueueVisible, setIsQueueVisible] = useState(false);
  const [isVisualizerVisible, setIsVisualizerVisible] = useState(true);
  const [isEqEnabled, setIsEqEnabled] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [eqSettings, setEqSettings] = useState<number[]>(EQ_PRESETS.Flat);

  const audioRef = useRef<HTMLAudioElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  const filterNodesRef = useRef<BiquadFilterNode[]>([]);

  const currentSong = songs[currentSongIndex];
  
  const fetchLyrics = useCallback(async (artist: string, title: string, initialLyrics: string) => {
    if (initialLyrics === '(Instrumental)') {
      setCurrentLyrics(initialLyrics);
      return;
    }
    
    setCurrentLyrics('Loading lyrics...');
    try {
      const response = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
      if (!response.ok) {
        throw new Error('Lyrics not found');
      }
      const data = await response.json();
      const formattedLyrics = data.lyrics ? data.lyrics.replace(/(\r\n|\r|\n){2,}/g, '\n\n').trim() : '';

      if (!formattedLyrics) {
          setCurrentLyrics('No lyrics found for this song.');
      } else {
          setCurrentLyrics(formattedLyrics);
      }
    } catch (error) {
      console.error('Error fetching lyrics:', error);
      setCurrentLyrics('Could not fetch lyrics at this time.');
    }
  }, []);

  useEffect(() => {
    if (currentSong) {
      fetchLyrics(currentSong.artist, currentSong.title, currentSong.lyrics);
    }
  }, [currentSong, fetchLyrics]);
  
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

  // Web Audio API setup for Equalizer and Visualizer
  useEffect(() => {
    if (!audioRef.current) return;

    const setupAudioContext = () => {
      if (!audioCtxRef.current) {
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioCtxRef.current = context;

        if (!sourceNodeRef.current) {
          sourceNodeRef.current = context.createMediaElementSource(audioRef.current as HTMLAudioElement);
        }
        
        const analyser = context.createAnalyser();
        analyser.fftSize = 256;
        analyserNodeRef.current = analyser;

        const filters = EQ_BANDS.map(band => {
          const filter = context.createBiquadFilter();
          filter.type = band.type;
          filter.frequency.value = band.frequency;
          filter.Q.value = 1;
          filter.gain.value = 0;
          return filter;
        });
        filterNodesRef.current = filters;

        // Chain: Source -> Filters -> Analyser -> Destination
        let lastNode: AudioNode = sourceNodeRef.current;
        filters.forEach(filter => {
          lastNode.connect(filter);
          lastNode = filter;
        });
        lastNode.connect(analyserNodeRef.current);
        analyserNodeRef.current.connect(context.destination);
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
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);
  
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  useEffect(() => {
    const introDuration = currentSong?.introDuration;
    if (introDuration && isPlaying && currentTime > 1 && currentTime < introDuration) {
      setShowSkipIntro(true);
    } else {
      setShowSkipIntro(false);
    }
  }, [currentTime, currentSong, isPlaying]);
  
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
  
  const transitionToSong = useCallback((newIndex: number) => {
    if (isFading || !audioRef.current || newIndex === currentSongIndex) return;

    const audio = audioRef.current;
    const FADE_TIME = 500;
    const FADE_INTERVALS = 25;
    const stepDuration = FADE_TIME / FADE_INTERVALS;
    const targetVolume = volume;
    const volumeStep = targetVolume / FADE_INTERVALS;

    setIsFading(true);
    
    const startNewSongAndFadeIn = () => {
        setCurrentSongIndex(newIndex);
        
        const onCanPlay = () => {
            audio.removeEventListener('canplaythrough', onCanPlay);
            audio.volume = 0;
            audio.play();
            setIsPlaying(true);

            const fadeInInterval = setInterval(() => {
                const newVolume = audio.volume + volumeStep;
                if (newVolume >= targetVolume) {
                    clearInterval(fadeInInterval);
                    audio.volume = targetVolume;
                    setIsFading(false);
                } else {
                    audio.volume = newVolume;
                }
            }, stepDuration);
        };
        audio.addEventListener('canplaythrough', onCanPlay, { once: true });
    };

    if (audio.paused || audio.currentTime === 0 || audio.volume === 0) {
        startNewSongAndFadeIn();
    } else {
        const fadeOutInterval = setInterval(() => {
            const newVolume = audio.volume - volumeStep;
            if (newVolume <= 0) {
                clearInterval(fadeOutInterval);
                audio.volume = 0;
                audio.pause();
                startNewSongAndFadeIn();
            } else {
                audio.volume = newVolume;
            }
        }, stepDuration);
    }
  }, [isFading, volume, currentSongIndex, songs.length]);

  const handleNext = useCallback(() => {
    if (playQueue.length > 0) {
      const nextSongIndex = playQueue[0];
      setPlayQueue(q => q.slice(1));
      transitionToSong(nextSongIndex);
      return;
    }
    transitionToSong(getNextSongIndex());
  }, [getNextSongIndex, playQueue, transitionToSong]);

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
    if (isFading) return;
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioCtxRef.current?.resume();
      audioRef.current?.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  const handlePrev = () => {
    let prevIndex;
    if (isShuffled) {
      const currentPlaylistIndex = shuffledPlaylist.indexOf(currentSongIndex);
      const prevPlaylistIndex = (currentPlaylistIndex - 1 + shuffledPlaylist.length) % shuffledPlaylist.length;
      prevIndex = shuffledPlaylist[prevPlaylistIndex];
    } else {
       prevIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    }
    transitionToSong(prevIndex);
  };
  
  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Number(event.target.value);
      setCurrentTime(Number(event.target.value));
    }
  };
  
  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(event.target.value);
    setVolume(newVolume);
    if(audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleSongSelect = (index: number) => {
    if (index === currentSongIndex) {
        handlePlayPause();
        return;
    }
    transitionToSong(index);
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

  const handleRemoveFromQueue = (songIndexToRemove: number) => {
    setPlayQueue(currentQueue => currentQueue.filter(index => index !== songIndexToRemove));
  };
  
  const handleReorderQueue = (startIndex: number, endIndex: number) => {
    setPlayQueue(currentQueue => {
        const newQueue = [...currentQueue];
        const [removed] = newQueue.splice(startIndex, 1);
        newQueue.splice(endIndex, 0, removed);
        return newQueue;
    });
  };
  
  const handleResetPlayer = () => {
    setIsPlaying(false);
    setCurrentSongIndex(0);
    setPlayQueue([]);
    setIsLooping(false);
    setIsShuffled(false);
    setVolume(1);
    setPlaybackRate(1);
    setEqSettings(EQ_PRESETS.Flat);
    setIsEqEnabled(true);
    setSearchQuery('');
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  const handleSkipIntro = () => {
    if (audioRef.current && currentSong.introDuration) {
      audioRef.current.currentTime = currentSong.introDuration;
      setCurrentTime(currentSong.introDuration);
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
          playbackRate={playbackRate}
          onPlaybackRateChange={setPlaybackRate}
        />
        
        <Lyrics
          isVisible={isLyricsVisible}
          onClose={() => setIsLyricsVisible(false)}
          title={currentSong.title}
          artist={currentSong.artist}
          lyrics={currentLyrics}
        />

        <div className="flex justify-between items-center">
            <button onClick={() => setIsSettingsVisible(true)} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="Settings">
                <SettingsIcon className="w-6 h-6"/>
            </button>
            <h1 className="text-2xl font-bold text-light-blue-800 dark:text-light-blue-400">Simple MP3 Player</h1>
            <div className="w-10"></div> {/* Spacer to keep title centered */}
        </div>

        <AlbumArt cover={currentSong.cover} />

        <Visualizer analyserNode={analyserNodeRef.current} isPlaying={isPlaying} isVisible={isVisualizerVisible} theme={theme} />
        
        <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-100 truncate">{currentSong.title}</h2>
            <p className="text-md text-gray-500 dark:text-gray-400">{currentSong.artist}</p>
            <div className="mt-2 flex items-center justify-center space-x-4 h-6">
                <button
                    onClick={() => setIsLyricsVisible(true)}
                    className="inline-flex items-center space-x-1 text-xs text-gray-400 hover:text-light-blue-500 dark:hover:text-light-blue-400 transition-colors font-medium"
                    aria-label="Show lyrics"
                >
                    <LyricsIcon className="w-4 h-4" />
                    <span>Show Lyrics</span>
                </button>
                {showSkipIntro && (
                    <button
                        onClick={handleSkipIntro}
                        className="bg-gray-500/80 dark:bg-gray-700/80 text-white text-xs font-bold py-1 px-3 rounded-full hover:bg-gray-600/90 dark:hover:bg-gray-600/90 transition-all duration-200 animate-fade-in"
                        aria-label="Skip Intro"
                    >
                        Skip Intro &raquo;
                    </button>
                )}
            </div>
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
        
        <ProgressBar duration={duration} currentTime={currentTime} onSeek={handleSeek} isFading={isFading} />
        
        <PlayerControls
          isPlaying={isPlaying}
          isLooping={isLooping}
          isShuffled={isShuffled}
          isVisualizerVisible={isVisualizerVisible}
          onPlayPause={handlePlayPause}
          onNext={handleNext}
          onPrev={handlePrev}
          toggleLoop={toggleLoop}
          toggleShuffle={toggleShuffle}
          onEqToggle={() => setIsEqVisible(!isEqVisible)}
          onVisualizerToggle={() => setIsVisualizerVisible(!isVisualizerVisible)}
          volume={volume}
          onVolumeChange={handleVolumeChange}
          isFading={isFading}
        />
        
        <SearchBar value={searchQuery} onChange={handleSearchChange} />

        <div className="flex border-b border-light-blue-100 dark:border-gray-700 mb-2">
            <button
                onClick={() => setIsQueueVisible(false)}
                className={`flex-1 py-2 text-sm font-semibold transition-colors ${
                !isQueueVisible
                    ? 'text-light-blue-600 dark:text-light-blue-400 border-b-2 border-light-blue-500'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
            >
                All Songs
            </button>
            <button
                onClick={() => setIsQueueVisible(true)}
                className={`flex-1 py-2 text-sm font-semibold transition-colors relative ${
                isQueueVisible
                    ? 'text-light-blue-600 dark:text-light-blue-400 border-b-2 border-light-blue-500'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
            >
                Queue
                {playQueue.length > 0 && (
                <span className="absolute top-1 right-2 bg-light-blue-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {playQueue.length}
                </span>
                )}
            </button>
        </div>
        
        {isQueueVisible ? (
            <PlayQueue
                songs={songs}
                playQueue={playQueue}
                currentSongIndex={currentSongIndex}
                onSongSelect={handleSongSelect}
                onReorderQueue={handleReorderQueue}
                onRemoveFromQueue={handleRemoveFromQueue}
            />
        ) : (
            <SongList 
            songs={filteredSongs} 
            currentSongIndex={currentSongIndex} 
            onSongSelect={handleSongSelect} 
            isPlaying={isPlaying}
            playQueue={playQueue}
            onAddToQueue={handleAddToQueue}
            />
        )}
      </div>
    </div>
  );
};

export default App;