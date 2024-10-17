export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  createdBy: string;
  votedBy: string[];
}

export interface PollContextType {
  polls: Poll[];
  addPoll: (question: string, options: string[]) => void;
  editPoll: (pollId: string, question: string, options: string[]) => void;
  vote: (pollId: string, optionId: string) => void;
  removePoll: (pollId: string) => void;
}