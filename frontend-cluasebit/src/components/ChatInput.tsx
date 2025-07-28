// components/ChatInput.tsx
import React from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ value, onChange, onSend, onKeyPress }) => {
  return (
    <div className="border-t border-purple-100 bg-white/70 backdrop-blur-sm p-3 lg:p-6 safe-area-bottom">
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          <textarea
            value={value}
            onChange={onChange}
            onKeyPress={onKeyPress}
            placeholder="Ask about privacy policies, terms of service, or paste a URL to analyze..."
            className="w-full resize-none border border-purple-200 rounded-2xl px-4 lg:px-6 py-3 lg:py-4 pr-12 lg:pr-14 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-white/80 backdrop-blur-sm shadow-sm min-h-[3rem] lg:min-h-[4rem]"
            rows={2}
            style={{ maxHeight: '120px' }}
          />
          <button
            onClick={onSend}
            disabled={!value.trim()}
            className="absolute bottom-3 lg:bottom-4 right-3 lg:right-4 w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition-all shadow-md hover:shadow-lg"
          >
            <Send className="w-3 h-3 lg:w-4 lg:h-4" />
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-2 lg:mt-3 text-center px-2">
          AI-powered legal assistant • Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
};

export default ChatInput;