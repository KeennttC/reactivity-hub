import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Smile } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import EmojiPicker from 'emoji-picker-react';
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { useToast } from "../hooks/use-toast";
import MessageList from '../components/MessageList';

const Chat: React.FC = () => {
  const [newMessage, setNewMessage] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const { user } = useAuth();
  const { messages, sendMessage, editMessage, deleteMessage, userStatus, setUserTyping, typingUsers, addReaction } = useChat();
  const audioRef = useRef<HTMLAudioElement>(null);
  const { theme } = useTheme();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].user !== user?.username) {
      audioRef.current?.play();
      toast({
        title: "New Message",
        description: `${messages[messages.length - 1].user} sent a message`,
      });
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

  const handleReaction = (messageId: string, emoji: string) => {
    addReaction(messageId, emoji);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-2 sm:p-4 md:p-6 rounded-lg shadow-lg">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-4 md:mb-6 text-gray-800 dark:text-gray-200">Chat Room</h2>
      <ScrollArea className="h-[350px] sm:h-[400px] md:h-[450px] w-full rounded-md border border-gray-300 dark:border-gray-600 p-2 sm:p-4 mb-2 sm:mb-4">
        <MessageList
          messages={messages}
          user={user}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          handleReply={handleReply}
          handleReaction={handleReaction}
          typingUsers={typingUsers}
        />
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
            className="flex-grow text-sm sm:text-base bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600"
            placeholder="Type a message..."
          />
          <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
            <PopoverTrigger asChild>
              <Button type="button" size="sm" className="p-2">
                <Smile size={16} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </PopoverContent>
          </Popover>
          <Button type="submit" size="sm" className="bg-blue-500 hover:bg-blue-600 text-white p-2">
            {editingMessageId ? 'Update' : 'Send'}
          </Button>
        </div>
      </form>
      <audio ref={audioRef} src="/notification.mp3" />
    </div>
  );
};

export default Chat;