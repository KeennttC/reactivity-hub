import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { ScrollArea } from "../components/ui/scroll-area"

const Chat: React.FC = () => {
  const [newMessage, setNewMessage] = useState('');
  const { user } = useAuth();
  const { messages, sendMessage } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && user) {
      sendMessage(newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-glassmorphism p-6 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-cyan-300">Chat Room</h2>
      <ScrollArea className="h-[400px] w-full rounded-md border border-cyan-300 p-4 mb-4">
        {messages.map((message) => (
          <div key={message.id} className={`mb-4 ${message.user === user?.username ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-3 rounded-lg ${message.user === user?.username ? 'bg-cyan-800' : 'bg-gray-700'}`}>
              <p className="font-bold text-cyan-300">{message.user}</p>
              <p className="text-white">{message.text}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(message.timestamp).toLocaleTimeString()}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </ScrollArea>
      <form onSubmit={handleSubmit} className="flex">
        <Input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-grow mr-2 bg-gray-700 text-white border-cyan-300"
          placeholder="Type a message..."
        />
        <Button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-white">
          Send
        </Button>
      </form>
    </div>
  );
};

export default Chat;