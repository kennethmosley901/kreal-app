import React from 'react';
import { useParams } from 'react-router-dom';
import { Star, Calendar, Clock, Users, Play, ExternalLink } from 'lucide-react';

const MovieDetails = () => {
  const { id } = useParams();
  
  // This would fetch movie details in a real app
  // For now, showing a placeholder
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-white mb-4">Movie Details</h2>
        <p className="text-gray-400">Coming soon - detailed movie information and streaming options</p>
        <p className="text-gray-500 mt-2">Movie ID: {id}</p>
      </div>
    </div>
  );
};

export default MovieDetails;