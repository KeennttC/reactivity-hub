import React, { useState } from 'react';
import { useChat } from '../contexts/ChatContext';

const Chat: React.FC = () => {
  const { messages, sendMessage } = useChat();
  const [newMessage, setNewMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage(newMessage);
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