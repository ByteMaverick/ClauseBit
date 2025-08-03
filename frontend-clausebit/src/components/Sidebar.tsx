
import React from 'react';
import { Plus, Download } from 'lucide-react';
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
  onLoadConversation
}) => {
  return (
    <div className={`${isOpen ? 'w-80' : 'w-0'} bg-white/80 backdrop-blur-sm border-r border-purple-100 transition-all duration-300 overflow-hidden flex flex-col shadow-lg`}>
      {/* Sidebar Header */}
      <div className="p-6 border-b border-purple-100">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 ml-2 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">ClauseBit</span>
        </div>

        <button
          onClick={onNewChat}
          className="w-full flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl transition-all shadow-md hover:shadow-lg mb-4"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">New Chat</span>
        </button>

        <button className="w-full flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl transition-all shadow-md hover:shadow-lg">
          <Download className="w-5 h-5" />
          <span className="font-medium">Get Chromium Extension</span>
        </button>
      </div>

      {/* Recent Conversations */}
      <div className="flex-1 overflow-y-auto p-6">
        <h3 className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wide">Recent</h3>
        <div className="space-y-2">
          {conversations.map((conv: Conversation) => (
            <div
              key={conv.session_id}
              onClick={() => onLoadConversation(conv.session_id)}
              className={`p-3 rounded-xl hover:bg-purple-50 cursor-pointer transition-colors border ${
                currentSessionId === conv.session_id 
                  ? 'border-purple-200 bg-purple-50' 
                  : 'border-transparent hover:border-purple-100'
              }`}
            >
              <div className="font-medium text-gray-900 text-sm truncate">{conv.title}</div>
              <div className="text-xs text-gray-500 mt-1 flex justify-between">
                <span>{conv.time}</span>
                <span>{conv.message_count > 0 ? `${conv.message_count} messages` : 'New'}</span>
              </div>
            </div>
          ))}
          {conversations.length === 0 && (
            <div className="text-center text-gray-500 text-sm py-4">
              No conversations yet.<br />Start chatting to see your history!
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="p-6 border-t border-purple-100">
        <div className="flex items-center space-x-3 p-3 rounded-xl hover:bg-purple-50 cursor-pointer transition-colors">
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
             <UserButton/>
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">ClauseBit (Beta)</div>
            <div className="text-xs text-gray-500">You're exploring an early version</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;