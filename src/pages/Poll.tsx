import React from 'react';
import { usePoll } from '../contexts/PollContext';

const Poll: React.FC = () => {
  const { pollOptions, vote } = usePoll();

  const totalVotes = pollOptions.reduce((sum, option) => sum + option.votes, 0);

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Live Poll</h2>
      <div className="space-y-4">
        {pollOptions.map((option) => (
          <div key={option.id} className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span>{option.text}</span>
              <button
                onClick={() => vote(option.id)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded text-sm"
              >
                Vote
              </button>
            </div>
            <div className="relative pt-1">
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                <div
                  style={{ width: `${(option.votes / totalVotes) * 100}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                ></div>
              </div>
            </div>
            <div className="text-right text-sm">{option.votes} votes</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Poll;