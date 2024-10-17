import React, { useState, useEffect } from 'react';
import { usePoll } from '../contexts/PollContext';
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { useToast } from "../hooks/use-toast"
import { useTheme } from '../contexts/ThemeContext';

const Poll: React.FC = () => {
  const { polls, addPoll, editPoll, vote, removePoll } = usePoll();
  const { toast } = useToast();
  const [newPollQuestion, setNewPollQuestion] = useState('');
  const [newPollOptions, setNewPollOptions] = useState(['', '']);
  const [editingPollId, setEditingPollId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('');

  const { theme } = useTheme();

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId') || Math.random().toString(36).substr(2, 9);
    setUserId(storedUserId);
    if (!localStorage.getItem('userId')) {
      localStorage.setItem('userId', storedUserId);
    }
  }, []);

  const handleAddPoll = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPollQuestion.trim() === '' || newPollOptions.some(option => option.trim() === '')) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
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

  const handleRemovePoll = (pollId: string) => {
    removePoll(pollId);
  };

  return (
    <div className={`max-w-4xl mx-auto p-4 sm:p-6 ${theme === 'dark' ? 'dark' : ''}`}>
      <h2 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center text-gray-800 dark:text-gray-200">Live Polls</h2>
      
      <Card className="mb-6 sm:mb-8 bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl text-gray-800 dark:text-gray-200">{editingPollId ? 'Edit Poll' : 'Create New Poll'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={editingPollId ? handleUpdatePoll : handleAddPoll} className="space-y-4">
            <Input
              type="text"
              value={newPollQuestion}
              onChange={(e) => setNewPollQuestion(e.target.value)}
              placeholder="Enter poll question"
              required
              className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 rounded-lg p-2"
            />
            {newPollOptions.map((option, index) => (
              <Input
                key={index}
                type="text"
                value={option}
                onChange={(e) => {
                  const newOptions = [...newPollOptions];
                  newOptions[index] = e.target.value;
                  setNewPollOptions(newOptions);
                }}
                placeholder={`Option ${index + 1}`}
                required
                className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 rounded-lg p-2"
              />
            ))}
            <Button
              type="button"
              onClick={() => setNewPollOptions([...newPollOptions, ''])}
              variant="outline"
              className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            >
              Add Option
            </Button>
            <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white w-full sm:w-auto">
              {editingPollId ? 'Update Poll' : 'Create Poll'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {polls.map((poll) => (
          <Card key={poll.id} className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl text-gray-800 dark:text-gray-200">{poll.question}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {poll.options.map((option) => (
                  <div key={option.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-gray-800 dark:text-gray-200 mb-2 sm:mb-0">{option.text}</span>
                    <div className="flex items-center">
                      <div className="w-full sm:w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-4 mr-2 overflow-hidden">
                        <div
                          className="bg-blue-500 h-4 rounded-full transition-all duration-500 ease-out poll-result-bar"
                          style={{ width: `${(option.votes / poll.options.reduce((sum, o) => sum + o.votes, 0)) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">{option.votes} votes</span>
                      <Button
                        onClick={() => vote(poll.id, option.id)}
                        variant="outline"
                        size="sm"
                        className="ml-2 bg-blue-500 hover:bg-blue-600 text-white"
                        disabled={poll.votedBy && poll.votedBy.includes(userId)}
                      >
                        Vote
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-x-2 flex flex-col sm:flex-row">
                <Button
                  onClick={() => handleEditPoll(poll.id)}
                  variant="outline"
                  className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 mb-2 sm:mb-0"
                >
                  Edit Poll
                </Button>
                <Button
                  onClick={() => handleRemovePoll(poll.id)}
                  variant="destructive"
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  Remove Poll
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Poll;