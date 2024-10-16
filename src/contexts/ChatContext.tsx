import React, { createContext, useState, useContext, useEffect } from 'react';

interface Message {
  id: string;
  user: string;
  text: string;
  timestamp: Date;
}

interface ChatContextType {
  messages: Message[];
  sendMessage: (text: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket('wss://echo.websocket.org');
    setSocket(ws);

    ws.onmessage = (event) => {
      try {
        const message: Message = JSON.parse(event.data);
        setMessages((prevMessages) => [...prevMessages, message]);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        console.log('Received data:', event.data);
        // Optionally, you can still add the message as plain text
        const plainTextMessage: Message = {
          id: Date.now().toString(),
          user: 'System',
          text: event.data,
          timestamp: new Date(),
        };
        setMessages((prevMessages) => [...prevMessages, plainTextMessage]);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const sendMessage = (text: string) => {
    if (socket) {
      const message: Message = {
        id: Date.now().toString(),
        user: 'User', // Replace with actual user
        text,
        timestamp: new Date(),
      };
      socket.send(JSON.stringify(message));
    }
  };

  return (
    <ChatContext.Provider value={{ messages, sendMessage }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};