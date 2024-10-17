import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { User } from 'lucide-react';

const UserList: React.FC = () => {
  const { user } = useAuth();
  const { userStatus } = useChat();

  return (
    <div className="w-64 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg mr-4">
      <h2 className="text-lg font-semibold mb-4">Users</h2>
      <ScrollArea className="h-[calc(100vh-200px)]">
        {Object.entries(userStatus).map(([username, status]) => (
          <div key={username} className="flex items-center mb-2">
            <User className="mr-2" />
            <span>{username}</span>
            <span className={`ml-auto w-3 h-3 rounded-full ${status ? 'bg-green-500' : 'bg-gray-400'}`}></span>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};

export default UserList;