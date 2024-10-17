import React, { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Smile } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { useChat } from '../contexts/ChatContext';

interface MessageInputProps {
  replyingTo: string | null;
  setReplyingTo: (messageId: string | null) => void;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (show: boolean) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ replyingTo, setReplyingTo, showEmojiPicker, setShowEmojiPicker }) => {
  const [newMessage, setNewMessage] = useState('');
  const { sendMessage, messages } = useChat();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage(newMessage, replyingTo);
      setNewMessage('');
      setReplyingTo(null);
    }
  };

  const handleEmojiClick = (emojiObject: any) => {
    setNewMessage(prev => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  return (
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
        <Button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} size="sm" className="p-2">
          <Smile size={16} />
        </Button>
        <Button type="submit" size="sm" className="bg-blue-500 hover:bg-blue-600 text-white p-2">
          Send
        </Button>
      </div>
      {showEmojiPicker && (
        <div className="absolute bottom-16 right-0 sm:right-auto z-10">
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}
    </form>
  );
};

export default MessageInput;