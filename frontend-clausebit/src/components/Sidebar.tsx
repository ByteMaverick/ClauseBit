import React, { useState } from 'react';
import { Plus, Download, Search } from 'lucide-react';
import { UserButton } from "@clerk/clerk-react";
import { Conversation } from '../types';

interface SidebarProps {
  isOpen: boolean;
  conversations: Conversation[];
  currentSessionId: string;
  onNewChat: () => void;
  onLoadConversation: (sessionId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  conversations,
  currentSessionId,
  onNewChat,
  onLoadConversation,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside
      className={`${isOpen ? 'w-80' : 'w-0'} bg-white/80 backdrop-blur-sm border-r border-purple-100 transition-all duration-300 overflow-hidden flex flex-col shadow-lg`}
    >
      {/* Header */}
      <div className="p-6 border-b border-purple-100">
        <div className="flex items-center gap-3 mb-6">
          <a href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent transition-all duration-200 group-hover:underline">
              ClauseBit
            </span>
          </a>
        </div>

        <div className="space-y-3">
          <button
            onClick={onNewChat}
            className="w-full flex items-center justify-start gap-3 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">New Chat</span>
          </button>

          <button
            className="w-full flex items-center justify-start gap-3 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <Download className="w-5 h-5" />
            <span className="font-medium">Get Chrome Extension</span>
          </button>
        </div>
      </div>

      {/* Recent Conversations */}
      <div className="flex-1 overflow-y-auto p-6">
        <h3 className="text-xs font-semibold text-gray-600 mb-4 uppercase tracking-wider">
          Recent Conversations
        </h3>

        {/* Search bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search chats..."
            className="w-full pl-10 pr-3 py-2 text-sm rounded-lg border border-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          {filteredConversations.map((conv) => (
            <div
              key={conv.session_id}
              onClick={() => onLoadConversation(conv.session_id)}
              className={`p-3 rounded-xl transition-colors cursor-pointer border ${
                currentSessionId === conv.session_id
                  ? 'border-purple-200 bg-purple-50'
                  : 'border-transparent hover:bg-purple-50 hover:border-purple-100'
              }`}
              role="button"
              tabIndex={0}
              title={conv.title}
            >
              <div className="text-sm font-medium text-gray-900 truncate">
                {conv.title}
              </div>
              <div className="text-xs text-gray-500 mt-1 flex justify-between">
                <span>{conv.time}</span>
                <span>
                  {conv.message_count > 0 && `${conv.message_count} message${conv.message_count > 1 ? 's' : ''}`}
                </span>
              </div>
            </div>
          ))}

          {filteredConversations.length === 0 && (
            <div className="text-center text-gray-500 text-sm py-4">
              No conversations found.
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-purple-100">
        <div className="flex items-center gap-3">
          <UserButton afterSignOutUrl="/" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-900">ClauseBit (Beta)</span>
            <span className="text-xs text-gray-500">
              You're exploring an early version
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
