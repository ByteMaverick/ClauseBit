import React from 'react';
import { Menu } from 'lucide-react';

interface TopNavigationProps {
  onToggleSidebar: () => void;
  onLogout: () => void;
}

const TopNavigation: React.FC<TopNavigationProps> = ({ onToggleSidebar, onLogout }) => {
  return (
    <nav className="bg-white/70 backdrop-blur-md border-b border-purple-100 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left Section: Sidebar toggle + Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 hover:bg-purple-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </button>

          <div className="flex items-center gap-3">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
              Privacy Assistant
            </h1>
            <span className="text-xs sm:text-sm bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-1 rounded-full font-medium shadow-sm">
              Powered by Multi-Agent AI
            </span>
          </div>
        </div>

        {/* Right Section: Status + Logout */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg border border-red-100 shadow-sm">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            <span className="text-xs sm:text-sm text-red-700 font-medium whitespace-nowrap">
              BETA
            </span>
          </div>

          <button
            onClick={onLogout}
            className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default TopNavigation;
