import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { ScrollArea } from "../components/ui/scroll-area"
import { Trash2, Edit2, Smile, Reply, Check, CheckCheck } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import EmojiPicker from 'emoji-picker-react';

interface Message {
  id: string;
  user: string;
  text: string;
  timestamp: number;
  replyTo?: string;
  status: 'sent' | 'delivered' | 'seen';
}

const Chat: React.FC = () => {
  const [newMessage, setNewMessage] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const { user } = useAuth();
  const { messages, sendMessage, editMessage, deleteMessage, userStatus, setUserTyping, typingUsers } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { theme } = useTheme();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    if (messages.length > 0 && messages[messages.length - 1].user !== user?.username) {
      audioRef.current?.play();
    }
  }, [messages, user]);

  useEffect(() => {
    const handleTyping = () => {
      setUserTyping(true);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        setUserTyping(false);
      }, 2000);
    };

    if (newMessage) {
      handleTyping();
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [newMessage, setUserTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && user) {
      if (editingMessageId) {
        editMessage(editingMessageId, newMessage);
        setEditingMessageId(null);
      } else {
        sendMessage(newMessage, replyingTo);
        setReplyingTo(null);
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

  const handleReply = (messageId: string) => {
    setReplyingTo(messageId);
  };

  const handleEmojiClick = (emojiObject: any) => {
    setNewMessage(prev => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const renderMessageStatus = (status: 'sent' | 'delivered' | 'seen') => {
    switch (status) {
      case 'sent':
        return <Check className="h-4 w-4 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="h-4 w-4 text-gray-400" />;
      case 'seen':
        return <CheckCheck className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-2 sm:p-4 md:p-6 rounded-lg shadow-lg">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-4 md:mb-6 text-gray-800 dark:text-gray-200">Chat Room</h2>
      <ScrollArea className="h-[300px] sm:h-[350px] md:h-[400px] w-full rounded-md border border-gray-300 dark:border-gray-600 p-2 sm:p-4 mb-2 sm:mb-4">
        {messages.map((message: Message) => (
          <div key={message.id} className={`mb-2 sm:mb-4 ${message.user === user?.username ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-2 rounded-lg ${message.user === user?.username ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
              <p className="font-bold text-xs sm:text-sm">{message.user} 
                <span className={`ml-1 sm:ml-2 inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${userStatus[message.user] ? 'bg-green-500' : 'bg-gray-500'}`}></span>
              </p>
              {message.replyTo && (
                <div className="text-xs italic mb-1 opacity-75">
                  Replying to: {messages.find(m => m.id === message.replyTo)?.text.substring(0, 20)}...
                </div>
              )}
              <p className="text-xs sm:text-sm">{message.text}</p>
              <div className="flex justify-between items-center mt-1">
                <p className="text-xxs sm:text-xs">{new Date(message.timestamp).toLocaleTimeString()}</p>
                {message.user === user?.username && renderMessageStatus(message.status)}
              </div>
              <div className="mt-1 sm:mt-2 flex justify-end space-x-1 sm:space-x-2">
                {message.user === user?.username && (
                  <>
                    <Button onClick={() => handleEdit(message.id, message.text)} size="sm" variant="ghost" className="p-1">
                      <Edit2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button onClick={() => handleDelete(message.id)} size="sm" variant="ghost" className="p-1">
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </>
                )}
                {message.user !== user?.username && (
                  <Button onClick={() => handleReply(message.id)} size="sm" variant="ghost" className="p-1">
                    <Reply className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
        {typingUsers.length > 0 && (
          <div className="text-gray-500 dark:text-gray-400 italic text-xs sm:text-sm">
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </ScrollArea>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
        {replyingTo && (
          <div className="w-full text-xs sm:text-sm text-gray-500 flex items-center justify-between">
            <span>Replying to: {messages.find(m => m.id === replyingTo)?.text.substring(0, 20)}...</span>
            <Button onClick={() => setReplyingTo(null)} size="sm" variant="ghost" className="p-1">
              Cancel
            </Button>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-grow text-xs sm:text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600"
            placeholder="Type a message..."
          />
          <Button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} size="sm" className="p-2">
            <Smile size={16} />
          </Button>
          <Button type="submit" size="sm" className="bg-blue-500 hover:bg-blue-600 text-white p-2">
            {editingMessageId ? 'Update' : 'Send'}
          </Button>
        </div>
      </form>
      {showEmojiPicker && (
        <div className="absolute bottom-16 right-0 sm:right-auto z-10">
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}
      <audio ref={audioRef} src="/notification.mp3" />
    </div>
  );
};

export default Chat;