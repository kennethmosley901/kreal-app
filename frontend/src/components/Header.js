import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Film, Sparkles, Tv, Filter } from 'lucide-react';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [contentType, setContentType] = useState('multi');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const params = new URLSearchParams({
        q: searchQuery.trim(),
        content_type: contentType
      });
      navigate(`/search?${params.toString()}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-md border-b border-red-900/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <Film className="h-8 w-8 text-red-500 group-hover:text-red-400 transition-colors" />
              <Sparkles className="h-4 w-4 text-yellow-400 absolute -top-1 -right-1" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white group-hover:text-red-400 transition-colors">
                KingShit.fu
              </span>
              <span className="text-xs text-gray-400 -mt-1">Free Movies & TV Shows</span>
            </div>
          </Link>

          {/* Enhanced Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-8">
            <div className="flex items-center space-x-2">
              {/* Content Type Selector */}
              <div className="flex bg-gray-800/50 border border-gray-700 rounded-full p-1">
                <button
                  type="button"
                  onClick={() => setContentType('multi')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    contentType === 'multi'
                      ? 'bg-red-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setContentType('movie')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center space-x-1 ${
                    contentType === 'movie'
                      ? 'bg-red-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Film className="h-3 w-3" />
                  <span>Movies</span>
                </button>
                <button
                  type="button"
                  onClick={() => setContentType('tv')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center space-x-1 ${
                    contentType === 'tv'
                      ? 'bg-red-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Tv className="h-3 w-3" />
                  <span>TV Shows</span>
                </button>
              </div>

              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for movies, TV shows..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </form>

          {/* Status Indicator */}
          <div className="flex items-center space-x-4">
            <Link 
              to="/platforms" 
              className="flex items-center space-x-1 text-gray-400 hover:text-red-400 transition-colors"
            >
              <Filter className="h-4 w-4" />
              <span className="text-sm hidden md:inline">Platforms</span>
            </Link>
            <div className="flex items-center space-x-1">
              <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-400">Live</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;