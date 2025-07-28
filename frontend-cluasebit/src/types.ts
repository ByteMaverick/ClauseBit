// types.ts
export interface Message {
  id: number;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  title: string;
  time: string;
  session_id: string;
  message_count: number;
}

export interface RawMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string | number | { _seconds: number };
}