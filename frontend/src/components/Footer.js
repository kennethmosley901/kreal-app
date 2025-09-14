import React from 'react';
import { Heart, Github, Twitter, Film } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black/90 border-t border-gray-800 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Film className="h-6 w-6 text-red-500" />
              <span className="text-xl font-bold text-white">KingShit.fu</span>
            </div>
            <p className="text-gray-400 mb-4">
              Discover and watch movies for free across the best streaming platforms. 
              Updated daily with fresh links and new releases.
            </p>
            <div className="flex items-center space-x-4">
              <a href="#" className="text-gray-400 hover:text-red-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-400 transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Platforms */}
          <div>
            <h3 className="text-white font-semibold mb-4">Free Platforms</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Tubi</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Pluto TV</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Crackle</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Roku Channel</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">DMCA</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 KingShit.fu. Made with <Heart className="h-4 w-4 text-red-500 inline mx-1" /> for movie lovers.
          </p>
          <p className="text-gray-500 text-xs mt-2 md:mt-0">
            All streaming links redirect to official platforms.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;