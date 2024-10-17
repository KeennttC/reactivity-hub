import React, { useRef, useEffect } from 'react';
import { Message } from '../contexts/ChatContext';
import { scrollToBottom } from '../utils/scrollUtils';
import MessageItem from './MessageItem';

interface MessageListProps {
  messages: Message[];
  user: any;
  handleEdit: (messageId: string, text: string) => void;
  handleDelete: (messageId: string) => void;
  handleReply: (messageId: string) => void;
  handleReaction: (messageId: string, emoji: string) => void;
  typingUsers: string[];
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  user,
  handleEdit,
  handleDelete,
  handleReply,
  handleReaction,
  typingUsers,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].user !== user?.username) {
      scrollToBottom(messagesEndRef.current);
    }
  }, [messages, user]);

  return (
    <div className="h-[350px] sm:h-[400px] md:h-[450px] overflow-y-auto">
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          user={user}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          handleReply={handleReply}
          handleReaction={handleReaction}
        />
      ))}
      {typingUsers.length > 0 && (
        <div className="text-gray-500 dark:text-gray-400 italic text-xs sm:text-sm">
          {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;