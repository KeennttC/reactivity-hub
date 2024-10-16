import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getDatabase, ref, push, onChildAdded, DataSnapshot } from 'firebase/database';

interface Message {
  id: string;
  user: string;
  text: string;
  timestamp: number;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const db = getDatabase();
    const messagesRef = ref(db, 'messages');

    const unsubscribe = onChildAdded(messagesRef, (snapshot: DataSnapshot) => {
      const data = snapshot.val();
      const message: Message = {
        id: snapshot.key || '',
        user: data.user,
        text: data.text,
        timestamp: data.timestamp
      };
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && user) {
      const db = getDatabase();
      const messagesRef = ref(db, 'messages');
      push(messagesRef, {
        user: user.username,
        text: newMessage,
        timestamp: Date.now()
      });
      setNewMessage('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Chat Room</h2>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-4 h-96 overflow-y-auto">
        {messages.map((message) => (
          <div key={message.id} className="mb-2">
            <span className="font-bold">{message.user}: </span>
            <span>{message.text}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-grow px-3 py-2 border rounded-l"
          placeholder="Type a message..."
        />
        <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-r">
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;