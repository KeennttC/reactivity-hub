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
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Chat Room</h2>
      <ScrollArea className="h-[400px] w-full rounded-md border p-4">
        {messages.map((message) => (
          <div key={message.id} className="mb-2">
            <span className="font-bold">{message.user}: </span>
            <span>{message.text}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </ScrollArea>
      <form onSubmit={handleSubmit} className="mt-4 flex">
        <Input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-grow"
          placeholder="Type a message..."
        />
        <Button type="submit" className="ml-2">
          Send
        </Button>
      </form>
    </div>
  );
};

export default Chat;