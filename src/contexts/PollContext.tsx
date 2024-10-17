import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getDatabase, ref, push, onValue, remove, update, get } from 'firebase/database';
import { getApp } from 'firebase/app';
import { useToast } from "../hooks/use-toast"

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
  votedBy: string[];
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
  const { toast } = useToast();

  useEffect(() => {
    const app = getApp();
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
      } else {
        setPolls([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const addPoll = (question: string, options: string[]) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a poll.",
        variant: "destructive",
      });
      return;
    }

    const newPoll: Poll = {
      id: Date.now().toString(),
      question,
      options: options.map((text, index) => ({ id: `${index}`, text, votes: 0 })),
      createdBy: user.uid,
      votedBy: [],
    };

    const db = getDatabase();
    const pollsRef = ref(db, 'polls');
    
    push(pollsRef, newPoll)
      .then(() => {
        toast({
          title: "Success",
          description: "Poll created successfully",
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
    const db = getDatabase();
    const pollRef = ref(db, `polls/${pollId}`);

    get(pollRef).then((snapshot) => {
      if (snapshot.exists()) {
        const existingPoll = snapshot.val();
        const updatedPoll = {
          ...existingPoll,
          question,
          options: options.map((text, index) => {
            const existingOption = existingPoll.options[index];
            return existingOption ? { ...existingOption, text } : { id: `${index}`, text, votes: 0 };
          }),
        };

        update(pollRef, updatedPoll)
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
      }
    });
  };

  const vote = (pollId: string, optionId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to vote.",
        variant: "destructive",
      });
      return;
    }

    const db = getDatabase();
    const pollRef = ref(db, `polls/${pollId}`);

    get(pollRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const poll = snapshot.val();
          if (poll.votedBy && poll.votedBy.includes(user.uid)) {
            toast({
              title: "Error",
              description: "You have already voted on this poll.",
              variant: "destructive",
            });
            return;
          }

          const updatedOptions = poll.options.map((option: PollOption) =>
            option.id === optionId ? { ...option, votes: option.votes + 1 } : option
          );

          const updatedPoll = {
            ...poll,
            options: updatedOptions,
            votedBy: [...(poll.votedBy || []), user.uid],
          };

          return update(pollRef, updatedPoll);
        } else {
          throw new Error("Poll not found");
        }
      })
      .then(() => {
        toast({
          title: "Success",
          description: "Vote recorded successfully",
        });
      })
      .catch((error) => {
        console.error("Error voting on poll:", error);
        toast({
          title: "Error",
          description: "Failed to record vote. Please try again.",
          variant: "destructive",
        });
      });
  };

  const removePoll = (pollId: string) => {
    const db = getDatabase();
    const pollRef = ref(db, `polls/${pollId}`);
    remove(pollRef)
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