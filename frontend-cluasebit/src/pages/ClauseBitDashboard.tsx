import React, { useState, useRef, useEffect } from 'react';
import { Send, Plus, User, Bot, Download  , Settings, History, Shield, Database, Zap, Menu, Search, Bell, Sun } from 'lucide-react';
import { SignIn, SignUp, SignedIn, SignedOut, useClerk, UserButton } from "@clerk/clerk-react";
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

const ClauseBitDashboard: React.FC = () => {
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
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentUserId] = useState<string>(() => `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load conversations when component mounts
    loadConversations();
  }, []);

  const loadConversations = async (): Promise<void> => {
    try {
      const response = await fetch('http://127.0.0.1:8080/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: currentUserId
        })
      });

      if (response.ok) {
        const conversationsData = await response.json();
        setConversations(conversationsData);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const startNewChat = (): void => {
    // Generate new session ID
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setCurrentSessionId(newSessionId);
    
    // Clear current messages and show welcome message
    setMessages([
      {
        id: 1,
        type: 'assistant',
        content: "Hi! I'm your AI-powered legal assistant. I can scan Terms of Service, Privacy Policies, and Cookie Banners — flagging risky clauses and explaining them in plain English. What would you like to analyze today?",
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
    
    // Clear input
    setInputMessage('');
  };

  const loadConversation = async (sessionId: string): Promise<void> => {
    try {
      const response = await fetch(`http://127.0.0.1:8080/conversation/${sessionId}`);
      
      if (response.ok) {
        const conversationData = await response.json();
        
        // Convert conversation messages to display format
        const formattedMessages: Message[] = [
          {
            id: 1,
            type: 'assistant',
            content: "Hi! I'm your AI-powered legal assistant. I can scan Terms of Service, Privacy Policies, and Cookie Banners — flagging risky clauses and explaining them in plain English. What would you like to analyze today?",
            timestamp: new Date(conversationData.created_at).toLocaleTimeString()
          }
        ];
        
        conversationData.messages.forEach((msg: any, index: number) => {
          formattedMessages.push({
            id: formattedMessages.length + 1,
            type: 'user',
            content: msg.question,
            timestamp: new Date(msg.timestamp).toLocaleTimeString()
          });
          
          formattedMessages.push({
            id: formattedMessages.length + 1,
            type: 'assistant',
            content: msg.response,
            timestamp: new Date(msg.timestamp).toLocaleTimeString()
          });
        });
        
        setMessages(formattedMessages);
        setCurrentSessionId(sessionId);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
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
      // Make API call to your local server
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
      
      // Add the API response as an assistant message
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        type: 'assistant',
        content: responseText,
        timestamp: new Date().toLocaleTimeString()
      }]);

      // Reload conversations after sending a message
      await loadConversations();

    } catch (error) {
      console.error('Error calling chat API:', error);
      
      // Add error message
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

  const sampleQueries: string[] = [
    "Change Policy peferences",
    "What data does TikTok collect?",
    "Compare Netflix vs Spotify privacy",
    "Explain this cookie banner"
  ];

  const conversationHistory: Conversation[] = conversations;

  const handleSampleQueryClick = (query: string): void => {
    setInputMessage(query);
  };

  const toggleSidebar = (): void => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setInputMessage(e.target.value);
  };

const { signOut } = useClerk();
const navigate = useNavigate();

const handleLogout = async () => {
  await signOut();       // Ends Clerk session
  navigate("/");         // React-router redirect to homepage
};

  return (
    <div className="h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} bg-white/80 backdrop-blur-sm border-r border-purple-100 transition-all duration-300 overflow-hidden flex flex-col shadow-lg`}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-purple-100">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 ml-2 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">ClauseBit</span>
          </div>
          
          <button 
            onClick={startNewChat}
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
            {conversationHistory.map((conv: Conversation, index: number) => (
              <div 
                key={index} 
                onClick={() => loadConversation(conv.session_id)}
                className={`p-3 rounded-xl hover:bg-purple-50 cursor-pointer transition-colors border ${
                  currentSessionId === conv.session_id 
                    ? 'border-purple-200 bg-purple-50' 
                    : 'border-transparent hover:border-purple-100'
                }`}
              >
                <div className="font-medium text-gray-900 text-sm truncate">{conv.title}</div>
                <div className="text-xs text-gray-500 mt-1 flex justify-between">
                  <span>{conv.time}</span>
                  <span>{conv.message_count} messages</span>
                </div>
              </div>
            ))}
            {conversationHistory.length === 0 && (
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <nav className="bg-white/70 backdrop-blur-sm border-b border-purple-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={toggleSidebar}
                className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center space-x-3">
                <h1 className="text-xl font-semibold text-gray-900"> Privacy Assistant</h1>
                <div className="text-sm bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-1 rounded-full font-medium">
                  Powered by Multi-Agent AI
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-red-50 px-3 py-2 rounded-lg border border-green-100">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-red-700 font-medium">Under Development</span>
              </div>
            {/* <button className="p-2 hover:bg-purple-50 rounded-lg transition-colors">
                <Sun className="w-5 h-5 text-gray-600" />
              </button> */}
                      <button
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all font-medium"
              onClick={handleLogout}
            >
              Logout
            </button>
            </div>
          </div>
        </nav>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6">
            {messages.length === 1 && (
              <div className="text-center py-16">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Shield className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-32 h-32 bg-gradient-to-r from-purple-200 to-blue-200 rounded-full blur-3xl opacity-30"></div>
                </div>
                
                <h2 className="text-4xl font-bold mb-4">
                  Take Control of 
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"> Your Privacy</span>
                </h2>
                <p className="text-gray-600 mb-12 max-w-2xl mx-auto text-lg leading-relaxed">
                  ClauseBit is your AI-powered legal assistant that scans Terms of Service, Privacy Policies, and Cookie Banners — flagging risky clauses and explaining them in plain English. Personalized to your privacy preferences.
                </p>
                
                <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto mb-12">
                  {sampleQueries.map((query: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => handleSampleQueryClick(query)}
                      className="p-6 text-left bg-white/80 backdrop-blur-sm border border-purple-100 rounded-2xl hover:border-purple-200 hover:bg-white transition-all shadow-sm hover:shadow-md"
                    >
                      <div className="font-medium text-gray-900 text-lg">{query}</div>
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-center space-x-12 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-purple-500" />
                    <span>Sub-3s Analysis</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Database className="w-5 h-5 text-blue-500" />
                    <span>Dynamic Knowledge Base</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-green-500" />
                    <span>AI-Powered</span>
                  </div>
                </div>

                <button className="mt-12 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                  Try Now!
                </button>
              </div>
            )}

            {messages.map((message: Message) => (
              <div key={message.id} className={`mb-8 ${message.type === 'user' ? 'ml-auto max-w-2xl' : 'mr-auto max-w-4xl'}`}>
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
            ))}

            {isTyping && (
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
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-purple-100 bg-white/70 backdrop-blur-sm p-6">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <textarea
                value={inputMessage}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Ask about privacy policies, terms of service, or paste a URL to analyze..."
                className="w-full resize-none border border-purple-200 rounded-2xl px-6 py-4 pr-14 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-white/80 backdrop-blur-sm shadow-sm"
                rows={3}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="absolute bottom-4 right-4 w-10 h-10 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition-all shadow-md hover:shadow-lg"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-3 text-center">
              AI-powered legal assistant • Press Enter to send, Shift+Enter for new line
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClauseBitDashboard;