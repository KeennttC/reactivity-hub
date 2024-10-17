import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";

interface EditProfileModalProps {
  onClose: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ onClose }) => {
  const { user, updateProfile } = useAuth();
  const [nickname, setNickname] = useState(user?.username || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      await updateProfile(user.id, { username: nickname });
      onClose();
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nickname</label>
            <Input
              type="text"
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="mt-1"
            />
          </div>
          <DialogFooter>
            <Button type="submit">Update Profile</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;