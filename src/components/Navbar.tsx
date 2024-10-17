import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';
import { Button } from "./ui/button";
import { useTheme } from '../contexts/ThemeContext';
import { Menu, Sun, Moon, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className={`bg-glassmorphism shadow-lg ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="container mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Button
              onClick={toggleMenu}
              variant="ghost"
              size="icon"
              className="rounded-full md:hidden"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <Button
              onClick={toggleTheme}
              variant="ghost"
              size="icon"
              className="rounded-full"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
          <Logo />
          <div className="hidden md:flex items-center space-x-6">
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
        {isMenuOpen && (
          <div className="md:hidden mt-4">
            {user ? (
              <>
                <Link to="/chat" className="block text-blue-800 dark:text-blue-300 hover:text-blue-600 transition-colors duration-300 font-tech-noir text-lg py-2">Chat</Link>
                <Link to="/poll" className="block text-blue-800 dark:text-blue-300 hover:text-blue-600 transition-colors duration-300 font-tech-noir text-lg py-2">Poll</Link>
                <Button onClick={handleLogout} className="w-full mt-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300 shadow-neon">Logout</Button>
              </>
            ) : (
              <Link to="/login" className="block w-full text-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300 shadow-neon">Login</Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;