import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to MyApp</h1>
      {user ? (
        <p className="text-xl">Hello, {user.username}! Explore our Chat and Poll features.</p>
      ) : (
        <p className="text-xl">Please log in to access all features.</p>
      )}
    </div>
  );
};

export default Home;