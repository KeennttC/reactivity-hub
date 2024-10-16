import React, { createContext, useState, useContext, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, onChildAdded, onChildChanged, onChildRemoved, set, remove, get, DataSnapshot, onValue } from 'firebase/database';
import { useAuth } from './AuthContext';

interface Reaction {
  emoji: string;
  user: string;
}

interface Message {
  id: string;
  user: string;
  text: string;
  timestamp: number;
  replyTo?: string;
  status: 'sent' | 'delivered' | 'seen';
  reactions: Reaction[];
}

interface ChatContextType {
  messages: Message[];
  sendMessage: (text: string, replyTo?: string | null) => void;
  editMessage: (id: string, newText: string) => void;
  deleteMessage: (id: string) => void;
  userStatus: { [key: string]: boolean };
  setUserTyping: (isTyping: boolean) => void;
  typingUsers: string[];
  addReaction: (messageId: string, emoji: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userStatus, setUserStatus] = useState<{ [key: string]: boolean }>({});
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const { user, users } = useAuth();

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
    const typingRef = ref(database, 'typing');

    const unsubscribeMessages = onChildAdded(messagesRef, (snapshot: DataSnapshot) => {
      const data = snapshot.val();
      const message: Message = {
        id: snapshot.key || '',
        user: data.user,
        text: data.text,
        timestamp: data.timestamp,
        replyTo: data.replyTo,
        status: data.status || 'sent',
        reactions: data.reactions || []
      };
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    const unsubscribeMessageChanges = onChildChanged(messagesRef, (snapshot: DataSnapshot) => {
      const data = snapshot.val();
      const updatedMessage: Message = {
        id: snapshot.key || '',
        user: data.user,
        text: data.text,
        timestamp: data.timestamp,
        replyTo: data.replyTo,
        status: data.status || 'sent',
        reactions: data.reactions || []
      };
      setMessages((prevMessages) => prevMessages.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg));
    });

    const unsubscribeMessageRemovals = onChildRemoved(messagesRef, (snapshot: DataSnapshot) => {
      setMessages((prevMessages) => prevMessages.filter(msg => msg.id !== snapshot.key));
    });

    const typingListener = onChildChanged(typingRef, (snapshot: DataSnapshot) => {
      const username = snapshot.key;
      const isTyping = snapshot.val();
      if (isTyping && username && !typingUsers.includes(username)) {
        setTypingUsers(prev => [...prev, username]);
      } else if (!isTyping && username) {
        setTypingUsers(prev => prev.filter(user => user !== username));
      }
    });

    const userStatusListener = onValue(userStatusRef, (snapshot: DataSnapshot) => {
      const statusData = snapshot.val();
      setUserStatus(statusData || {});
    });

    return () => {
      unsubscribeMessages();
      unsubscribeMessageChanges();
      unsubscribeMessageRemovals();
      typingListener();
      userStatusListener();
    };
  }, [user, users]);

  const sendMessage = (text: string, replyTo: string | null = null) => {
    if (user) {
      const database = getDatabase();
      const messagesRef = ref(database, 'messages');
      push(messagesRef, {
        user: user.username,
        text: text,
        timestamp: Date.now(),
        replyTo: replyTo,
        status: 'sent',
        reactions: []
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
        timestamp: Date.now(),
        status: 'sent',
        reactions: []
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
      const typingRef = ref(database, `typing/${user.username}`);
      set(typingRef, isTyping);
    }
  };

  const addReaction = (messageId: string, emoji: string) => {
    if (user) {
      const database = getDatabase();
      const messageRef = ref(database, `messages/${messageId}`);
      const newReaction: Reaction = { emoji, user: user.username };
      
      get(messageRef).then((snapshot) => {
        if (snapshot.exists()) {
          const messageData = snapshot.val();
          const reactions = messageData.reactions || [];
          
          const existingReactionIndex = reactions.findIndex(
            (r: Reaction) => r.user === user.username && r.emoji === emoji
          );
          
          if (existingReactionIndex !== -1) {
            reactions.splice(existingReactionIndex, 1);
          } else {
            reactions.push(newReaction);
          }
          
          set(messageRef, { ...messageData, reactions });
        }
      });
    }
  };

  return (
    <ChatContext.Provider value={{ messages, sendMessage, editMessage, deleteMessage, userStatus, setUserTyping, typingUsers, addReaction }}>
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
