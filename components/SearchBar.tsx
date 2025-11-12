import React from 'react';
import { SearchIcon } from './icons';

interface SearchBarProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  return (
    <div className="relative">
      <span className="absolute inset-y-0 left-0 flex items-center pl-3">
        <SearchIcon className="w-5 h-5 text-gray-400" />
      </span>
      <input
        type="text"
        placeholder="Filter by title or artist..."
        value={value}
        onChange={onChange}
        className="w-full pl-10 pr-4 py-2 border border-light-blue-100 dark:border-gray-700 bg-light-blue-50 dark:bg-gray-700/50 rounded-lg text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-light-blue-500 transition-colors"
        aria-label="Filter songs"
      />
    </div>
  );
};

export default SearchBar;