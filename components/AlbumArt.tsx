
import React from 'react';

interface AlbumArtProps {
  cover: string;
}

const AlbumArt: React.FC<AlbumArtProps> = ({ cover }) => {
  return (
    <div className="aspect-square w-full max-w-xs mx-auto">
      <img
        src={cover}
        alt="Album Cover"
        className="w-full h-full object-cover rounded-2xl shadow-lg"
      />
    </div>
  );
};

export default AlbumArt;
