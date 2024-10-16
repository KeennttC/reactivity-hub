import React, { createContext, useState, useContext } from 'react';

interface User {
  id: string;
  username: string;
  votedPolls: string[];
}

interface AuthContextType {
  user: User | null;
  users: User[];
  register: (username: string, password: string) => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  const register = async (username: string, password: string) => {
    // Mock registration - replace with actual API call
    if (users.some(u => u.username === username)) {
      throw new Error('Username already exists');
    }
    const newUser: User = { id: Date.now().toString(), username, votedPolls: [] };
    setUsers([...users, newUser]);
  };

  const login = async (username: string, password: string) => {
    // Mock login - replace with actual API call
    const foundUser = users.find(u => u.username === username);
    if (foundUser) {
      setUser(foundUser);
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, users, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};