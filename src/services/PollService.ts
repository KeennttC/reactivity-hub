import { getDatabase, ref, push, onValue, remove, update, get } from 'firebase/database';
import { Poll, PollOption } from '../types/poll';

export class PollService {
  private db = getDatabase();

  subscribeToPolls(callback: (polls: Poll[]) => void) {
    const pollsRef = ref(this.db, 'polls');
    return onValue(pollsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedPolls = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          ...value,
        }));
        callback(loadedPolls);
      } else {
        callback([]);
      }
    });
  }

  async addPoll(question: string, options: string[]): Promise<void> {
    const newPoll: Omit<Poll, 'id'> = {
      question,
      options: options.map((text, index) => ({ id: `${index}`, text, votes: 0 })),
      createdBy: 'anonymous',
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

  async vote(pollId: string, optionId: string): Promise<void> {
    const pollRef = ref(this.db, `polls/${pollId}`);
    const snapshot = await get(pollRef);

    if (snapshot.exists()) {
      const poll = snapshot.val();

      const updatedOptions = poll.options.map((option: PollOption) =>
        option.id === optionId ? { ...option, votes: option.votes + 1 } : option
      );

      const updatedPoll = {
        ...poll,
        options: updatedOptions,
        votedBy: [...(poll.votedBy || []), 'anonymous'],
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