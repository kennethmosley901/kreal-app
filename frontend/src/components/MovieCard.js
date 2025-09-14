import React from 'react';
import { Star, Play, Calendar, Users } from 'lucide-react';
import { toast } from 'sonner';

const MovieCard = ({ movie, className = '' }) => {
  const handlePlatformClick = (platform) => {
    toast.success(`Opening ${movie.title} on ${platform.name}`);
    window.open(platform.url, '_blank');
  };

  const formatRating = (rating) => {
    return (rating / 2).toFixed(1); // Convert 10-scale to 5-scale
  };

  const formatYear = (date) => {
    return date ? new Date(date).getFullYear() : 'N/A';
  };

  const formatVoteCount = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <div className={`group bg-gray-900/50 rounded-xl overflow-hidden border border-gray-800 hover:border-red-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-red-500/10 ${className}`}>
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={movie.poster_path || '/placeholder-movie.jpg'}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            e.target.src = '/placeholder-movie.jpg';
          }}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-4 left-4 right-4">
            <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors">
              <Play className="h-4 w-4" />
              <span>Watch Now</span>
            </button>
          </div>
        </div>

        {/* Rating Badge */}
        <div className="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 rounded-lg flex items-center space-x-1">
          <Star className="h-3 w-3 text-yellow-400 fill-current" />
          <span className="text-sm font-semibold">{formatRating(movie.vote_average)}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2 group-hover:text-red-400 transition-colors">
          {movie.title}
        </h3>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>{formatYear(movie.release_date)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="h-3 w-3" />
            <span>{formatVoteCount(movie.vote_count)}</span>
          </div>
        </div>

        {/* Genres */}
        <div className="flex flex-wrap gap-1 mb-3">
          {movie.genre_names?.slice(0, 3).map((genre, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-full"
            >
              {genre}
            </span>
          ))}
        </div>

        {/* Platforms */}
        <div className="space-y-2">
          <p className="text-xs text-gray-400 font-medium">Watch Free On:</p>
          <div className="flex flex-wrap gap-2">
            {movie.platforms?.slice(0, 3).map((platform, index) => (
              <button
                key={index}
                onClick={() => handlePlatformClick(platform)}
                className="px-3 py-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-xs rounded-full font-medium transition-all hover:scale-105"
              >
                {platform.name}
              </button>
            ))}
            {movie.platforms && movie.platforms.length > 3 && (
              <span className="px-3 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
                +{movie.platforms.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;