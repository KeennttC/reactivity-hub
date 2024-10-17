import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getDatabase, ref, push, onValue, remove } from 'firebase/database';
import { getApp } from 'firebase/app';

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  createdBy: string;
}

interface PollContextType {
  polls: Poll[];
  addPoll: (question: string, options: string[]) => void;
  editPoll: (pollId: string, question: string, options: string[]) => void;
  vote: (pollId: string, optionId: string) => void;
  removePoll: (pollId: string) => void;
}

const PollContext = createContext<PollContextType | undefined>(undefined);

export const PollProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const app = getApp(); // Get the initialized Firebase app
    const db = getDatabase(app);
    const pollsRef = ref(db, 'polls');

    const unsubscribe = onValue(pollsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedPolls = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          ...value,
        }));
        setPolls(loadedPolls);
      }
    });

    return () => unsubscribe();
  }, []);

  const addPoll = (question: string, options: string[]) => {
    if (!user) return;

    const newPoll: Poll = {
      id: Date.now().toString(),
      question,
      options: options.map((text, index) => ({ id: `${index}`, text, votes: 0 })),
      createdBy: user.uid,
    };

    const updatedPolls = [...polls, newPoll];
    setPolls(updatedPolls);

    const db = getDatabase();
    const pollsRef = ref(db, 'polls');
    push(pollsRef, newPoll);
  };

  const editPoll = (pollId: string, question: string, options: string[]) => {
    const updatedPolls = polls.map(poll => {
      if (poll.id === pollId) {
        return {
          ...poll,
          question,
          options: options.map((text, index) => {
            const existingOption = poll.options[index];
            return existingOption ? { ...existingOption, text } : { id: `${index}`, text, votes: 0 };
          }),
        };
      }
      return poll;
    });

    setPolls(updatedPolls);

    const db = getDatabase();
    const pollRef = ref(db, `polls/${pollId}`);
    const updatedPoll = updatedPolls.find(p => p.id === pollId);
    if (updatedPoll) {
      push(pollRef, updatedPoll);
    }
  };

  const vote = (pollId: string, optionId: string) => {
    const updatedPolls = polls.map(poll => {
      if (poll.id === pollId) {
        return {
          ...poll,
          options: poll.options.map(option =>
            option.id === optionId ? { ...option, votes: option.votes + 1 } : option
          ),
        };
      }
      return poll;
    });

    setPolls(updatedPolls);

    const db = getDatabase();
    const pollRef = ref(db, `polls/${pollId}`);
    const updatedPoll = updatedPolls.find(p => p.id === pollId);
    if (updatedPoll) {
      push(pollRef, updatedPoll);
    }
  };

  const removePoll = (pollId: string) => {
    const updatedPolls = polls.filter(poll => poll.id !== pollId);
    setPolls(updatedPolls);

    const db = getDatabase();
    const pollRef = ref(db, `polls/${pollId}`);
    remove(pollRef);
  };

  return (
    <PollContext.Provider value={{ polls, addPoll, editPoll, vote, removePoll }}>
      {children}
    </PollContext.Provider>
  );
};

export const usePoll = () => {
  const context = useContext(PollContext);
  if (context === undefined) {
    throw new Error('usePoll must be used within a PollProvider');
  }
  return context;
};
