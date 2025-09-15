from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import requests
import asyncio
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any, Literal
import logging
from pydantic import BaseModel
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client.get_database('kingshit_fu')

app = FastAPI(title="KingShit.fu API", description="Movie & TV Show Streaming Aggregator API with Casting Support")

# CORS middleware
from fastapi.middleware.cors import CORSMiddleware
import os

# ... your FastAPI app setup above ...

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.environ.get("FRONTEND_ORIGIN", "*")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# Pydantic models
class ContentResult(BaseModel):
    id: int
    title: str
    overview: str
    poster_path: Optional[str]
    backdrop_path: Optional[str]
    release_date: Optional[str]
    first_air_date: Optional[str]  # For TV shows
    vote_average: float
    vote_count: int
    genre_names: List[str]
    platforms: List[Dict[str, Any]]
    content_type: Literal['movie', 'tv']  # New field to distinguish movies vs TV shows
    seasons: Optional[int] = None  # For TV shows
    episodes: Optional[int] = None  # For TV shows
    cast_support: Dict[str, bool] = {}  # Casting support info

class SearchResponse(BaseModel):
    results: List[ContentResult]
    total_results: int
    page: int
    total_pages: int
    content_type: Optional[str] = None
    platform_filter: Optional[str] = None

class TrendingResponse(BaseModel):
    results: List[ContentResult]

