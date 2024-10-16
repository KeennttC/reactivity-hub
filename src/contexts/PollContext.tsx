import React, { createContext, useState, useContext } from 'react';
import { useAuth } from './AuthContext';

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
}

interface PollContextType {
  polls: Poll[];
  addPoll: (question: string, options: string[]) => void;
  editPoll: (pollId: string, question: string, options: string[]) => void;
  vote: (pollId: string, optionId: string) => void;
}

const PollContext = createContext<PollContextType | undefined>(undefined);

export const PollProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const { user, users } = useAuth();

  const addPoll = (question: string, options: string[]) => {
    const newPoll: Poll = {
      id: Date.now().toString(),
      question,
      options: options.map((text, index) => ({ id: `${index}`, text, votes: 0 })),
    };
    setPolls([...polls, newPoll]);
  };

  const editPoll = (pollId: string, question: string, options: string[]) => {
    setPolls(polls.map(poll => {
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
    }));
  };

  const vote = (pollId: string, optionId: string) => {
    if (!user) return;
    
    setPolls(polls.map(poll => {
      if (poll.id === pollId && !user.votedPolls.includes(pollId)) {
        return {
          ...poll,
          options: poll.options.map(option =>
            option.id === optionId ? { ...option, votes: option.votes + 1 } : option
          ),
        };
      }
      return poll;
    }));

    // Update user's voted polls
    user.votedPolls.push(pollId);
  };

  return (
    <PollContext.Provider value={{ polls, addPoll, editPoll, vote }}>
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