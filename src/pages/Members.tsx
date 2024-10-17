import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ScrollArea } from "../components/ui/scroll-area";
import { User } from 'lucide-react';

const Members: React.FC = () => {
  const { users } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <div className="text-center">Loading members...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-800 dark:text-gray-200">Members</h2>
      <ScrollArea className="h-[350px] sm:h-[400px] w-full rounded-md border border-gray-300 dark:border-gray-600 p-2 sm:p-4">
        {users.map((user) => (
          <div key={user.id} className="flex items-center mb-2 text-gray-800 dark:text-gray-200">
            <User className="mr-2" size={18} />
            <span>{user.username}</span>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};

export default Members;