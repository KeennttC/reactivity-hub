import React, { useState, useEffect } from 'react';
import { usePoll } from '../contexts/PollContext';
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { useToast } from "../hooks/use-toast"

const Poll: React.FC = () => {
  const { polls, addPoll, editPoll, vote, removePoll } = usePoll();
  const { toast } = useToast();
  const [newPollQuestion, setNewPollQuestion] = useState('');
  const [newPollOptions, setNewPollOptions] = useState(['', '']);
  const [editingPollId, setEditingPollId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('');

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
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-white">Live Polls</h2>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{editingPollId ? 'Edit Poll' : 'Create New Poll'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={editingPollId ? handleUpdatePoll : handleAddPoll} className="space-y-4">
            <Input
              type="text"
              value={newPollQuestion}
              onChange={(e) => setNewPollQuestion(e.target.value)}
              placeholder="Enter poll question"
              required
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
              />
            ))}
            <Button
              type="button"
              onClick={() => setNewPollOptions([...newPollOptions, ''])}
              variant="outline"
            >
              Add Option
            </Button>
            <Button type="submit">
              {editingPollId ? 'Update Poll' : 'Create Poll'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {polls.map((poll) => (
          <Card key={poll.id}>
            <CardHeader>
              <CardTitle>{poll.question}</CardTitle>
            </CardHeader>
            <CardContent>
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
                      <Button
                        onClick={() => vote(poll.id, option.id)}
                        variant="outline"
                        size="sm"
                        className="ml-2"
                        disabled={poll.votedBy && poll.votedBy.includes(userId)}
                      >
                        Vote
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-x-2">
                <Button
                  onClick={() => handleEditPoll(poll.id)}
                  variant="outline"
                >
                  Edit Poll
                </Button>
                <Button
                  onClick={() => handleRemovePoll(poll.id)}
                  variant="destructive"
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