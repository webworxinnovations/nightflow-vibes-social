
import { Link } from "react-router-dom";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Calendar, Music, User } from "lucide-react";

interface ProfileSidebarProps {
  user: any;
  isOwnProfile: boolean;
  events: any[];
  isSongRequestOpen: boolean;
  setIsSongRequestOpen: (isOpen: boolean) => void;
}

export function ProfileSidebar({ 
  user, 
  isOwnProfile, 
  events, 
  isSongRequestOpen, 
  setIsSongRequestOpen 
}: ProfileSidebarProps) {
  return (
    <>
      <GlassmorphicCard>
        <h2 className="text-xl font-semibold">About</h2>
        <p className="mt-2 text-sm text-muted-foreground">{user.bio || "No bio yet"}</p>
        
        <Separator className="my-4 bg-white/10" />
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{user.location || "Location not specified"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Joined March 2023</span>
          </div>
          {user.genres && (
            <div className="flex items-center gap-2">
              <Music className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{user.genres?.join(', ')}</span>
            </div>
          )}
        </div>
        
        {isOwnProfile && (
          <Button variant="outline" className="mt-4 w-full">
            Edit Profile Details
          </Button>
        )}
      </GlassmorphicCard>
      
      {user.isLive && (
        <GlassmorphicCard className="mt-6" glowEffect>
          <h2 className="text-xl font-semibold text-red-500">Live Now</h2>
          <p className="mt-2 text-sm">
            {isOwnProfile ? "You are" : `${user.name} is`} currently playing at:
          </p>
          
          <div className="mt-4">
            {events
              .filter((event) => event.isLive && event.lineup.some((dj: any) => dj.id === user.id))
              .map((event) => (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  className="block rounded-md bg-primary/10 p-3 hover:bg-primary/20"
                >
                  <h3 className="font-medium">{event.title}</h3>
                  <p className="text-sm text-muted-foreground">{event.venue}</p>
                </Link>
              ))}
          </div>
          
          {!isOwnProfile && (
            <Button 
              className="mt-4 w-full"
              onClick={() => setIsSongRequestOpen(true)}
            >
              <Music className="mr-2 h-4 w-4" />
              Request a Song
            </Button>
          )}
        </GlassmorphicCard>
      )}
      
      {!isOwnProfile && (
        <GlassmorphicCard className="mt-6">
          <h2 className="text-xl font-semibold">Similar DJs</h2>
          <div className="mt-4 space-y-3">
            {user.similarDjs && user.similarDjs
              .slice(0, 3)
              .map((dj: any) => (
                <Link
                  key={dj.id}
                  to={`/profile/${dj.id}`}
                  className="flex items-center gap-3 hover:text-primary"
                >
                  <Avatar>
                    <AvatarImage src={dj.avatar} alt={dj.name} />
                    <AvatarFallback>{dj.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{dj.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {dj.genres?.slice(0, 2).join(', ')}
                    </p>
                  </div>
                </Link>
              ))}
          </div>
        </GlassmorphicCard>
      )}
    </>
  );
}
