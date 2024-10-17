import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 shadow-lg backdrop-blur-md bg-opacity-30">
      <div className="container mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Logo />
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-white font-vaporwave text-lg">Welcome, {user.username}</span>
                <Link to="/chat" className="text-white hover:text-cyan-300 transition-colors duration-300 font-vaporwave text-lg">Chat</Link>
                <Link to="/poll" className="text-white hover:text-cyan-300 transition-colors duration-300 font-vaporwave text-lg">Poll</Link>
                <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300 shadow-neon">Logout</button>
              </>
            ) : (
              <Link to="/login" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300 shadow-neon">Login</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;