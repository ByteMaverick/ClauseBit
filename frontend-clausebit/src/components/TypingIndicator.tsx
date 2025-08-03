// components/TypingIndicator.tsx
import React from 'react';
import { Bot } from 'lucide-react';

const TypingIndicator: React.FC = () => {
  return (
    <div className="mb-8 mr-auto max-w-4xl">
      <div className="flex items-start space-x-4">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-md">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div className="bg-white/80 backdrop-blur-sm border border-purple-100 rounded-2xl px-6 py-4 shadow-sm">
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;