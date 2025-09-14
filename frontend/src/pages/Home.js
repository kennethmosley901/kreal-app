import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, TrendingUp, Clock, Zap, Film, Tv, Users, Globe } from 'lucide-react';
import HeroSection from '../components/HeroSection';
import ContentCard from '../components/ContentCard';
import LoadingSpinner from '../components/LoadingSpinner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const fetchTrendingContent = async () => {
  const response = await fetch(`${BACKEND_URL}/api/trending?content_type=all`);
  if (!response.ok) {
    throw new Error('Failed to fetch trending content');
  }
  return response.json();
};

const fetchPlatforms = async () => {
  const response = await fetch(`${BACKEND_URL}/api/platforms`);
  if (!response.ok) {
    throw new Error('Failed to fetch platforms');
  }
  return response.json();
};

const Home = () => {
  const { data: trendingData, isLoading, error } = useQuery({
    queryKey: ['trending'],
    queryFn: fetchTrendingContent,
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });

  const { data: platformsData } = useQuery({
    queryKey: ['platforms'],
    queryFn: fetchPlatforms,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  const features = [
    {
      icon: <Zap className="h-8 w-8 text-yellow-400" />,
      title: "Instant Access",
      description: "Stream movies & TV shows immediately with direct links to free platforms"
    },
    {
      icon: <Clock className="h-8 w-8 text-blue-400" />,
      title: "Updated Hourly",
      description: "Fresh links verified every hour to ensure working streams"
    },
    {
      icon: <Sparkles className="h-8 w-8 text-purple-400" />,
      title: "HD Quality",
      description: "High-definition streaming from premium free platforms"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-green-400" />,
      title: "Trending Content",
      description: "Discover the hottest movies and shows everyone's watching"
    }
  ];

  const platformCount = platformsData?.platforms ? Object.keys(platformsData.platforms).length : 16;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection movies={trendingData?.results?.slice(0, 8) || []} />

      {/* Features Section */}
      <section className="py-16 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Why Choose KingShit.fu?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              The ultimate destination for free movies and TV shows with the best user experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="bg-gray-800/50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-700/50 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content Types Section */}
      <section className="py-16 bg-gradient-to-r from-gray-900 to-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Movies & TV Shows
            </h2>
            <p className="text-gray-400 text-lg">Discover thousands of titles across all genres</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-green-900/20 to-green-800/10 border border-green-500/20 rounded-xl p-8 text-center group hover:border-green-500/40 transition-all">
              <Film className="h-16 w-16 text-green-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-bold text-white mb-3">Movies</h3>
              <p className="text-gray-300 mb-4">
                From blockbusters to indie films, discover thousands of movies across all genres
              </p>
              <div className="flex justify-center space-x-4 text-sm text-gray-400">
                <span>• Action</span>
                <span>• Comedy</span>
                <span>• Drama</span>
                <span>• Horror</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border border-blue-500/20 rounded-xl p-8 text-center group hover:border-blue-500/40 transition-all">
              <Tv className="h-16 w-16 text-blue-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-bold text-white mb-3">TV Shows</h3>
              <p className="text-gray-300 mb-4">
                Binge-watch complete seasons of your favorite series and discover new shows
              </p>
              <div className="flex justify-center space-x-4 text-sm text-gray-400">
                <span>• Series</span>
                <span>• Reality</span>
                <span>• Documentaries</span>
                <span>• Anime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                Trending Now
              </h2>
              <p className="text-gray-400">Most popular movies and TV shows available for free streaming</p>
            </div>
            <div className="flex items-center space-x-2 bg-gradient-to-r from-red-600/20 to-red-700/20 border border-red-500/30 rounded-full px-4 py-2">
              <div className="h-2 w-2 bg-red-400 rounded-full animate-pulse"></div>
              <span className="text-red-400 text-sm font-medium">Live Updates</span>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-8 max-w-md mx-auto">
                <h3 className="text-red-400 font-semibold text-lg mb-2">Unable to Load Content</h3>
                <p className="text-gray-400">Please check your connection and try again</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-6">
              {trendingData?.results?.slice(0, 28).map((content) => (
                <ContentCard 
                  key={`${content.content_type}-${content.id}`} 
                  content={content}
                  className="hover:shadow-red-500/20"
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-gray-900 to-black">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-red-400 mb-2">25,000+</div>
              <div className="text-gray-400 flex items-center justify-center space-x-1">
                <Film className="h-4 w-4" />
                <span>Free Movies</span>
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-red-400 mb-2">15,000+</div>
              <div className="text-gray-400 flex items-center justify-center space-x-1">
                <Tv className="h-4 w-4" />
                <span>TV Episodes</span>
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-red-400 mb-2">{platformCount}+</div>
              <div className="text-gray-400 flex items-center justify-center space-x-1">
                <Globe className="h-4 w-4" />
                <span>Streaming Platforms</span>
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-red-400 mb-2">24/7</div>
              <div className="text-gray-400 flex items-center justify-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>Link Updates</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Highlights */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Trusted Free Platforms
            </h2>
            <p className="text-gray-400 text-lg">All content is legally available on these platforms</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {platformsData?.platforms && Object.entries(platformsData.platforms).slice(0, 8).map(([key, platform]) => (
              <div key={key} className="bg-gray-800/30 border border-gray-700 rounded-lg p-4 text-center hover:border-red-500/50 transition-colors">
                <h4 className="text-white font-medium text-sm mb-1">{platform.name}</h4>
                <div className="flex justify-center space-x-1">
                  {platform.content_types.includes('movie') && (
                    <Film className="h-3 w-3 text-green-400" />
                  )}
                  {platform.content_types.includes('tv') && (
                    <Tv className="h-3 w-3 text-blue-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;