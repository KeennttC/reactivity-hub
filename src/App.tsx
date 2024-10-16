import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import { PollProvider } from './contexts/PollContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Chat from './pages/Chat';
import Poll from './pages/Poll';
import './App.css';

const queryClient = new QueryClient();

const UserList: React.FC = () => {
  const { users } = useAuth();

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Users</h3>
      <ul className="space-y-2">
        {users.map((user) => (
          <li key={user.id} className="text-gray-700 dark:text-gray-300">{user.username}</li>
        ))}
      </ul>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex">
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/poll" element={<Poll />} />
          </Routes>
        </div>
        {user && (
          <div className="w-64 ml-8">
            <UserList />
          </div>
        )}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ChatProvider>
          <PollProvider>
            <Router>
              <AppContent />
            </Router>
          </PollProvider>
        </ChatProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;