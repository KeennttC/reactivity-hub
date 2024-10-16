import React, { useState } from 'react';
import { usePoll } from '../contexts/PollContext';
import { useAuth } from '../contexts/AuthContext';

const Poll: React.FC = () => {
  const { polls, addPoll, editPoll, vote } = usePoll();
  const { user } = useAuth();
  const [newPollQuestion, setNewPollQuestion] = useState('');
  const [newPollOptions, setNewPollOptions] = useState(['', '']);
  const [editingPollId, setEditingPollId] = useState<string | null>(null);

  const handleAddPoll = (e: React.FormEvent) => {
    e.preventDefault();
    addPoll(newPollQuestion, newPollOptions.filter(option => option.trim() !== ''));
    setNewPollQuestion('');
    setNewPollOptions(['', '']);
  };

  const handleEditPoll = (pollId: string) => {
    const poll = polls.find(p => p.id === pollId);
    if (poll) {
      setNewPollQuestion(poll.question);
      setNewPollOptions(poll.options.map(o => o.text));
      setEditingPollId(pollId);
    }
  };

  const handleUpdatePoll = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPollId) {
      editPoll(editingPollId, newPollQuestion, newPollOptions.filter(option => option.trim() !== ''));
      setEditingPollId(null);
      setNewPollQuestion('');
      setNewPollOptions(['', '']);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-white">Live Polls</h2>
      
      {/* Poll creation/editing form */}
      <form onSubmit={editingPollId ? handleUpdatePoll : handleAddPoll} className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          {editingPollId ? 'Edit Poll' : 'Create New Poll'}
        </h3>
        <input
          type="text"
          value={newPollQuestion}
          onChange={(e) => setNewPollQuestion(e.target.value)}
          placeholder="Enter poll question"
          className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        {newPollOptions.map((option, index) => (
          <input
            key={index}
            type="text"
            value={option}
            onChange={(e) => {
              const newOptions = [...newPollOptions];
              newOptions[index] = e.target.value;
              setNewPollOptions(newOptions);
            }}
            placeholder={`Option ${index + 1}`}
            className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        ))}
        <button
          type="button"
          onClick={() => setNewPollOptions([...newPollOptions, ''])}
          className="mb-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition duration-300"
        >
          Add Option
        </button>
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition duration-300"
        >
          {editingPollId ? 'Update Poll' : 'Create Poll'}
        </button>
      </form>

      {/* List of polls */}
      <div className="space-y-6">
        {polls.map((poll) => (
          <div key={poll.id} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">{poll.question}</h3>
            <div className="space-y-4">
              {poll.options.map((option) => (
                <div key={option.id} className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">{option.text}</span>
                  <div className="flex items-center">
                    <div className="w-48 bg-gray-200 rounded-full h-2.5 mr-2">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${(option.votes / poll.options.reduce((sum, o) => sum + o.votes, 0)) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">{option.votes} votes</span>
                    {user && !user.votedPolls.includes(poll.id) && (
                      <button
                        onClick={() => vote(poll.id, option.id)}
                        className="ml-2 px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition duration-300"
                      >
                        Vote
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {user && (
              <button
                onClick={() => handleEditPoll(poll.id)}
                className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition duration-300"
              >
                Edit Poll
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Poll;