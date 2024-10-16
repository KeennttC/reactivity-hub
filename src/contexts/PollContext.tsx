import React, { createContext, useState, useContext } from 'react';

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface PollContextType {
  pollOptions: PollOption[];
  vote: (optionId: string) => void;
}

const PollContext = createContext<PollContextType | undefined>(undefined);

export const PollProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pollOptions, setPollOptions] = useState<PollOption[]>([
    { id: '1', text: 'Option 1', votes: 0 },
    { id: '2', text: 'Option 2', votes: 0 },
    { id: '3', text: 'Option 3', votes: 0 },
  ]);

  const vote = (optionId: string) => {
    setPollOptions((prevOptions) =>
      prevOptions.map((option) =>
        option.id === optionId ? { ...option, votes: option.votes + 1 } : option
      )
    );
  };

  return (
    <PollContext.Provider value={{ pollOptions, vote }}>
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