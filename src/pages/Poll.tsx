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
      <h2 className="text-4xl font-bold mb-8 text-center text-cyan-300 shadow-neon">Live Polls</h2>
      
      <Card className="mb-8 bg-glassmorphism">
        <CardHeader>
          <CardTitle className="text-2xl text-cyan-300">{editingPollId ? 'Edit Poll' : 'Create New Poll'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={editingPollId ? handleUpdatePoll : handleAddPoll} className="space-y-4">
            <Input
              type="text"
              value={newPollQuestion}
              onChange={(e) => setNewPollQuestion(e.target.value)}
              placeholder="Enter poll question"
              required
              className="bg-gray-800 text-cyan-100 border-cyan-300 rounded-lg p-2"
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
                className="bg-gray-800 text-cyan-100 border-cyan-300 rounded-lg p-2"
              />
            ))}
            <Button
              type="button"
              onClick={() => setNewPollOptions([...newPollOptions, ''])}
              variant="outline"
              className="bg-cyan-700 hover:bg-cyan-600 text-white"
            >
              Add Option
            </Button>
            <Button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-white">
              {editingPollId ? 'Update Poll' : 'Create Poll'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {polls.map((poll) => (
          <Card key={poll.id} className="bg-glassmorphism">
            <CardHeader>
              <CardTitle className="text-2xl text-cyan-300">{poll.question}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {poll.options.map((option) => (
                  <div key={option.id} className="flex items-center justify-between">
                    <span className="text-cyan-100">{option.text}</span>
                    <div className="flex items-center">
                      <div className="w-48 bg-gray-700 rounded-full h-4 mr-2 overflow-hidden">
                        <div
                          className="bg-cyan-500 h-4 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${(option.votes / poll.options.reduce((sum, o) => sum + o.votes, 0)) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-cyan-300 w-12 text-right">{option.votes} votes</span>
                      <Button
                        onClick={() => vote(poll.id, option.id)}
                        variant="outline"
                        size="sm"
                        className="ml-2 bg-cyan-700 hover:bg-cyan-600 text-white"
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
                  className="bg-cyan-700 hover:bg-cyan-600 text-white"
                >
                  Edit Poll
                </Button>
                <Button
                  onClick={() => handleRemovePoll(poll.id)}
                  variant="destructive"
                  className="bg-red-700 hover:bg-red-600 text-white"
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