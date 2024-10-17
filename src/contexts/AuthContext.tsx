import React, { createContext, useState, useContext, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, updateDoc } from 'firebase/firestore';

interface User {
  id: string;
  username: string;
  email: string;
  votedPolls: string[];
  uid: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  users: User[];
  register: (email: string, password: string, username: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userId: string, updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  users: [],
  register: async () => {},
  login: async () => {},
  logout: async () => {},
  updateProfile: async () => {},
});

// Initialize Firebase app
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          setUser(userData);
        }
      } else {
        setUser(null);
      }
    });

    // Fetch all users
    const fetchUsers = async () => {
      const usersCollection = collection(db, 'users');
      const userSnapshot = await getDocs(usersCollection);
      const userList = userSnapshot.docs.map(doc => doc.data() as User);
      setUsers(userList);
    };

    fetchUsers();

    return () => unsubscribe();
  }, []);

  const register = async (email: string, password: string, username: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser: User = {
        id: userCredential.user.uid,
        username: username,
        email: email,
        votedPolls: [],
        uid: userCredential.user.uid
      };
      await setDoc(doc(db, 'users', newUser.id), newUser);
      setUsers([...users, newUser]);
    } catch (error) {
      console.error('Error registering user:', error);
      throw new Error('Registration failed. Please try again.');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error logging in:', error);
      throw new Error('Login failed. Please check your credentials and try again.');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
      throw new Error('Logout failed. Please try again.');
    }
  };

  const updateProfile = async (userId: string, updates: Partial<User>) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, updates);
      if (user && user.id === userId) {
        setUser({ ...user, ...updates });
      }
      setUsers(users.map(u => u.id === userId ? { ...u, ...updates } : u));
    } catch (error) {
      console.error('Error updating profile:', error);
      throw new Error('Profile update failed. Please try again.');
    }
  };

  return (
    <AuthContext.Provider value={{ user, users, register, login, logout, updateProfile }}>
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
