import React from 'react';
import { Button } from "./ui/button";
import { Trash2, Edit2, Reply, Check, CheckCheck } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import EmojiPicker from 'emoji-picker-react';
import { useChat } from '../contexts/ChatContext';

interface Message {
  id: string;
  user: string;
  text: string;
  timestamp: number;
  replyTo?: string;
  status: 'sent' | 'delivered' | 'seen';
  reactions: { emoji: string; user: string }[];
}

interface MessageListProps {
  messages: Message[];
  user: any;
  handleDelete: (messageId: string) => void;
  setReplyingTo: (messageId: string | null) => void;
}

const MessageList: React.FC<MessageListProps> = ({ messages, user, handleDelete, setReplyingTo }) => {
  const { addReaction } = useChat();

  const renderMessageStatus = (status: 'sent' | 'delivered' | 'seen') => {
    switch (status) {
      case 'sent':
        return <Check className="h-3 w-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-gray-400" />;
      case 'seen':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
    }
  };

  return (
    <>
      {messages.map((message: Message) => (
        <div key={message.id} className={`mb-3 sm:mb-4 ${message.user === user?.username ? 'text-right' : 'text-left'}`}>
          <div className={`inline-block max-w-[80%] sm:max-w-[70%] p-2 sm:p-3 rounded-lg ${message.user === user?.username ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
            <p className="font-bold text-xs sm:text-sm mb-1">{message.user}</p>
            {message.replyTo && (
              <div className="text-xs italic mb-1 opacity-75">
                Replying to: {messages.find(m => m.id === message.replyTo)?.text.substring(0, 20)}...
              </div>
            )}
            <p className="text-sm sm:text-base">{message.text}</p>
            <div className="flex justify-between items-center mt-1">
              <p className="text-[10px] sm:text-xs opacity-70">{new Date(message.timestamp).toLocaleTimeString()}</p>
              {message.user === user?.username && renderMessageStatus(message.status)}
            </div>
            <div className="mt-1 sm:mt-2 flex justify-end space-x-1 sm:space-x-2">
              {message.user === user?.username && (
                <>
                  <Button onClick={() => handleDelete(message.id)} size="sm" variant="ghost" className="p-1">
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </>
              )}
              {message.user !== user?.username && (
                <Button onClick={() => setReplyingTo(message.id)} size="sm" variant="ghost" className="p-1">
                  <Reply className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              )}
              <Popover>
                <PopoverTrigger asChild>
                  <Button size="sm" variant="ghost" className="p-1">
                    <Edit2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <EmojiPicker
                    onEmojiClick={(emojiObject) => addReaction(message.id, emojiObject.emoji)}
                  />
                </PopoverContent>
              </Popover>
            </div>
            {message.reactions.length > 0 && (
              <div className="mt-1 flex flex-wrap">
                {message.reactions.map((reaction, index) => (
                  <span key={index} className="mr-1 mb-1 text-sm">{reaction.emoji}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </>
  );
};

export default MessageList;