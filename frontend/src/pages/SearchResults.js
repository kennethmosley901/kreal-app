import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, SortAsc, ChevronDown, Film, Tv, Globe } from 'lucide-react';
import ContentCard from '../components/ContentCard';
import LoadingSpinner from '../components/LoadingSpinner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const fetchSearchResults = async (query, page = 1, contentType = 'multi', platform = null) => {
  const params = new URLSearchParams({
    q: query,
    page: page.toString(),
    content_type: contentType
  });
  
  if (platform) {
    params.append('platform', platform);
  }
  
  const response = await fetch(`${BACKEND_URL}/api/search?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to search content');
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

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);
  
  const query = searchParams.get('q') || '';
  const contentType = searchParams.get('content_type') || 'multi';
  const platformFilter = searchParams.get('platform') || null;
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['search', query, currentPage, contentType, platformFilter],
    queryFn: () => fetchSearchResults(query, currentPage, contentType, platformFilter),
    enabled: !!query,
    keepPreviousData: true,
  });

  const { data: platformsData } = useQuery({
    queryKey: ['platforms'],
    queryFn: fetchPlatforms,
    staleTime: 30 * 60 * 1000,
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [query, contentType, platformFilter]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContentTypeChange = (newContentType) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('content_type', newContentType);
    setSearchParams(newParams);
  };

  const handlePlatformChange = (newPlatform) => {
    const newParams = new URLSearchParams(searchParams);
    if (newPlatform && newPlatform !== 'all') {
      newParams.set('platform', newPlatform);
    } else {
      newParams.delete('platform');
    }
    setSearchParams(newParams);
  };

  const sortedResults = React.useMemo(() => {
    if (!data?.results) return [];
    
    const results = [...data.results];
    
    switch (sortBy) {
      case 'rating':
        return results.sort((a, b) => b.vote_average - a.vote_average);
      case 'year':
        return results.sort((a, b) => {
          const dateA = new Date(a.release_date || a.first_air_date || '1900-01-01');
          const dateB = new Date(b.release_date || b.first_air_date || '1900-01-01');
          return dateB - dateA;
        });
      case 'popularity':
        return results.sort((a, b) => b.vote_count - a.vote_count);
      default:
        return results;
    }
  }, [data?.results, sortBy]);

  const getContentTypeLabel = () => {
    switch (contentType) {
      case 'movie': return 'Movies';
      case 'tv': return 'TV Shows';
      default: return 'Movies & TV Shows';
    }
  };

  const getPlatformName = () => {
    if (!platformFilter || !platformsData?.platforms) return null;
    return platformsData.platforms[platformFilter]?.name;
  };

  if (!query) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <Search className="h-24 w-24 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Search for Movies & TV Shows</h2>
          <p className="text-gray-400">Use the search bar above to find your favorite content</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Search Results for "{query}"
        </h1>
        <div className="flex items-center space-x-4 text-gray-400">
          {data && (
            <span>{data.total_results} {getContentTypeLabel().toLowerCase()} found</span>
          )}
          {getPlatformName() && (
            <span className="flex items-center space-x-1">
              <Globe className="h-4 w-4" />
              <span>on {getPlatformName()}</span>
            </span>
          )}
        </div>
      </div>

      {/* Content Type Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => handleContentTypeChange('multi')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            contentType === 'multi'
              ? 'bg-red-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          All Content
        </button>
        <button
          onClick={() => handleContentTypeChange('movie')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center space-x-1 ${
            contentType === 'movie'
              ? 'bg-red-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          <Film className="h-3 w-3" />
          <span>Movies</span>
        </button>
        <button
          onClick={() => handleContentTypeChange('tv')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center space-x-1 ${
            contentType === 'tv'
              ? 'bg-red-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          <Tv className="h-3 w-3" />
          <span>TV Shows</span>
        </button>
      </div>

      {/* Filters and Sorting */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        <div className="flex items-center space-x-2">
          <SortAsc className="h-4 w-4 text-gray-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-red-500"
          >
            <option value="relevance">Most Relevant</option>
            <option value="rating">Highest Rated</option>
            <option value="year">Newest First</option>
            <option value="popularity">Most Popular</option>
          </select>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-gray-800/50 rounded-lg p-6 mb-8 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-white font-medium mb-2">Platform</label>
              <select 
                value={platformFilter || 'all'}
                onChange={(e) => handlePlatformChange(e.target.value)}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:outline-none focus:border-red-500"
              >
                <option value="all">All Platforms</option>
                {platformsData?.platforms && Object.entries(platformsData.platforms).map(([key, platform]) => (
                  <option key={key} value={key}>{platform.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-white font-medium mb-2">Year Range</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="From"
                  className="flex-1 bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:outline-none focus:border-red-500"
                />
                <input
                  type="number"
                  placeholder="To"
                  className="flex-1 bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Minimum Rating</label>
              <select className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:outline-none focus:border-red-500">
                <option value="">Any Rating</option>
                <option value="7">7.0+</option>
                <option value="8">8.0+</option>
                <option value="9">9.0+</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-8 max-w-md mx-auto">
            <h3 className="text-red-400 font-semibold text-lg mb-2">Search Failed</h3>
            <p className="text-gray-400">Unable to search content. Please try again.</p>
          </div>
        </div>
      ) : !sortedResults?.length ? (
        <div className="text-center py-16">
          <Search className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-white font-semibold text-lg mb-2">No Results Found</h3>
          <p className="text-gray-400">Try different keywords or check your spelling</p>
        </div>
      ) : (
        <>
          {/* Content Grid - 28 items per page */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-6 mb-8">
            {sortedResults.map((content) => (
              <ContentCard 
                key={`${content.content_type}-${content.id}`} 
                content={content} 
              />
            ))}
          </div>

          {/* Pagination */}
          {data && data.total_pages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
              >
                Previous
              </button>
              
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, data.total_pages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        page === currentPage
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === data.total_pages}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchResults;