import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from "../hooks/use-toast"
import { PollService } from '../services/PollService';
import { Poll, PollContextType } from '../types/poll';

const PollContext = createContext<PollContextType | undefined>(undefined);

export const PollProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const { toast } = useToast();
  const pollService = new PollService();

  useEffect(() => {
    const unsubscribe = pollService.subscribeToPolls((loadedPolls) => {
      setPolls(loadedPolls);
    });

    return () => unsubscribe();
  }, []);

  const addPoll = (question: string, options: string[]) => {
    pollService.addPoll(question, options)
      .then(() => {
        toast({
          title: "Success",
          description: "Poll created successfully",
        });
        // Update the polls state after adding a new poll
        setPolls(prevPolls => {
          const newPoll: Poll = {
            id: Date.now().toString(), // Temporary ID, will be replaced by Firebase
            question,
            options: options.map((text, index) => ({ id: index.toString(), text, votes: 0 })),
            createdBy: 'anonymous',
            votedBy: []
          };
          return [...prevPolls, newPoll];
        });
      })
      .catch((error) => {
        console.error("Error creating poll:", error);
        toast({
          title: "Error",
          description: "Failed to create poll. Please try again.",
          variant: "destructive",
        });
      });
  };

  const editPoll = (pollId: string, question: string, options: string[]) => {
    pollService.editPoll(pollId, question, options)
      .then(() => {
        toast({
          title: "Success",
          description: "Poll updated successfully",
        });
        // Update the polls state after editing
        setPolls(prevPolls => prevPolls.map(poll => 
          poll.id === pollId 
            ? { ...poll, question, options: options.map((text, index) => ({ id: index.toString(), text, votes: 0 })) }
            : poll
        ));
      })
      .catch((error) => {
        console.error("Error updating poll:", error);
        toast({
          title: "Error",
          description: "Failed to update poll. Please try again.",
          variant: "destructive",
        });
      });
  };

  const vote = (pollId: string, optionId: string) => {
    const userId = localStorage.getItem('userId') || Math.random().toString(36).substr(2, 9);
    if (!localStorage.getItem('userId')) {
      localStorage.setItem('userId', userId);
    }

    pollService.vote(pollId, optionId, userId)
      .then(() => {
        toast({
          title: "Success",
          description: "Vote recorded successfully",
        });
        setPolls(prevPolls => prevPolls.map(poll => 
          poll.id === pollId 
            ? {
                ...poll,
                options: poll.options.map(option => 
                  option.id === optionId ? { ...option, votes: option.votes + 1 } : option
                ),
                votedBy: [...poll.votedBy, userId]
              }
            : poll
        ));
      })
      .catch((error) => {
        console.error("Error voting:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to record vote. Please try again.",
          variant: "destructive",
        });
      });
  };

  const removePoll = (pollId: string) => {
    pollService.removePoll(pollId)
      .then(() => {
        toast({
          title: "Success",
          description: "Poll removed successfully",
        });
        // Update the polls state after removing
        setPolls(prevPolls => prevPolls.filter(poll => poll.id !== pollId));
      })
      .catch((error) => {
        console.error("Error removing poll:", error);
        toast({
          title: "Error",
          description: "Failed to remove poll. Please try again.",
          variant: "destructive",
        });
      });
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