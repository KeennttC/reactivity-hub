import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';
import { Button } from "./ui/button";
import { useTheme } from '../contexts/ThemeContext';

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
          <div className="flex items-center space-x-6">
            {user ? (
              <>
                <Link to="/chat" className="text-blue-800 hover:text-blue-600 transition-colors duration-300 font-tech-noir text-lg">Chat</Link>
                <Link to="/poll" className="text-blue-800 hover:text-blue-600 transition-colors duration-300 font-tech-noir text-lg">Poll</Link>
                <Button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300 shadow-neon">Logout</Button>
              </>
            ) : (
              <Link to="/login" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300 shadow-neon">Login</Link>
            )}
            <Button onClick={toggleTheme} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300">
              {theme === 'dark' ? '☀️' : '🌙'}
            </Button>
          </div>
        </div>
        {user && (
          <div className="mt-4 text-center">
            <span className="text-blue-800 font-tech-noir text-lg">Welcome, {user.username}</span>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;