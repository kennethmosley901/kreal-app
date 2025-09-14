import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink, Film, Tv, Users, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const fetchPlatforms = async () => {
  const response = await fetch(`${BACKEND_URL}/api/platforms`);
  if (!response.ok) {
    throw new Error('Failed to fetch platforms');
  }
  return response.json();
};

const PlatformGrid = () => {
  const navigate = useNavigate();
  const [selectedContentType, setSelectedContentType] = useState('multi');

  const { data: platformsData, isLoading, error } = useQuery({
    queryKey: ['platforms'],
    queryFn: fetchPlatforms,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  const handlePlatformClick = (platformKey) => {
    const params = new URLSearchParams({
      q: 'popular',
      platform: platformKey,
      content_type: selectedContentType
    });
    navigate(`/search?${params.toString()}`);
  };

  const getPlatformIcon = (contentTypes) => {
    if (contentTypes.includes('movie') && contentTypes.includes('tv')) {
      return <div className="flex space-x-1"><Film className="h-4 w-4" /><Tv className="h-4 w-4" /></div>;
    } else if (contentTypes.includes('tv')) {
      return <Tv className="h-4 w-4 text-blue-400" />;
    } else {
      return <Film className="h-4 w-4 text-green-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-8 max-w-md mx-auto">
          <h3 className="text-red-400 font-semibold text-lg mb-2">Unable to Load Platforms</h3>
          <p className="text-gray-400">Please check your connection and try again</p>
        </div>
      </div>
    );
  }

  const platforms = platformsData?.platforms || {};

  return (
    <div className="space-y-8">
      {/* Content Type Filter */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Browse by Platform</h2>
        <p className="text-gray-400 mb-6">Click on any platform to explore their free content</p>
        
        <div className="flex justify-center">
          <div className="flex bg-gray-800/50 border border-gray-700 rounded-full p-1">
            <button
              onClick={() => setSelectedContentType('multi')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedContentType === 'multi'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              All Content
            </button>
            <button
              onClick={() => setSelectedContentType('movie')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center space-x-1 ${
                selectedContentType === 'movie'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Film className="h-3 w-3" />
              <span>Movies Only</span>
            </button>
            <button
              onClick={() => setSelectedContentType('tv')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center space-x-1 ${
                selectedContentType === 'tv'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Tv className="h-3 w-3" />
              <span>TV Shows Only</span>
            </button>
          </div>
        </div>
      </div>

      {/* Platform Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Object.entries(platforms).map(([key, platform]) => (
          <div
            key={key}
            onClick={() => handlePlatformClick(key)}
            className="group bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-red-500/50 transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:shadow-lg hover:shadow-red-500/10"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg group-hover:text-red-400 transition-colors">
                  {platform.name}
                </h3>
                <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                  {platform.description}
                </p>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                {getPlatformIcon(platform.content_types)}
                <ExternalLink className="h-4 w-4 text-gray-500 group-hover:text-red-400 transition-colors" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>Free</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3" />
                  <span>Legal</span>
                </div>
              </div>
              
              <div className="flex space-x-1">
                {platform.content_types.includes('movie') && (
                  <span className="bg-green-900/30 text-green-400 px-2 py-1 rounded text-xs">
                    Movies
                  </span>
                )}
                {platform.content_types.includes('tv') && (
                  <span className="bg-blue-900/30 text-blue-400 px-2 py-1 rounded text-xs">
                    TV
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-800">
              <button className="w-full bg-gradient-to-r from-red-600/20 to-red-700/20 hover:from-red-600 hover:to-red-700 text-red-400 hover:text-white py-2 px-4 rounded-lg font-medium transition-all text-sm">
                Browse {platform.name} →
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center text-gray-400 text-sm">
        <p>All platforms listed offer free, legal streaming content.</p>
        <p>Some may include ads to support free access.</p>
      </div>
    </div>
  );
};

export default PlatformGrid;