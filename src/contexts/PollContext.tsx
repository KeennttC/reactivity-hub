import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from "../hooks/use-toast"
import { PollService } from '../services/PollService';
import { Poll, PollContextType } from '../types/poll';

const PollContext = createContext<PollContextType | undefined>(undefined);

export const PollProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();
  const pollService = new PollService();

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const loadedPolls = await pollService.getPolls();
        setPolls(loadedPolls);
      } catch (error) {
        console.error("Error fetching polls:", error);
        toast({
          title: "Error",
          description: "Failed to fetch polls. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchPolls();
  }, []);

  const addPoll = async (question: string, options: string[]) => {
    if (!user || !user.uid) {
      toast({
        title: "Error",
        description: "You must be logged in to create a poll.",
        variant: "destructive",
      });
      return;
    }

    try {
      const newPoll = await pollService.addPoll(question, options, user.uid);
      setPolls(prevPolls => [...prevPolls, newPoll]);
      toast({
        title: "Success",
        description: "Poll created successfully",
      });
    } catch (error) {
      console.error("Error creating poll:", error);
      toast({
        title: "Error",
        description: "Failed to create poll. Please try again.",
        variant: "destructive",
      });
    }
  };

  const editPoll = (pollId: string, question: string, options: string[]) => {
    pollService.editPoll(pollId, question, options)
      .then(() => {
        toast({
          title: "Success",
          description: "Poll updated successfully",
        });
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
    if (!user || !user.uid) {
      toast({
        title: "Error",
        description: "You must be logged in to vote.",
        variant: "destructive",
      });
      return;
    }

    pollService.vote(pollId, optionId, user.uid)
      .then(() => {
        toast({
          title: "Success",
          description: "Vote recorded successfully",
        });
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
