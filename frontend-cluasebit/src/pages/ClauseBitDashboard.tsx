import React, { useState, useRef, useEffect } from 'react';
import { Send, Plus, User, Bot, Download, Shield, Database, Zap, Menu, X } from 'lucide-react';
import { useClerk, useUser, UserButton } from "@clerk/clerk-react";
import { useNavigate } from 'react-router-dom';

interface Message {
  id: number;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  title: string;
  time: string;
  session_id: string;
  message_count: number;
}

interface RawMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string | number | { _seconds: number };
}

const ClauseBitDashboardLegacy: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'assistant',
      content: "Hi! I'm your AI-powered legal assistant. I can scan Terms of Service, Privacy Policies, and Cookie Banners — flagging risky clauses and explaining them in plain English. What would you like to analyze today?",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false); // Default closed on mobile
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const currentUserId = user?.id || "guest";

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadConversations();
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('sidebar');
      const menuButton = document.getElementById('menu-button');

      if (sidebarOpen && sidebar && !sidebar.contains(event.target as Node) && !menuButton?.contains(event.target as Node)) {
        setSidebarOpen(false);
      }
    };

    if (sidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarOpen]);

  const loadConversations = async (): Promise<void> => {
    try {
      const response = await fetch(`http://127.0.0.1:8080/memory/recent/${currentUserId}/`);
      if (response.ok) {
        const conversationsData = await response.json();
        console.log('Raw conversations data:', conversationsData);

        const formatted = conversationsData.map((conv: any, index: number) => {
          let title = conv.title || 'New Chat';
          if (!conv.title && conv.session_id) {
            title = `Chat ${index + 1}`;
          }

          let timeString = 'Unknown time';
          if (conv.timestamp) {
            try {
              let date;
              if (conv.timestamp._seconds) {
                date = new Date(conv.timestamp._seconds * 1000);
              } else if (typeof conv.timestamp === 'string') {
                date = new Date(conv.timestamp);
              } else {
                date = new Date(conv.timestamp);
              }
              timeString = date.toLocaleTimeString();
            } catch (e) {
              console.warn('Error parsing timestamp:', conv.timestamp);
              timeString = 'Unknown time';
            }
          }

          return {
            id: conv.session_id,
            session_id: conv.session_id,
            title: title,
            time: timeString,
            message_count: 0
          };
        });

        console.log('Formatted conversations:', formatted);
        setConversations(formatted);
      } else {
        console.error('Failed to load conversations:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const startNewChat = (): void => {
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setCurrentSessionId(newSessionId);

    setMessages([
      {
        id: 1,
        type: 'assistant',
        content: "Hi! I'm your AI-powered legal assistant. I can scan Terms of Service, Privacy Policies, and Cookie Banners — flagging risky clauses and explaining them in plain English. What would you like to analyze today?",
        timestamp: new Date().toLocaleTimeString()
      }
    ]);

    setInputMessage('');
    setSidebarOpen(false); // Close sidebar after starting new chat on mobile
  };

  const loadConversation = async (sessionId: string): Promise<void> => {
    try {
      const response = await fetch(`http://127.0.0.1:8080/memory/${currentUserId}/${sessionId}`);
      if (!response.ok) {
        console.error('Failed to load conversation:', response.status, response.statusText);
        setMessages([
          {
            id: 1,
            type: 'assistant',
            content: "Sorry, I couldn't load this conversation. Please try starting a new chat.",
            timestamp: new Date().toLocaleTimeString()
          }
        ]);
        return;
      }

      const conversationData = await response.json();
      console.log('Loaded conversation data:', conversationData);

      const formattedMessages: Message[] = [];
      const rawMessages: RawMessage[] = Array.isArray(conversationData.messages) ? conversationData.messages : [];

      rawMessages.forEach((msg) => {
        if (!msg || !msg.role) return;

        let timestamp = new Date().toLocaleTimeString();

        try {
          let date: Date;

          if (typeof msg.timestamp === 'object' && '_seconds' in msg.timestamp) {
            date = new Date((msg.timestamp as { _seconds: number })._seconds * 1000);
          } else {
            date = new Date(msg.timestamp);
          }

          if (!isNaN(date.getTime())) {
            timestamp = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          }
        } catch (e) {
          console.warn('Error parsing timestamp:', msg.timestamp);
        }

        formattedMessages.push({
          id: formattedMessages.length + 1,
          type: msg.role,
          content: msg.content,
          timestamp
        });
      });

      setMessages(formattedMessages);
      setCurrentSessionId(sessionId);
      setSidebarOpen(false); // Close sidebar after loading conversation on mobile
    } catch (error) {
      console.error('Error loading conversation:', error);
      setMessages([
        {
          id: 1,
          type: 'assistant',
          content: "Sorry, I encountered an error loading this conversation. Please try starting a new chat.",
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    }
  };

  const handleSendMessage = async (): Promise<void> => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, newMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await fetch('http://127.0.0.1:8080/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: currentMessage,
          session_id: currentSessionId,
          user_id: currentUserId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();

      setMessages(prev => [...prev, {
        id: prev.length + 1,
        type: 'assistant',
        content: responseText,
        timestamp: new Date().toLocaleTimeString()
      }]);

      setTimeout(() => {
        loadConversations();
      }, 500);

    } catch (error) {
      console.error('Error calling chat API:', error);

      setMessages(prev => [...prev, {
        id: prev.length + 1,
        type: 'assistant',
        content: `Sorry, I encountered an error while processing your request: ${error instanceof Error ? error.message : 'Unknown error'}. Please make sure the server is running on http://127.0.0.1:8080`,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const conversationHistory: Conversation[] = conversations;

  const toggleSidebar = (): void => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setInputMessage(e.target.value);
  };

  const { signOut } = useClerk();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex relative">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        id="sidebar"
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed lg:relative lg:translate-x-0 w-80 lg:w-80 bg-white/90 backdrop-blur-sm border-r border-purple-100 transition-transform duration-300 overflow-hidden flex flex-col shadow-lg z-50 h-full`}
      >
        {/* Sidebar Header */}
        <div className="p-4 lg:p-6 border-b border-purple-100">
          {/* Mobile close button */}
          <div className="flex justify-between items-center lg:hidden mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">ClauseBit</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-purple-50 rounded-lg">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Desktop header */}
          <div className="hidden lg:flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 ml-2 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">ClauseBit</span>
          </div>

          <button
            onClick={startNewChat}
            className="w-full flex items-center space-x-3 px-3 lg:px-4 py-2 lg:py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl transition-all shadow-md hover:shadow-lg mb-3 lg:mb-4 text-sm lg:text-base"
          >
            <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
            <span className="font-medium">New Chat</span>
          </button>

          <button className="w-full flex items-center space-x-3 px-3 lg:px-4 py-2 lg:py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl transition-all shadow-md hover:shadow-lg text-sm lg:text-base">
            <Download className="w-4 h-4 lg:w-5 lg:h-5" />
            <span className="font-medium">Get Extension</span>
          </button>
        </div>

        {/* Recent Conversations */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <h3 className="text-xs lg:text-sm font-semibold text-gray-600 mb-3 lg:mb-4 uppercase tracking-wide">Recent</h3>
          <div className="space-y-2">
            {conversationHistory.map((conv: Conversation) => (
              <div
                key={conv.session_id}
                onClick={() => loadConversation(conv.session_id)}
                className={`p-2 lg:p-3 rounded-xl hover:bg-purple-50 cursor-pointer transition-colors border ${
                  currentSessionId === conv.session_id 
                    ? 'border-purple-200 bg-purple-50' 
                    : 'border-transparent hover:border-purple-100'
                }`}
              >
                <div className="font-medium text-gray-900 text-xs lg:text-sm truncate">{conv.title}</div>
                <div className="text-xs text-gray-500 mt-1 flex justify-between">
                  <span>{conv.time}</span>
                  <span>{conv.message_count > 0 ? `${conv.message_count} messages` : 'New'}</span>
                </div>
              </div>
            ))}
            {conversationHistory.length === 0 && (
              <div className="text-center text-gray-500 text-xs lg:text-sm py-4">
                No conversations yet.<br />Start chatting to see your history!
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 lg:p-6 border-t border-purple-100">
          <div className="flex items-center space-x-3 p-2 lg:p-3 rounded-xl hover:bg-purple-50 cursor-pointer transition-colors">
            <div className="w-6 h-6 lg:w-8 lg:h-8 bg-purple-100 rounded-full flex items-center justify-center">
               <UserButton/>
            </div>
            <div className="flex-1">
              <div className="text-xs lg:text-sm font-medium text-gray-900">ClauseBit (Beta)</div>
              <div className="text-xs text-gray-500">Early version</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation */}
        <nav className="bg-white/70 backdrop-blur-sm border-b border-purple-100 px-4 lg:px-6 py-3 lg:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 lg:space-x-4">
              <button
                id="menu-button"
                onClick={toggleSidebar}
                className="p-2 hover:bg-purple-50 rounded-lg transition-colors lg:hidden"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>

              {/* Desktop menu button */}
              <button
                onClick={toggleSidebar}
                className="hidden lg:block p-2 hover:bg-purple-50 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>

              <div className="flex items-center space-x-2 lg:space-x-3">
                <h1 className="text-lg lg:text-xl font-semibold text-gray-900 truncate">Privacy Assistant</h1>
                <div className="hidden sm:block text-xs lg:text-sm bg-gradient-to-r from-purple-500 to-blue-500 text-white px-2 lg:px-3 py-1 rounded-full font-medium whitespace-nowrap">
                  AI-Powered
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 lg:space-x-4">
              <div className="flex items-center space-x-1 lg:space-x-2 bg-red-50 px-2 lg:px-3 py-1 lg:py-2 rounded-lg border border-red-100">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs lg:text-sm text-red-700 font-medium hidden sm:inline">Under Development</span>
                <span className="text-xs text-red-700 font-medium sm:hidden">Beta</span>
              </div>
              <button
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-3 lg:px-4 py-2 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all font-medium text-sm lg:text-base"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </nav>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-3 lg:p-6">
            {messages.length === 1 && (
              <div className="text-center py-8 lg:py-16">
                <div className="relative mb-6 lg:mb-8">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6 shadow-lg">
                    <Shield className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-24 h-24 lg:w-32 lg:h-32 bg-gradient-to-r from-purple-200 to-blue-200 rounded-full blur-3xl opacity-30"></div>
                </div>

                <h2 className="text-2xl lg:text-4xl font-bold mb-3 lg:mb-4 px-4">
                  Take Control of
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"> Your Privacy</span>
                </h2>
                <p className="text-gray-600 mb-8 lg:mb-12 max-w-2xl mx-auto text-sm lg:text-lg leading-relaxed px-4">
                  ClauseBit is your AI-powered legal assistant that scans Terms of Service, Privacy Policies, and Cookie Banners — flagging risky clauses and explaining them in plain English.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-8 lg:space-x-12 text-xs lg:text-sm text-gray-500 mb-8 lg:mb-0">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 lg:w-5 lg:h-5 text-purple-500" />
                    <span>Sub-3s Analysis</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4 lg:w-5 lg:h-5 text-blue-500" />
                    <span>Dynamic Knowledge</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 lg:w-5 lg:h-5 text-green-500" />
                    <span>AI-Powered</span>
                  </div>
                </div>

                <button className="mt-8 lg:mt-12 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 lg:px-8 py-3 lg:py-4 rounded-2xl font-semibold text-base lg:text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                  Try Now!
                </button>
              </div>
            )}

            {messages.map((message: Message) => (
              <div key={message.id} className={`mb-6 lg:mb-8 ${message.type === 'user' ? 'ml-auto max-w-xl lg:max-w-2xl' : 'mr-auto max-w-full lg:max-w-4xl'}`}>
                <div className="flex items-start space-x-2 lg:space-x-4">
                  {message.type === 'assistant' && (
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                      <Bot className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className={`${
                      message.type === 'user' 
                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white ml-auto shadow-md' 
                        : 'bg-white/80 backdrop-blur-sm border border-purple-100 shadow-sm'
                    } rounded-2xl px-4 lg:px-6 py-3 lg:py-4`}>
                      <div className="whitespace-pre-wrap text-sm lg:text-sm leading-relaxed break-words">{message.content}</div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2 px-2">{message.timestamp}</div>
                  </div>

                  {message.type === 'user' && (
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="mb-6 lg:mb-8 mr-auto max-w-full lg:max-w-4xl">
                <div className="flex items-start space-x-2 lg:space-x-4">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-md">
                    <Bot className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm border border-purple-100 rounded-2xl px-4 lg:px-6 py-3 lg:py-4 shadow-sm">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-purple-100 bg-white/70 backdrop-blur-sm p-3 lg:p-6 safe-area-bottom">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <textarea
                value={inputMessage}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Ask about privacy policies, terms of service, or paste a URL to analyze..."
                className="w-full resize-none border border-purple-200 rounded-2xl px-4 lg:px-6 py-3 lg:py-4 pr-12 lg:pr-14 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-white/80 backdrop-blur-sm shadow-sm min-h-[3rem] lg:min-h-[4rem]"
                rows={2}
                style={{ maxHeight: '120px' }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
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
      </div>
    </div>
  );
};

export default ClauseBitDashboardLegacy;