# MASSIVELY EXPANDED free streaming platforms (35+ platforms!)
SUPPORTED_PLATFORMS = {
    # Original Major Platforms
    'tubi': {
        'name': 'Tubi', 
        'base_url': 'https://tubitv.com',
        'description': 'Free movies and TV shows with ads',
        'content_types': ['movie', 'tv'],
        'cast_support': {'chromecast': True, 'airplay': True, 'dlna': True}
    },
    'pluto': {
        'name': 'Pluto TV', 
        'base_url': 'https://pluto.tv',
        'description': 'Free streaming TV and movies',
        'content_types': ['movie', 'tv'],
        'cast_support': {'chromecast': True, 'airplay': True, 'dlna': False}
    },
    'crackle': {
        'name': 'Crackle', 
        'base_url': 'https://crackle.com',
        'description': 'Sony Pictures free streaming',
        'content_types': ['movie', 'tv'],
        'cast_support': {'chromecast': True, 'airplay': True, 'dlna': True}
    },
    'imdb': {
        'name': 'IMDb TV', 
        'base_url': 'https://imdb.com/tv',
        'description': 'Amazon\'s free streaming service',
        'content_types': ['movie', 'tv'],
        'cast_support': {'chromecast': True, 'airplay': True, 'dlna': False}
    },
    'youtube': {
        'name': 'YouTube Movies', 
        'base_url': 'https://youtube.com/movies',
        'description': 'Free movies on YouTube',
        'content_types': ['movie'],
        'cast_support': {'chromecast': True, 'airplay': True, 'dlna': True}
    },
    'roku': {
        'name': 'Roku Channel', 
        'base_url': 'https://therokuchannel.roku.com',
        'description': 'Roku\'s free streaming platform',
        'content_types': ['movie', 'tv'],
        'cast_support': {'chromecast': False, 'airplay': True, 'dlna': True}
    },
    'vudu': {
        'name': 'Vudu Free', 
        'base_url': 'https://vudu.com/content/movies/free',
        'description': 'Walmart\'s free movie section',
        'content_types': ['movie', 'tv'],
        'cast_support': {'chromecast': True, 'airplay': True, 'dlna': False}
    },
    'peacock': {
        'name': 'Peacock Free', 
        'base_url': 'https://peacocktv.com/free',
        'description': 'NBCUniversal\'s free tier',
        'content_types': ['movie', 'tv'],
        'cast_support': {'chromecast': True, 'airplay': True, 'dlna': False}
    },
    'plex': {
        'name': 'Plex TV', 
        'base_url': 'https://plex.tv/en-us/tv',
        'description': 'Free movies and TV shows on Plex',
        'content_types': ['movie', 'tv'],
        'cast_support': {'chromecast': True, 'airplay': True, 'dlna': True}
    },
    'xumo': {
        'name': 'Xumo Play', 
        'base_url': 'https://xumo.com',
        'description': 'Comcast\'s free streaming service',
        'content_types': ['movie', 'tv'],
        'cast_support': {'chromecast': True, 'airplay': False, 'dlna': True}
    },
    'philo': {
        'name': 'Philo Free', 
        'base_url': 'https://philo.com/free',
        'description': 'Free content from Philo',
        'content_types': ['tv'],
        'cast_support': {'chromecast': True, 'airplay': True, 'dlna': False}
    },
    'freevee': {
        'name': 'Amazon Freevee', 
        'base_url': 'https://freevee.com',
        'description': 'Amazon\'s ad-supported free service',
        'content_types': ['movie', 'tv'],
        'cast_support': {'chromecast': True, 'airplay': True, 'dlna': False}
    },
    
    # NEW PLATFORMS - Educational & Library
    'kanopy': {
        'name': 'Kanopy', 
        'base_url': 'https://kanopy.com',
        'description': 'Free movies with library card',
        'content_types': ['movie', 'tv'],
        'cast_support': {'chromecast': True, 'airplay': True, 'dlna': False}
    },
    'hoopla': {
        'name': 'Hoopla Digital', 
        'base_url': 'https://hoopladigital.com',
        'description': 'Library-based free streaming',
        'content_types': ['movie', 'tv'],
        'cast_support': {'chromecast': True, 'airplay': True, 'dlna': False}
    },
    
    # NEW PLATFORMS - Network/Studio Based
    'cw': {
        'name': 'The CW', 
        'base_url': 'https://cwtv.com',
        'description': 'Free CW shows and episodes',
        'content_types': ['tv'],
        'cast_support': {'chromecast': True, 'airplay': True, 'dlna': False}
    },
    'cbssports': {
        'name': 'CBS Sports HQ', 
        'base_url': 'https://cbssports.com/live',
        'description': 'Free sports content',
        'content_types': ['tv'],
        'cast_support': {'chromecast': True, 'airplay': False, 'dlna': False}
    },
    
    # NEW PLATFORMS - Independent & Niche
    'filmrise': {
        'name': 'FilmRise', 
        'base_url': 'https://filmrise.com',
        'description': 'Free classic and indie content',
        'content_types': ['movie', 'tv'],
        'cast_support': {'chromecast': True, 'airplay': True, 'dlna': True}
    },
    'redbox': {
        'name': 'Redbox Free', 
        'base_url': 'https://redbox.com/free-live-tv-movies',
        'description': 'Redbox free streaming',
        'content_types': ['movie', 'tv'],
        'cast_support': {'chromecast': True, 'airplay': False, 'dlna': True}
    },
    'stirr': {
        'name': 'Stirr', 
        'base_url': 'https://stirr.com',
        'description': 'Sinclair\'s free streaming platform',
        'content_types': ['movie', 'tv'],
        'cast_support': {'chromecast': False, 'airplay': False, 'dlna': True}
    },
    'popcornflix': {
        'name': 'Popcornflix', 
        'base_url': 'https://popcornflix.com',
        'description': 'Free movies and web series',
        'content_types': ['movie', 'tv'],
        'cast_support': {'chromecast': True, 'airplay': True, 'dlna': False}
    },
    
    # NEW PLATFORMS - International & Specialty
    'revtv': {
        'name': 'Rev TV', 
        'base_url': 'https://rev.tv',
        'description': 'Free streaming with ads',
        'content_types': ['movie', 'tv'],
        'cast_support': {'chromecast': False, 'airplay': False, 'dlna': True}
    },
    'theitembiz': {
        'name': 'The IT Crowd', 
        'base_url': 'https://theitcrowd.com',
        'description': 'Tech and comedy content',
        'content_types': ['tv'],
        'cast_support': {'chromecast': False, 'airplay': False, 'dlna': False}
    },
    
    # NEW PLATFORMS - News & Documentary
    'newsy': {
        'name': 'Newsy', 
        'base_url': 'https://newsy.com',
        'description': 'Free news and documentaries',
        'content_types': ['tv'],
        'cast_support': {'chromecast': True, 'airplay': False, 'dlna': False}
    },
    'haystack': {
        'name': 'Haystack News', 
        'base_url': 'https://haystack.tv',
        'description': 'Local news and content',
        'content_types': ['tv'],
        'cast_support': {'chromecast': True, 'airplay': True, 'dlna': False}
    },
    'localish': {
        'name': 'Localish', 
        'base_url': 'https://localish.com',
        'description': 'ABC\'s local lifestyle content',
        'content_types': ['tv'],
        'cast_support': {'chromecast': True, 'airplay': True, 'dlna': False}
    },
    
    # NEW PLATFORMS - Weather & Lifestyle
    'accuweather': {
        'name': 'AccuWeather', 
        'base_url': 'https://accuweather.com/tv',
        'description': 'Weather and lifestyle content',
        'content_types': ['tv'],
        'cast_support': {'chromecast': True, 'airplay': False, 'dlna': False}
    },
    
    # NEW PLATFORMS - Gaming & Tech
    'gametv': {
        'name': 'Game TV', 
        'base_url': 'https://gametv.com',
        'description': 'Gaming and esports content',
        'content_types': ['tv'],
        'cast_support': {'chromecast': False, 'airplay': False, 'dlna': True}
    },
    
    # NEW PLATFORMS - Kids & Family
    'kidoodle': {
        'name': 'Kidoodle TV', 
        'base_url': 'https://kidoodle.tv',
        'description': 'Safe kids content',
        'content_types': ['tv'],
        'cast_support': {'chromecast': True, 'airplay': True, 'dlna': False}
    },
    
    # NEW PLATFORMS - Music & Entertainment
    'vevo': {
        'name': 'Vevo', 
        'base_url': 'https://vevo.com',
        'description': 'Music videos and concerts',
        'content_types': ['tv'],
        'cast_support': {'chromecast': True, 'airplay': True, 'dlna': True}
    },
    
    # NEW PLATFORMS - Classic & Retro
    'retrocrush': {
        'name': 'RetroCrush', 
        'base_url': 'https://retrocrush.tv',
        'description': 'Classic anime and cartoons',
        'content_types': ['tv'],
        'cast_support': {'chromecast': True, 'airplay': False, 'dlna': False}
    },
    'dovechannel': {
        'name': 'Dove Channel', 
        'base_url': 'https://dovechannel.com/free',
        'description': 'Family-friendly movies',
        'content_types': ['movie'],
        'cast_support': {'chromecast': True, 'airplay': True, 'dlna': False}
    },
    
    # NEW PLATFORMS - International
    'kocowa': {
        'name': 'Kocowa TV', 
        'base_url': 'https://kocowa.com/free',
        'description': 'Korean content with ads',
        'content_types': ['tv'],
        'cast_support': {'chromecast': True, 'airplay': False, 'dlna': False}
    },
    'asiantv': {
        'name': 'Asian Crush', 
        'base_url': 'https://asiancrush.com',
        'description': 'Asian movies and shows',
        'content_types': ['movie', 'tv'],
        'cast_support': {'chromecast': True, 'airplay': True, 'dlna': False}
    },
    
    # NEW PLATFORMS - Horror & Thriller
    'screambox': {
        'name': 'Screambox', 
        'base_url': 'https://screambox.com/free',
        'description': 'Free horror content',
        'content_types': ['movie'],
        'cast_support': {'chromecast': False, 'airplay': False, 'dlna': True}
    },
    
    # NEW PLATFORMS - Documentary & Educational
    'docurama': {
        'name': 'Docurama', 
        'base_url': 'https://docurama.com/free',
        'description': 'Documentary films',
        'content_types': ['movie'],
        'cast_support': {'chromecast': True, 'airplay': True, 'dlna': False}
    },
    
    # NEW PLATFORMS - Sports
    'stadium': {
        'name': 'Stadium', 
        'base_url': 'https://watchstadium.com',
        'description': 'Free sports programming',
        'content_types': ['tv'],
        'cast_support': {'chromecast': True, 'airplay': False, 'dlna': True}
    },
    
    # NEW PLATFORMS - Comedy
    'comedydynamics': {
        'name': 'Comedy Dynamics', 
        'base_url': 'https://comedydynamics.com/free',
        'description': 'Stand-up and comedy specials',
        'content_types': ['movie', 'tv'],
        'cast_support': {'chromecast': False, 'airplay': True, 'dlna': False}
    }
}

