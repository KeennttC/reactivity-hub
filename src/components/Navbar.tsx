import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';
import { Button } from "./ui/button";
import { useTheme } from '../contexts/ThemeContext';
import { Menu, Sun, Moon } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className={`bg-glassmorphism shadow-lg ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="container mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Logo />
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={toggleTheme}
              variant="ghost"
              size="icon"
              className="rounded-full"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full md:hidden"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="hidden md:flex items-center justify-end space-x-6 mt-4">
          {user ? (
            <>
              <Link to="/chat" className="text-blue-800 dark:text-blue-300 hover:text-blue-600 transition-colors duration-300 font-tech-noir text-lg">Chat</Link>
              <Link to="/poll" className="text-blue-800 dark:text-blue-300 hover:text-blue-600 transition-colors duration-300 font-tech-noir text-lg">Poll</Link>
              <Button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300 shadow-neon">Logout</Button>
            </>
          ) : (
            <Link to="/login" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300 shadow-neon">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;