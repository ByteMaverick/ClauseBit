// components/TopNavigation.tsx
import React from 'react';
import { Menu } from 'lucide-react';

interface TopNavigationProps {
  onToggleSidebar: () => void;
  onLogout: () => void;
}

const TopNavigation: React.FC<TopNavigationProps> = ({ onToggleSidebar, onLogout }) => {
  return (
    <nav className="bg-white/70 backdrop-blur-sm border-b border-purple-100 px-4 lg:px-6 py-3 lg:py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 lg:space-x-4 flex-1 min-w-0">
          <button
            id="menu-button"
            onClick={onToggleSidebar}
            className="p-2 hover:bg-purple-50 rounded-lg transition-colors flex-shrink-0"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          <div className="flex items-center space-x-2 lg:space-x-3 min-w-0 flex-1">
            <h1 className="text-lg lg:text-xl font-semibold text-gray-900 truncate">Privacy Assistant</h1>
            <div className="hidden sm:block text-xs lg:text-sm bg-gradient-to-r from-purple-500 to-blue-500 text-white px-2 lg:px-3 py-1 rounded-full font-medium whitespace-nowrap">
              AI-Powered
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 lg:space-x-4 flex-shrink-0">
          <div className="flex items-center space-x-1 lg:space-x-2 bg-red-50 px-2 lg:px-3 py-1 lg:py-2 rounded-lg border border-red-100">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-xs lg:text-sm text-red-700 font-medium hidden sm:inline">Under Development</span>
            <span className="text-xs text-red-700 font-medium sm:hidden">Beta</span>
          </div>
          <button
            className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-3 lg:px-4 py-2 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all font-medium text-sm lg:text-base"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default TopNavigation;