import React, { createContext, useState, useContext, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, onChildAdded, onChildChanged, onChildRemoved, set, remove, DataSnapshot } from 'firebase/database';
import { useAuth } from './AuthContext';

interface Message {
  id: string;
  user: string;
  text: string;
  timestamp: number;
}

interface ChatContextType {
  messages: Message[];
  sendMessage: (text: string) => void;
  editMessage: (id: string, newText: string) => void;
  deleteMessage: (id: string) => void;
  userStatus: { [key: string]: boolean };
  setUserTyping: (isTyping: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userStatus, setUserStatus] = useState<{ [key: string]: boolean }>({});
  const { user } = useAuth();

  useEffect(() => {
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
    const database = getDatabase(app);
    const messagesRef = ref(database, 'messages');
    const userStatusRef = ref(database, 'userStatus');

    const unsubscribeMessages = onChildAdded(messagesRef, (snapshot: DataSnapshot) => {
      const data = snapshot.val();
      const message: Message = {
        id: snapshot.key || '',
        user: data.user,
        text: data.text,
        timestamp: data.timestamp
      };
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    const unsubscribeMessageChanges = onChildChanged(messagesRef, (snapshot: DataSnapshot) => {
      const data = snapshot.val();
      const updatedMessage: Message = {
        id: snapshot.key || '',
        user: data.user,
        text: data.text,
        timestamp: data.timestamp
      };
      setMessages((prevMessages) => prevMessages.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg));
    });

    const unsubscribeMessageRemovals = onChildRemoved(messagesRef, (snapshot: DataSnapshot) => {
      setMessages((prevMessages) => prevMessages.filter(msg => msg.id !== snapshot.key));
    });

    const unsubscribeUserStatus = onChildChanged(userStatusRef, (snapshot: DataSnapshot) => {
      const data = snapshot.val();
      setUserStatus(prevStatus => ({ ...prevStatus, [snapshot.key || '']: data.online }));
    });

    // Set user status to online when component mounts
    if (user) {
      set(ref(database, `userStatus/${user.username}`), { online: true });
    }

    return () => {
      unsubscribeMessages();
      unsubscribeMessageChanges();
      unsubscribeMessageRemovals();
      unsubscribeUserStatus();
      // Set user status to offline when component unmounts
      if (user) {
        set(ref(database, `userStatus/${user.username}`), { online: false });
      }
    };
  }, [user]);

  const sendMessage = (text: string) => {
    if (user) {
      const database = getDatabase();
      const messagesRef = ref(database, 'messages');
      push(messagesRef, {
        user: user.username,
        text: text,
        timestamp: Date.now()
      });
    }
  };

  const editMessage = (id: string, newText: string) => {
    if (user) {
      const database = getDatabase();
      const messageRef = ref(database, `messages/${id}`);
      set(messageRef, {
        user: user.username,
        text: newText,
        timestamp: Date.now()
      });
    }
  };

  const deleteMessage = (id: string) => {
    if (user) {
      const database = getDatabase();
      const messageRef = ref(database, `messages/${id}`);
      remove(messageRef);
    }
  };

  const setUserTyping = (isTyping: boolean) => {
    if (user) {
      const database = getDatabase();
      const userTypingRef = ref(database, `userTyping/${user.username}`);
      set(userTypingRef, { isTyping });
    }
  };

  return (
    <ChatContext.Provider value={{ messages, sendMessage, editMessage, deleteMessage, userStatus, setUserTyping }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};