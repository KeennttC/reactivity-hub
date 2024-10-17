import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import { PollProvider } from './contexts/PollContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Chat from './pages/Chat';
import Poll from './pages/Poll';
import UserSidebar from './components/UserSidebar';
import './App.css';

const queryClient = new QueryClient();

const AppContent: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
      <Navbar />
      <UserSidebar />
      <div className="container mx-auto px-4 py-8 ml-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/poll" element={<Poll />} />
        </Routes>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <ThemeProvider>
            <ChatProvider>
              <PollProvider>
                <AppContent />
              </PollProvider>
            </ChatProvider>
          </ThemeProvider>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;