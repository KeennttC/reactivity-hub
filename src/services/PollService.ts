import { getDatabase, ref, push, onValue, remove, update, get } from 'firebase/database';
import { Poll, PollOption } from '../types/poll';

export class PollService {
  private db = getDatabase();

  async getPolls(): Promise<Poll[]> {
    const pollsRef = ref(this.db, 'polls');
    const snapshot = await get(pollsRef);
    if (snapshot.exists()) {
      const polls: Poll[] = [];
      snapshot.forEach((childSnapshot) => {
        polls.push({
          id: childSnapshot.key!,
          ...childSnapshot.val()
        });
      });
      return polls;
    }
    return [];
  }

  async addPoll(question: string, options: string[], userId: string): Promise<void> {
    const newPoll: Omit<Poll, 'id'> = {
      question,
      options: options.map((text, index) => ({ id: `${index}`, text, votes: 0 })),
      createdBy: userId,
      votedBy: [],
    };

    const pollsRef = ref(this.db, 'polls');
    await push(pollsRef, newPoll);
  }

  async editPoll(pollId: string, question: string, options: string[]): Promise<void> {
    const pollRef = ref(this.db, `polls/${pollId}`);
    const snapshot = await get(pollRef);

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

      await update(pollRef, updatedPoll);
    } else {
      throw new Error("Poll not found");
    }
  }

  async vote(pollId: string, optionId: string, userId: string): Promise<void> {
    const pollRef = ref(this.db, `polls/${pollId}`);
    const snapshot = await get(pollRef);

    if (snapshot.exists()) {
      const poll = snapshot.val();
      if (poll.votedBy && poll.votedBy.includes(userId)) {
        throw new Error("You have already voted on this poll.");
      }

      const updatedOptions = poll.options.map((option: PollOption) =>
        option.id === optionId ? { ...option, votes: option.votes + 1 } : option
      );

      const updatedPoll = {
        ...poll,
        options: updatedOptions,
        votedBy: [...(poll.votedBy || []), userId],
      };

      await update(pollRef, updatedPoll);
    } else {
      throw new Error("Poll not found");
    }
  }

  async removePoll(pollId: string): Promise<void> {
    const pollRef = ref(this.db, `polls/${pollId}`);
    await remove(pollRef);
  }
}
