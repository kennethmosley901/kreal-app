import React, { useState, useEffect } from 'react';
import { Play, Star, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const HeroSection = ({ movies = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-slide functionality
  useEffect(() => {
    if (!isAutoPlaying || movies.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, movies.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % movies.length);
    setIsAutoPlaying(false);
  };

  const handleWatchNow = (movie) => {
    if (movie.platforms && movie.platforms.length > 0) {
      const platform = movie.platforms[0];
      toast.success(`Opening ${movie.title} on ${platform.name}`);
      window.open(platform.url, '_blank');
    } else {
      toast.info('Searching for streaming options...');
    }
  };

  if (!movies || movies.length === 0) {
    return (
      <div className="relative h-[600px] bg-gradient-to-r from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-16 w-16 text-red-500 mx-auto mb-4 animate-pulse" />
          <h2 className="text-3xl font-bold text-white mb-2">Loading Trending Movies...</h2>
          <p className="text-gray-400">Discovering the hottest movies for you</p>
        </div>
      </div>
    );
  }

  const currentMovie = movies[currentIndex];

  return (
    <div className="relative h-[600px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={currentMovie.backdrop_path || currentMovie.poster_path || '/placeholder-backdrop.jpg'}
          alt={currentMovie.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = '/placeholder-backdrop.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all z-10"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all z-10"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl">
          {/* Featured Badge */}
          <div className="inline-flex items-center space-x-2 bg-red-600/90 text-white px-4 py-2 rounded-full mb-4">
            <Sparkles className="h-4 w-4" />
            <span className="font-semibold">Trending Now</span>
          </div>

          {/* Title */}
          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
            {currentMovie.title}
          </h1>

          {/* Meta Info */}
          <div className="flex items-center space-x-6 mb-6">
            <div className="flex items-center space-x-1">
              <Star className="h-5 w-5 text-yellow-400 fill-current" />
              <span className="text-white font-semibold">
                {(currentMovie.vote_average / 2).toFixed(1)}/5
              </span>
            </div>
            <span className="text-gray-300">
              {currentMovie.release_date ? new Date(currentMovie.release_date).getFullYear() : 'N/A'}
            </span>
            <div className="flex space-x-2">
              {currentMovie.genre_names?.slice(0, 2).map((genre, index) => (
                <span key={index} className="bg-gray-800/80 text-gray-300 px-3 py-1 rounded-full text-sm">
                  {genre}
                </span>
              ))}
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-200 text-lg mb-8 leading-relaxed max-w-xl">
            {currentMovie.overview}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleWatchNow(currentMovie)}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold text-lg flex items-center space-x-2 transition-all hover:scale-105 shadow-lg"
            >
              <Play className="h-5 w-5" />
              <span>Watch Free Now</span>
            </button>
            
            {currentMovie.platforms && currentMovie.platforms.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-gray-300 text-sm">Available on:</span>
                {currentMovie.platforms.slice(0, 3).map((platform, index) => (
                  <span key={index} className="bg-white/10 text-white px-3 py-2 rounded-lg text-sm backdrop-blur-sm">
                    {platform.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {movies.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentIndex
                ? 'bg-white scale-125'
                : 'bg-white/50 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSection;