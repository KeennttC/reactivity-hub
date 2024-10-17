import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';
import { Button } from "./ui/button";
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon, Menu } from 'lucide-react';
import { scrollToBottom } from '../utils/scrollUtils';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleChatClick = () => {
    if (location.pathname === '/chat') {
      const scrollArea = document.querySelector('.scroll-area') as HTMLElement;
      scrollToBottom(scrollArea);
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg transition-colors duration-300">
      <div className="container mx-auto px-4 py-2 sm:py-3">
        <div className="flex justify-between items-center">
          <Logo />
          <div className="hidden sm:flex items-center space-x-4">
            <Button
              onClick={toggleTheme}
              variant="ghost"
              size="icon"
              className="rounded-full"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            {user ? (
              <>
                <Link to="/chat" onClick={handleChatClick} className="text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 font-tech-noir text-sm sm:text-base">Chat</Link>
                <Link to="/poll" className="text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 font-tech-noir text-sm sm:text-base">Poll</Link>
                <Link to="/members" className="text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 font-tech-noir text-sm sm:text-base">Members</Link>
                <Button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 sm:py-2 sm:px-4 rounded text-xs sm:text-sm transition-colors duration-300">Logout</Button>
              </>
            ) : (
              <Link to="/login" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 sm:py-2 sm:px-4 rounded text-xs sm:text-sm transition-colors duration-300">Login</Link>
            )}
          </div>
          <div className="sm:hidden">
            <Button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              variant="ghost"
              size="icon"
              className="rounded-full"
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="sm:hidden mt-2 space-y-2">
            <Button
              onClick={toggleTheme}
              variant="ghost"
              size="sm"
              className="w-full text-left"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
              Toggle Theme
            </Button>
            {user ? (
              <>
                <Link to="/chat" className="block py-1 text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 font-tech-noir text-sm">Chat</Link>
                <Link to="/poll" className="block py-1 text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 font-tech-noir text-sm">Poll</Link>
                <Link to="/members" className="block py-1 text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 font-tech-noir text-sm">Members</Link>
                <Button onClick={handleLogout} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded text-xs transition-colors duration-300">Logout</Button>
              </>
            ) : (
              <Link to="/login" className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded text-xs text-center transition-colors duration-300">Login</Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;