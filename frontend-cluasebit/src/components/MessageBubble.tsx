// components/MessageBubble.tsx
import React from 'react';
import { User, Bot } from 'lucide-react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  return (
    <div className={`mb-8 ${message.type === 'user' ? 'ml-auto max-w-2xl' : 'mr-auto max-w-4xl'}`}>
      <div className="flex items-start space-x-4">
        {message.type === 'assistant' && (
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
            <Bot className="w-5 h-5 text-white" />
          </div>
        )}

        <div className="flex-1">
          <div className={`${
            message.type === 'user' 
              ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white ml-auto shadow-md' 
              : 'bg-white/80 backdrop-blur-sm border border-purple-100 shadow-sm'
          } rounded-2xl px-6 py-4`}>
            <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
          </div>
          <div className="text-xs text-gray-500 mt-2 px-2">{message.timestamp}</div>
        </div>

        {message.type === 'user' && (
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-gray-600" />
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;