class TMDBClient:
    def __init__(self):
        self.api_key = os.environ.get('TMDB_API_KEY', '')
        self.base_url = 'https://api.themoviedb.org/3'
        self.headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }
        
    async def search_content(self, query: str, page: int = 1, content_type: str = 'multi', platform_filter: str = None) -> Dict[str, Any]:
        """Search for movies and TV shows using TMDB API"""
        if not self.api_key:
            return self._mock_search_response(query, page, content_type, platform_filter)
            
        try:
            if content_type == 'multi':
                url = f"{self.base_url}/search/multi"
            elif content_type == 'movie':
                url = f"{self.base_url}/search/movie"
            elif content_type == 'tv':
                url = f"{self.base_url}/search/tv"
            else:
                url = f"{self.base_url}/search/multi"
            
            params = {
                'api_key': self.api_key,
                'query': query,
                'page': page,
                'include_adult': False
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            # Enhance results with platform availability
            enhanced_results = []
            for item in data.get('results', []):
                # Skip person results from multi search
                if item.get('media_type') == 'person':
                    continue
                    
                enhanced_item = await self._enhance_content_data(item, platform_filter)
                if enhanced_item:  # Only add if platform filter matches
                    enhanced_results.append(enhanced_item)
            
            data['results'] = enhanced_results[:28]  # Limit to 28 results per page
            data['content_type'] = content_type
            data['platform_filter'] = platform_filter
            return data
            
        except Exception as e:
            logger.error(f"TMDB search error: {e}")
            return self._mock_search_response(query, page, content_type, platform_filter)
    
    async def get_trending_content(self, content_type: str = 'all') -> Dict[str, Any]:
        """Get trending movies and TV shows from TMDB"""
        if not self.api_key:
            return self._mock_trending_response(content_type)
            
        try:
            if content_type == 'all':
                url = f"{self.base_url}/trending/all/week"
            elif content_type == 'movie':
                url = f"{self.base_url}/trending/movie/week"
            elif content_type == 'tv':
                url = f"{self.base_url}/trending/tv/week"
            else:
                url = f"{self.base_url}/trending/all/week"
                
            params = {'api_key': self.api_key}
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            # Enhance results with platform availability
            enhanced_results = []
            for item in data.get('results', [])[:28]:  # Limit to 28 trending items
                if item.get('media_type') == 'person':  # Skip person results
                    continue
                enhanced_item = await self._enhance_content_data(item)
                if enhanced_item:
                    enhanced_results.append(enhanced_item)
            
            return {'results': enhanced_results}
            
        except Exception as e:
            logger.error(f"TMDB trending error: {e}")
            return self._mock_trending_response(content_type)
    
    async def _enhance_content_data(self, item: Dict[str, Any], platform_filter: str = None) -> Optional[Dict[str, Any]]:
        """Enhance content data with genre names and platform availability"""
        # Determine content type
        content_type = item.get('media_type', 'movie')
        if 'first_air_date' in item and item.get('first_air_date'):
            content_type = 'tv'
        elif 'release_date' in item and item.get('release_date'):
            content_type = 'movie'
        
        # Get genre names (simplified - in production you'd cache this)
        genre_map = {
            28: "Action", 35: "Comedy", 18: "Drama", 27: "Horror",
            878: "Sci-Fi", 53: "Thriller", 10749: "Romance", 16: "Animation",
            80: "Crime", 99: "Documentary", 10751: "Family", 14: "Fantasy",
            36: "History", 10402: "Music", 9648: "Mystery", 10770: "TV Movie",
            37: "Western", 10752: "War", 10759: "Action & Adventure",
            10762: "Kids", 10763: "News", 10764: "Reality", 10765: "Sci-Fi & Fantasy",
            10766: "Soap", 10767: "Talk", 10768: "War & Politics"
        }
        
        genre_names = [genre_map.get(genre_id, "Unknown") for genre_id in item.get('genre_ids', [])]
        
        # Get platform availability
        platforms = await self._get_platform_availability(item.get('id'), content_type, platform_filter)
        
        # If platform filter is specified and no platforms match, skip this item
        if platform_filter and not platforms:
            return None
        
        # Get title based on content type
        title = item.get('title') if content_type == 'movie' else item.get('name', '')
        
        # Get casting support info
        cast_support = self._get_cast_support(platforms)
        
        return {
            'id': item.get('id'),
            'title': title,
            'overview': item.get('overview', ''),
            'poster_path': f"https://image.tmdb.org/t/p/w500{item.get('poster_path')}" if item.get('poster_path') else None,
            'backdrop_path': f"https://image.tmdb.org/t/p/w1280{item.get('backdrop_path')}" if item.get('backdrop_path') else None,
            'release_date': item.get('release_date', ''),
            'first_air_date': item.get('first_air_date', ''),
            'vote_average': item.get('vote_average', 0),
            'vote_count': item.get('vote_count', 0),
            'genre_names': genre_names,
            'platforms': platforms,
            'content_type': content_type,
            'seasons': item.get('number_of_seasons') if content_type == 'tv' else None,
            'episodes': item.get('number_of_episodes') if content_type == 'tv' else None,
            'cast_support': cast_support
        }
    
    def _get_cast_support(self, platforms: List[Dict[str, Any]]) -> Dict[str, bool]:
        """Aggregate casting support from all available platforms"""
        cast_support = {
            'chromecast': False,
            'airplay': False,
            'dlna': False
        }
        
        for platform in platforms:
            platform_key = platform.get('platform')
            if platform_key in SUPPORTED_PLATFORMS:
                platform_cast = SUPPORTED_PLATFORMS[platform_key].get('cast_support', {})
                for cast_type, supported in platform_cast.items():
                    if supported:
                        cast_support[cast_type] = True
        
        return cast_support
    
    async def _get_platform_availability(self, content_id: int, content_type: str, platform_filter: str = None) -> List[Dict[str, Any]]:
        """Get platform availability for content (enhanced mock implementation)"""
        import random
        
        available_platforms = []
        
        # Get platforms that support this content type
        eligible_platforms = {}
        for platform_key, platform_info in SUPPORTED_PLATFORMS.items():
            if content_type in platform_info['content_types']:
                eligible_platforms[platform_key] = platform_info
        
        # If platform filter is specified, only use that platform
        if platform_filter and platform_filter in eligible_platforms:
            platform_info = eligible_platforms[platform_filter]
            available_platforms.append({
                'platform': platform_filter,
                'name': platform_info['name'],
                'url': f"{platform_info['base_url']}/{content_type}/{content_id}",
                'quality': random.choice(['HD', 'Full HD', '4K']),
                'cost': 'Free',
                'description': platform_info['description'],
                'cast_support': platform_info['cast_support']
            })
        else:
            # Random selection of platforms for mock data
            platform_keys = list(eligible_platforms.keys())
            if platform_keys:
                num_platforms = random.randint(2, min(5, len(platform_keys)))
                selected_platforms = random.sample(platform_keys, num_platforms)
                
                for platform_key in selected_platforms:
                    platform_info = eligible_platforms[platform_key]
                    available_platforms.append({
                        'platform': platform_key,
                        'name': platform_info['name'],
                        'url': f"{platform_info['base_url']}/{content_type}/{content_id}",
                        'quality': random.choice(['HD', 'Full HD', '4K']),
                        'cost': 'Free',
                        'description': platform_info['description'],
                        'cast_support': platform_info['cast_support']
                    })
        
        return available_platforms
    
    def _mock_search_response(self, query: str, page: int, content_type: str, platform_filter: str) -> Dict[str, Any]:
        """Enhanced mock search response with movies and TV shows"""
        mock_content = [
            # Movies
            {
                'id': 603, 'title': 'The Matrix', 'overview': 'A computer programmer discovers reality is a simulation.',
                'poster_path': 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
                'backdrop_path': 'https://image.tmdb.org/t/p/w1280/fNG7i7RqMErkcqhohV2a6cV1Ehy.jpg',
                'release_date': '1999-03-30', 'vote_average': 8.7, 'vote_count': 24000,
                'genre_names': ['Action', 'Sci-Fi'], 'content_type': 'movie'
            },
            {
                'id': 27205, 'title': 'Inception', 'overview': 'A thief enters dreams to plant ideas.',
                'poster_path': 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
                'backdrop_path': 'https://image.tmdb.org/t/p/w1280/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
                'release_date': '2010-07-15', 'vote_average': 8.8, 'vote_count': 35000,
                'genre_names': ['Action', 'Sci-Fi', 'Thriller'], 'content_type': 'movie'
            },
            # TV Shows
            {
                'id': 1399, 'title': 'Game of Thrones', 'overview': 'Noble families fight for the Iron Throne.',
                'poster_path': 'https://image.tmdb.org/t/p/w500/7WUHnWGx5OO145IRxPDUkQSh4C7.jpg',
                'backdrop_path': 'https://image.tmdb.org/t/p/w1280/suopoADq0k8YZr4dQXcU6pToj6s.jpg',
                'first_air_date': '2011-04-17', 'vote_average': 9.2, 'vote_count': 45000,
                'genre_names': ['Drama', 'Fantasy', 'Action & Adventure'], 'content_type': 'tv',
                'seasons': 8, 'episodes': 73
            },
            {
                'id': 1396, 'title': 'Breaking Bad', 'overview': 'A chemistry teacher becomes a meth manufacturer.',
                'poster_path': 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
                'backdrop_path': 'https://image.tmdb.org/t/p/w1280/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg',
                'first_air_date': '2008-01-20', 'vote_average': 9.5, 'vote_count': 55000,
                'genre_names': ['Drama', 'Crime', 'Thriller'], 'content_type': 'tv',
                'seasons': 5, 'episodes': 62
            }
        ]
        
        # Filter by content type
        if content_type == 'movie':
            mock_content = [item for item in mock_content if item['content_type'] == 'movie']
        elif content_type == 'tv':
            mock_content = [item for item in mock_content if item['content_type'] == 'tv']
        
        # Add platform availability with casting support
        for item in mock_content:
            platforms = []
            platform_keys = list(SUPPORTED_PLATFORMS.keys())
            
            if platform_filter and platform_filter in SUPPORTED_PLATFORMS:
                platform_info = SUPPORTED_PLATFORMS[platform_filter]
                if item['content_type'] in platform_info['content_types']:
                    platforms.append({
                        'platform': platform_filter,
                        'name': platform_info['name'],
                        'url': f"{platform_info['base_url']}/{item['content_type']}/{item['id']}",
                        'quality': 'HD',
                        'cost': 'Free',
                        'description': platform_info['description'],
                        'cast_support': platform_info['cast_support']
                    })
            else:
                # Add random platforms
                import random
                eligible_platforms = [k for k, v in SUPPORTED_PLATFORMS.items() 
                                    if item['content_type'] in v['content_types']]
                selected = random.sample(eligible_platforms, min(4, len(eligible_platforms)))
                
                for platform_key in selected:
                    platform_info = SUPPORTED_PLATFORMS[platform_key]
                    platforms.append({
                        'platform': platform_key,
                        'name': platform_info['name'],
                        'url': f"{platform_info['base_url']}/{item['content_type']}/{item['id']}",
                        'quality': random.choice(['HD', 'Full HD']),
                        'cost': 'Free',
                        'description': platform_info['description'],
                        'cast_support': platform_info['cast_support']
                    })
            
            item['platforms'] = platforms
            item['cast_support'] = self._get_cast_support(platforms)
        
        return {
            'results': mock_content,
            'total_results': len(mock_content),
            'page': page,
            'total_pages': 1,
            'content_type': content_type,
            'platform_filter': platform_filter
        }
    
    def _mock_trending_response(self, content_type: str) -> Dict[str, Any]:
        """Enhanced mock trending response with both movies and TV shows"""
        trending_content = [
            # Movies
            {
                'id': 155, 'title': 'The Dark Knight', 'overview': 'Batman faces the Joker in Gotham City.',
                'poster_path': 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
                'backdrop_path': 'https://image.tmdb.org/t/p/w1280/hqkIcbrOHL86UncnHIsHVcVmzue.jpg',
                'release_date': '2008-07-18', 'vote_average': 9.0, 'vote_count': 32000,
                'genre_names': ['Action', 'Crime', 'Drama'], 'content_type': 'movie'
            },
            {
                'id': 680, 'title': 'Pulp Fiction', 'overview': 'Interconnected stories of crime in Los Angeles.',
                'poster_path': 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
                'backdrop_path': 'https://image.tmdb.org/t/p/w1280/4cDFJr4HnXN5AdPw4AKrmLlMWdO.jpg',
                'release_date': '1994-09-10', 'vote_average': 8.9, 'vote_count': 27000,
                'genre_names': ['Crime', 'Drama'], 'content_type': 'movie'
            },
            # TV Shows
            {
                'id': 1402, 'title': 'The Walking Dead', 'overview': 'Survivors navigate a zombie apocalypse.',
                'poster_path': 'https://image.tmdb.org/t/p/w500/rqeYMLryjcawh2JeRpCVUDXYM5b.jpg',
                'backdrop_path': 'https://image.tmdb.org/t/p/w1280/KoYWXbnYuS3b0GyQPkbuexlVK9.jpg',
                'first_air_date': '2010-10-31', 'vote_average': 8.1, 'vote_count': 18000,
                'genre_names': ['Action & Adventure', 'Drama', 'Horror'], 'content_type': 'tv',
                'seasons': 11, 'episodes': 177
            },
            {
                'id': 1408, 'title': 'House', 'overview': 'Brilliant but misanthropic doctor solves medical mysteries.',
                'poster_path': 'https://image.tmdb.org/t/p/w500/3Cz7ySOQJmqiuTdrc6CY0r65yDI.jpg',
                'backdrop_path': 'https://image.tmdb.org/t/p/w1280/cKrhEw44GJlBnFOmgGqTdwjC6wm.jpg',
                'first_air_date': '2004-11-16', 'vote_average': 8.6, 'vote_count': 15000,
                'genre_names': ['Drama', 'Mystery'], 'content_type': 'tv',
                'seasons': 8, 'episodes': 176
            }
        ]
        
        # Filter by content type
        if content_type == 'movie':
            trending_content = [item for item in trending_content if item['content_type'] == 'movie']
        elif content_type == 'tv':
            trending_content = [item for item in trending_content if item['content_type'] == 'tv']
        
        # Add platform availability with casting support
        for item in trending_content:
            import random
            eligible_platforms = [k for k, v in SUPPORTED_PLATFORMS.items() 
                                if item['content_type'] in v['content_types']]
            selected = random.sample(eligible_platforms, min(3, len(eligible_platforms)))
            
            platforms = []
            for platform_key in selected:
                platform_info = SUPPORTED_PLATFORMS[platform_key]
                platforms.append({
                    'platform': platform_key,
                    'name': platform_info['name'],
                    'url': f"{platform_info['base_url']}/{item['content_type']}/{item['id']}",
                    'quality': random.choice(['HD', 'Full HD']),
                    'cost': 'Free',
                    'description': platform_info['description'],
                    'cast_support': platform_info['cast_support']
                })
            
            item['platforms'] = platforms
            item['cast_support'] = self._get_cast_support(platforms)
        
        return {'results': trending_content}

# Initialize clients
tmdb_client = TMDBClient()

# API Routes
@app.get("/api/", tags=["Health"])
async def root():
    return {
        "message": "KingShit.fu API is running!", 
        "status": "online", 
        "platforms": len(SUPPORTED_PLATFORMS),
        "casting_support": ["chromecast", "airplay", "dlna"],
        "tv_compatibility": True
    }

@app.get("/api/search", response_model=SearchResponse, tags=["Content"])
async def search_content(
    q: str = Query(..., description="Search query"),
    page: int = Query(1, ge=1, le=500, description="Page number"),
    content_type: str = Query('multi', regex='^(multi|movie|tv)$', description="Content type filter"),
    platform: Optional[str] = Query(None, description="Platform filter")
):
    """Search for movies and TV shows across free streaming platforms with casting support"""
    try:
        data = await tmdb_client.search_content(q, page, content_type, platform)
        return SearchResponse(**data)
    except Exception as e:
        logger.error(f"Search error: {e}")
        raise HTTPException(status_code=500, detail="Search failed")

@app.get("/api/trending", response_model=TrendingResponse, tags=["Content"])
async def get_trending_content(
    content_type: str = Query('all', regex='^(all|movie|tv)$', description="Content type filter")
):
    """Get trending movies and TV shows available on free platforms with casting support"""
    try:
        data = await tmdb_client.get_trending_content(content_type)
        return TrendingResponse(**data)
    except Exception as e:
        logger.error(f"Trending error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch trending content")

@app.get("/api/platforms", tags=["Platforms"])
async def get_supported_platforms():
    """Get list of supported free streaming platforms with casting capabilities"""
    return {"platforms": SUPPORTED_PLATFORMS}

@app.get("/api/platforms/{platform_key}", tags=["Platforms"])
async def get_platform_content(
    platform_key: str,
    content_type: str = Query('multi', regex='^(multi|movie|tv)$', description="Content type filter"),
    page: int = Query(1, ge=1, le=100, description="Page number")
):
    """Get content available on a specific platform with casting info"""
    if platform_key not in SUPPORTED_PLATFORMS:
        raise HTTPException(status_code=404, detail="Platform not found")
    
    try:
        # Mock platform-specific content
        data = await tmdb_client.search_content("popular", page, content_type, platform_key)
        return SearchResponse(**data)
    except Exception as e:
        logger.error(f"Platform content error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch platform content")

@app.get("/api/cast-support", tags=["Casting"])
async def get_cast_support():
    """Get casting support information across all platforms"""
    cast_stats = {
        'chromecast': 0,
        'airplay': 0,
        'dlna': 0,
        'total_platforms': len(SUPPORTED_PLATFORMS)
    }
    
    for platform_info in SUPPORTED_PLATFORMS.values():
        cast_support = platform_info.get('cast_support', {})
        for cast_type, supported in cast_support.items():
            if supported and cast_type in cast_stats:
                cast_stats[cast_type] += 1
    
    return {
        "casting_capabilities": cast_stats,
        "supported_protocols": ["Google Cast", "Apple AirPlay", "DLNA"],
        "tv_optimized": True
    }

@app.get("/api/health", tags=["Health"])
async def health_check():
    """API health check with platform count and casting info"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "api_keys": {
            "tmdb": "configured" if os.environ.get('TMDB_API_KEY') else "missing"
        },
        "platforms_count": len(SUPPORTED_PLATFORMS),
        "content_types": ["movie", "tv"],
        "casting_support": ["chromecast", "airplay", "dlna"],
        "tv_compatible": True,
        "google_tv_ready": True
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
