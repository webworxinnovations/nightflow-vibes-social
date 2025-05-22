
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Share, Heart } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface ProfileHeaderProps {
  user: any;
  isOwnProfile: boolean;
  isFollowing: boolean;
  handleFollow: () => void;
  updateUserProfile?: (profileData: any) => void;
}

export function ProfileHeader({ 
  user, 
  isOwnProfile, 
  isFollowing, 
  handleFollow,
  updateUserProfile
}: ProfileHeaderProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user.name,
    bio: user.bio || "",
    location: user.location || "",
  });
  const { toast } = useToast();

  const handleEditProfile = () => {
    setIsEditDialogOpen(true);
  };

  const handleSaveProfile = () => {
    if (updateUserProfile) {
      updateUserProfile(profileData);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated",
      });
    }
    setIsEditDialogOpen(false);
  };

  const handleShareProfile = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Profile link copied",
      description: "Profile link has been copied to clipboard",
    });
  };

  return (
    <>
      <Button variant="ghost" className="mb-4" asChild>
        <Link to={isOwnProfile ? "/" : "/discover"}>
          <ArrowLeft className="mr-2 h-4 w-4" /> 
          {isOwnProfile ? "Back to Home" : "Back to Discover"}
        </Link>
      </Button>
      
      {/* Cover Image and Profile */}
      <div className="relative mb-20 h-64 overflow-hidden rounded-lg sm:h-80">
        <img
          src={user.coverImage || "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fG5pZ2h0Y2x1YnxlbnwwfHwwfHx8MA%3D%3D"}
          alt={`${user.name} cover`}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        
        {user.isLive && (
          <div className="absolute top-4 right-4 rounded-full bg-red-500 px-3 py-1 text-sm font-semibold text-white animate-pulse">
            LIVE NOW
          </div>
        )}
        
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 transform text-center sm:left-8 sm:translate-x-0 sm:text-left">
          <div className="relative inline-block">
            <Avatar className="h-32 w-32 border-4 border-background">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            {user.isLive && (
              <div className="absolute bottom-0 right-0 h-6 w-6 rounded-full border-2 border-background bg-red-500"></div>
            )}
          </div>
        </div>
        
        <div className="absolute bottom-4 right-4 flex space-x-2">
          {isOwnProfile ? (
            <Button 
              size="sm" 
              variant="outline" 
              className="bg-background/20 backdrop-blur-sm"
              onClick={handleEditProfile}
            >
              <User className="mr-1 h-4 w-4" />
              Edit Profile
            </Button>
          ) : (
            <>
              <Button 
                size="sm" 
                variant="outline" 
                className="bg-background/20 backdrop-blur-sm"
                onClick={handleShareProfile}
              >
                <Share className="mr-1 h-4 w-4" />
                Share
              </Button>
              <Button 
                size="sm" 
                variant={isFollowing ? "outline" : "default"}
                className={isFollowing ? "bg-background/20 backdrop-blur-sm" : ""}
                onClick={handleFollow}
              >
                <Heart className={`mr-1 h-4 w-4 ${isFollowing ? "fill-primary" : ""}`} />
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile information here.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right">
                Name
              </label>
              <Input
                id="name"
                value={profileData.name}
                onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="location" className="text-right">
                Location
              </label>
              <Input
                id="location"
                value={profileData.location}
                onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="bio" className="text-right">
                Bio
              </label>
              <Textarea
                id="bio"
                value={profileData.bio}
                onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveProfile}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
