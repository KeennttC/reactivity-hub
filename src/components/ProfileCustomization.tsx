import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "./ui/card";
import { Label } from "./ui/label";
import { User, UserCircle, Camera, Check } from 'lucide-react';
import { useToast } from "../hooks/use-toast";

const ProfileCustomization: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [nickname, setNickname] = useState(user?.username || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      try {
        await updateProfile(user.id, { username: nickname, avatarUrl });
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated.",
          icon: <Check className="h-4 w-4" />,
        });
      } catch (error) {
        toast({
          title: "Update Failed",
          description: "There was an error updating your profile. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center">
          <UserCircle className="mr-2 h-6 w-6" />
          Edit Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarUrl} alt={nickname} />
              <AvatarFallback>{nickname.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
          <div className="space-y-2">
            <Label htmlFor="avatarUrl" className="text-sm font-medium flex items-center">
              <Camera className="mr-2 h-4 w-4" />
              Avatar URL
            </Label>
            <Input
              type="text"
              id="avatarUrl"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter avatar URL"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nickname" className="text-sm font-medium flex items-center">
              <User className="mr-2 h-4 w-4" />
              Nickname
            </Label>
            <Input
              type="text"
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter your nickname"
            />
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button type="submit" onClick={handleSubmit} className="w-full">
          Update Profile
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProfileCustomization;