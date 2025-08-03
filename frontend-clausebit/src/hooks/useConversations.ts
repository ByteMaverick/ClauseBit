// hooks/useConversations.ts
import { useState, useCallback } from 'react';
import { Conversation, RawMessage, Message } from '../types';

export const useConversations = (currentUserId: string) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const loadConversations = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch(`https://clausebitbackendimg-834600606953.us-central1.run.app/memory/recent/${currentUserId}/`);
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
  }, [currentUserId]);

  const loadConversation = useCallback(async (sessionId: string): Promise<Message[]> => {
    try {
      const response = await fetch(`https://clausebitbackendimg-834600606953.us-central1.run.app/memory/${currentUserId}/${sessionId}`);
      if (!response.ok) {
        console.error('Failed to load conversation:', response.status, response.statusText);
        return [{
          id: 1,
          type: 'assistant',
          content: "Sorry, I couldn't load this conversation. Please try starting a new chat.",
          timestamp: new Date().toLocaleTimeString()
        }];
      }

      const conversationData = await response.json();
      console.log('Loaded conversation data:', conversationData);

      const formattedMessages: Message[] = [];
      const rawMessages: RawMessage[] = Array.isArray(conversationData.messages)
        ? conversationData.messages
        : [];

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

      return formattedMessages;
    } catch (error) {
      console.error('Error loading conversation:', error);
      return [{
        id: 1,
        type: 'assistant',
        content: "Sorry, I encountered an error loading this conversation. Please try starting a new chat.",
        timestamp: new Date().toLocaleTimeString()
      }];
    }
  }, [currentUserId]);

  return { conversations, loadConversations, loadConversation };
};
