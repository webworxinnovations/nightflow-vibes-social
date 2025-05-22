
import { Music } from "lucide-react";

interface ProfileInfoProps {
  user: any;
  followerCount: number;
}

export function ProfileInfo({ user, followerCount }: ProfileInfoProps) {
  return (
    <div className="ml-0 mt-16 sm:ml-40 sm:mt-0">
      <h1 className="text-3xl font-bold">{user.name}</h1>
      <p className="text-muted-foreground">@{user.username}</p>
      
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {user.genres?.map((genre: string) => (
          <span
            key={genre}
            className="inline-flex items-center rounded-full bg-primary/20 px-2 py-1 text-xs text-primary"
          >
            <Music className="mr-1 h-3 w-3" />
            {genre}
          </span>
        ))}
      </div>
      
      <div className="mt-4 flex items-center gap-4">
        <div className="text-center">
          <p className="text-lg font-bold">{followerCount.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Followers</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold">{user.following?.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Following</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold">{user.events?.length || 0}</p>
          <p className="text-xs text-muted-foreground">Events</p>
        </div>
      </div>
    </div>
  );
}
