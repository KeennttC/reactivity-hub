import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import { ScrollArea } from "./ui/scroll-area";
import { User, Menu } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const UserSidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { userStatus } = useChat();
  const { theme } = useTheme();
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-gray-200 dark:bg-gray-700 rounded-md"
        aria-label="Toggle user sidebar"
      >
        <Menu size={24} />
      </button>
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 p-4 shadow-lg transform transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Users</h2>
        <ScrollArea className="h-[calc(100vh-100px)]">
          {Object.entries(userStatus).map(([username, status]) => (
            <div key={username} className="flex items-center mb-2 text-gray-800 dark:text-gray-200">
              <User className="mr-2" size={18} />
              <span>{username}</span>
              <span className={`ml-auto w-3 h-3 rounded-full ${status ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            </div>
          ))}
        </ScrollArea>
      </div>
    </>
  );
};

export default UserSidebar;