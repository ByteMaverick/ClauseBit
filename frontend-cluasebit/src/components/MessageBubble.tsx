// components/MessageBubble.tsx
import React from 'react';
import { User, Bot } from 'lucide-react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  return (
    <div className={`mb-6 md:mb-8 px-4 md:px-0 ${message.type === 'user' ? 'ml-auto max-w-full md:max-w-2xl' : 'mr-auto max-w-full md:max-w-4xl'}`}>
      <div className="flex items-start space-x-3 md:space-x-4">
        {message.type === 'assistant' && (
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
            <Bot className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className={`${
            message.type === 'user' 
              ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white ml-auto shadow-md' 
              : 'bg-white/80 backdrop-blur-sm border border-purple-100 shadow-sm'
          } rounded-2xl px-4 md:px-6 py-3 md:py-4 break-words`}>
            <div className="whitespace-pre-wrap text-sm md:text-sm leading-relaxed">{message.content}</div>
          </div>
          <div className="text-xs text-gray-500 mt-2 px-2">{message.timestamp}</div>
        </div>

        {message.type === 'user' && (
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
