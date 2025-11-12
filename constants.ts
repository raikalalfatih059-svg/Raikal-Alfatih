import { Song } from './types';

// Using public domain / royalty-free music for demonstration
export const SONGS: Song[] = [
  {
    title: 'Ambient Classical',
    artist: 'Podington Bear',
    url: 'https://cdn.pixabay.com/download/audio/2023/11/17/audio_c35f631238.mp3',
    cover: 'https://picsum.photos/seed/music1/500/500',
    duration: '02:14'
  },
  {
    title: 'Moment',
    artist: 'Serge Quadrado',
    url: 'https://cdn.pixabay.com/download/audio/2024/01/09/audio_27b875151b.mp3',
    cover: 'https://picsum.photos/seed/music2/500/500',
    duration: '02:08'
  },
  {
    title: 'Just Relax',
    artist: 'Lesfm',
    url: 'https://cdn.pixabay.com/download/audio/2022/08/16/audio_472b4353d2.mp3',
    cover: 'https://picsum.photos/seed/music3/500/500',
    duration: '02:10'
  },
  {
    title: 'The Beat of Nature',
    artist: 'Olexy',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/23/audio_adf438a2e5.mp3',
    cover: 'https://picsum.photos/seed/music4/500/500',
    duration: '02:13'
  },
  {
    title: 'Uplifting',
    artist: 'Corporate',
    url: 'https://cdn.pixabay.com/download/audio/2023/04/18/audio_82c615a153.mp3',
    cover: 'https://picsum.photos/seed/music5/500/500',
    duration: '02:18'
  }
];

export const EQ_BANDS: { frequency: number; type: BiquadFilterType, label: string }[] = [
  { frequency: 60, type: 'lowshelf', label: '60' },
  { frequency: 250, type: 'peaking', label: '250' },
  { frequency: 1000, type: 'peaking', label: '1k' },
  { frequency: 4000, type: 'peaking', label: '4k' },
  { frequency: 16000, type: 'highshelf', label: '16k' }
];

export const EQ_PRESETS: Record<string, number[]> = {
    'Flat': [0, 0, 0, 0, 0],
    'Pop': [2, 1, 0, 1, 3],
    'Rock': [4, 2, -2, 2, 4],
    'Jazz': [3, 1, 2, -1, 1],
    'Classical': [2, 1, 0, 1, 2],
    'Bass Boost': [6, 4, 0, 0, 0],
};
