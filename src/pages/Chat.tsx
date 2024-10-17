import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { ScrollArea } from "../components/ui/scroll-area"
import { Trash2, Edit2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Chat: React.FC = () => {
  const [newMessage, setNewMessage] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const { user } = useAuth();
  const { messages, sendMessage, editMessage, deleteMessage, userStatus, setUserTyping } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    if (messages.length > 0 && messages[messages.length - 1].user !== user?.username) {
      audioRef.current?.play();
    }
  }, [messages, user]);

  useEffect(() => {
    let typingTimer: NodeJS.Timeout;
    if (newMessage) {
      setUserTyping(true);
      typingTimer = setTimeout(() => setUserTyping(false), 1000);
    }
    return () => clearTimeout(typingTimer);
  }, [newMessage, setUserTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && user) {
      if (editingMessageId) {
        editMessage(editingMessageId, newMessage);
        setEditingMessageId(null);
      } else {
        sendMessage(newMessage);
      }
      setNewMessage('');
    }
  };

  const handleEdit = (messageId: string, text: string) => {
    setEditingMessageId(messageId);
    setNewMessage(text);
  };

  const handleDelete = (messageId: string) => {
    deleteMessage(messageId);
  };

  return (
    <div className={`max-w-2xl mx-auto bg-glassmorphism p-6 rounded-lg shadow-lg ${theme === 'dark' ? 'dark' : ''}`}>
      <h2 className="text-3xl font-bold mb-6 text-blue-800 dark:text-blue-300">Chat Room</h2>
      <ScrollArea className="h-[400px] w-full rounded-md border border-blue-300 dark:border-blue-700 p-4 mb-4">
        {messages.map((message) => (
          <div key={message.id} className={`mb-4 ${message.user === user?.username ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-3 rounded-lg ${message.user === user?.username ? 'bg-blue-800 dark:bg-blue-700' : 'bg-gray-700 dark:bg-gray-600'}`}>
              <p className="font-bold text-blue-300 dark:text-blue-200">{message.user} 
                <span className={`ml-2 inline-block w-2 h-2 rounded-full ${userStatus[message.user] ? 'bg-green-500' : 'bg-gray-500'}`}></span>
              </p>
              <p className="text-blue-100 dark:text-blue-50">{message.text}</p>
              <p className="text-xs text-blue-400 dark:text-blue-300 mt-1">{new Date(message.timestamp).toLocaleTimeString()}</p>
              {message.user === user?.username && (
                <div className="mt-2">
                  <Button onClick={() => handleEdit(message.id, message.text)} size="sm" variant="ghost" className="mr-2 text-blue-300 dark:text-blue-200">
                    <Edit2 size={16} />
                  </Button>
                  <Button onClick={() => handleDelete(message.id)} size="sm" variant="ghost" className="text-blue-300 dark:text-blue-200">
                    <Trash2 size={16} />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="text-blue-400 dark:text-blue-300 italic">Someone is typing...</div>
        )}
        <div ref={messagesEndRef} />
      </ScrollArea>
      <form onSubmit={handleSubmit} className="flex">
        <Input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-grow mr-2 bg-gray-700 dark:bg-gray-800 text-blue-100 dark:text-blue-50 border-blue-300 dark:border-blue-700"
          placeholder="Type a message..."
        />
        <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white">
          {editingMessageId ? 'Update' : 'Send'}
        </Button>
      </form>
      <audio ref={audioRef} src="/notification.mp3" />
    </div>
  );
};

export default Chat;
