
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { User } from "@/lib/mock-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Heart, Music } from "lucide-react";

interface UserCardProps {
  user: User;
  className?: string;
  showFollow?: boolean;
}

export function UserCard({ user, className, showFollow = true }: UserCardProps) {
  return (
    <GlassmorphicCard 
      className={cn("w-full", className)}
      hoverEffect
    >
      <Link to={`/profile/${user.id}`} className="flex flex-col items-center">
        <div className="relative mb-2">
          <Avatar className="h-20 w-20 border-2 border-white/20">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          {user.isLive && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
              </span>
            </span>
          )}
        </div>
        <h3 className="text-lg font-semibold">{user.name}</h3>
        <p className="text-sm text-muted-foreground">@{user.username}</p>
        {user.genres && (
          <div className="mt-2 flex flex-wrap justify-center gap-1">
            {user.genres.slice(0, 2).map((genre, index) => (
              <span
                key={index}
                className="inline-flex items-center rounded-full bg-primary/20 px-2 py-1 text-xs text-primary"
              >
                <Music className="mr-1 h-3 w-3" />
                {genre}
              </span>
            ))}
          </div>
        )}
      </Link>
      {showFollow && (
        <div className="mt-4 flex justify-center">
          <Button
            variant={user.isFollowing ? "outline" : "default"}
            size="sm"
            className={cn(
              "w-full",
              user.isFollowing && "border-primary text-primary hover:bg-primary/10"
            )}
          >
            {user.isFollowing ? (
              <>
                <Heart className="mr-1 h-4 w-4 fill-primary" />
                Following
              </>
            ) : (
              <>
                <Heart className="mr-1 h-4 w-4" />
                Follow
              </>
            )}
          </Button>
        </div>
      )}
    </GlassmorphicCard>
  );
}
