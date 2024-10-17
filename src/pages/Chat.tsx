import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { ScrollArea } from "../components/ui/scroll-area"
import { Trash2, Edit2, Smile } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import EmojiPicker from 'emoji-picker-react';

const Chat: React.FC = () => {
  const [newMessage, setNewMessage] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { user } = useAuth();
  const { messages, sendMessage, editMessage, deleteMessage, userStatus, setUserTyping, typingUsers } = useChat();
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

  const handleEmojiClick = (emojiObject: any) => {
    setNewMessage(prev => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className={`max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg ${theme === 'dark' ? 'dark' : ''}`}>
      <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200">Chat Room</h2>
      <ScrollArea className="h-[400px] w-full rounded-md border border-gray-300 dark:border-gray-600 p-4 mb-4">
        {messages.map((message) => (
          <div key={message.id} className={`mb-4 ${message.user === user?.username ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-3 rounded-lg ${message.user === user?.username ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
              <p className="font-bold">{message.user} 
                <span className={`ml-2 inline-block w-2 h-2 rounded-full ${userStatus[message.user] ? 'bg-green-500' : 'bg-gray-500'}`}></span>
              </p>
              <p>{message.text}</p>
              <p className="text-xs mt-1">{new Date(message.timestamp).toLocaleTimeString()}</p>
              {message.user === user?.username && (
                <div className="mt-2">
                  <Button onClick={() => handleEdit(message.id, message.text)} size="sm" variant="ghost" className="mr-2">
                    <Edit2 size={16} />
                  </Button>
                  <Button onClick={() => handleDelete(message.id)} size="sm" variant="ghost">
                    <Trash2 size={16} />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
        {typingUsers.length > 0 && (
          <div className="text-gray-500 dark:text-gray-400 italic">
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </ScrollArea>
      <form onSubmit={handleSubmit} className="flex items-center">
        <Input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-grow mr-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600"
          placeholder="Type a message..."
        />
        <Button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="mr-2">
          <Smile size={20} />
        </Button>
        <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white">
          {editingMessageId ? 'Update' : 'Send'}
        </Button>
      </form>
      {showEmojiPicker && (
        <div className="absolute bottom-16 right-0">
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}
      <audio ref={audioRef} src="/notification.mp3" />
    </div>
  );
};

export default Chat;