import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Trash2, Edit2, Smile, Reply, Check, CheckCheck } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import EmojiPicker from 'emoji-picker-react';
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';

const Chat: React.FC = () => {
  const { user } = useAuth();
  const { messages, deleteMessage } = useChat();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].user !== user?.username) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, user]);

  const handleDelete = (messageId: string) => {
    const scrollArea = scrollAreaRef.current;
    const scrollPosition = scrollArea ? scrollArea.scrollTop : 0;
    
    deleteMessage(messageId);
    
    // Restore scroll position after state update
    setTimeout(() => {
      if (scrollArea) {
        scrollArea.scrollTop = scrollPosition;
      }
    }, 0);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-2 sm:p-4 md:p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200">Chat Room</h2>
      </div>
      <ScrollArea ref={scrollAreaRef} className="h-[350px] sm:h-[400px] md:h-[450px] w-full rounded-md border border-gray-300 dark:border-gray-600 p-2 sm:p-4 mb-2 sm:mb-4">
        <MessageList 
          messages={messages} 
          user={user} 
          handleDelete={handleDelete}
          setReplyingTo={setReplyingTo}
        />
        <div ref={messagesEndRef} />
      </ScrollArea>
      <MessageInput 
        replyingTo={replyingTo}
        setReplyingTo={setReplyingTo}
        showEmojiPicker={showEmojiPicker}
        setShowEmojiPicker={setShowEmojiPicker}
      />
    </div>
  );
};

export default Chat;