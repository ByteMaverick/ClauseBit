// ClauseBitDashboard.tsx (Main component - now much cleaner)
import React, { useState, useRef, useEffect } from 'react';
import { useClerk, useUser } from "@clerk/clerk-react";
import { useNavigate } from 'react-router-dom';

import Sidebar from 'src/components/Sidebar.tsx';
import TopNavigation from 'src/components/TopNavigation';
import WelcomeScreen from 'src/components/WelcomeScreen';
import MessageBubble from 'src/components/MessageBubble';
import TypingIndicator from 'src/components/TypingIndicator';
import ChatInput from 'src/components/ChatInput';
import { useConversations } from 'src/hooks/useConversations';
import { Message } from 'src/types';

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
  const [currentSessionId, setCurrentSessionId] = useState<string>(() =>
    `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const currentUserId = user?.id || "guest";
  const { signOut } = useClerk();
  const navigate = useNavigate();

  const { conversations, loadConversations, loadConversation } = useConversations(currentUserId);

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

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
  };

  const handleLoadConversation = async (sessionId: string): Promise<void> => {
    const loadedMessages = await loadConversation(sessionId);
    setMessages(loadedMessages);
    setCurrentSessionId(sessionId);
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

  const toggleSidebar = (): void => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setInputMessage(e.target.value);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex">
      <Sidebar
        isOpen={sidebarOpen}
        conversations={conversations}
        currentSessionId={currentSessionId}
        onNewChat={startNewChat}
        onLoadConversation={handleLoadConversation}
      />

      <div className="flex-1 flex flex-col">
        <TopNavigation onToggleSidebar={toggleSidebar} onLogout={handleLogout} />

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6">
            {messages.length === 1 && <WelcomeScreen />}

            {messages.map((message: Message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <ChatInput
          value={inputMessage}
          onChange={handleInputChange}
          onSend={handleSendMessage}
          onKeyPress={handleKeyPress}
        />
      </div>
    </div>
  );
};

export default ClauseBitDashboard;