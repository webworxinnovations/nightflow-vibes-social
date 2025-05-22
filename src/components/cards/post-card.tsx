
import { useState } from "react";
import { Link } from "react-router-dom";
import { Post, formatTimeAgo } from "@/lib/mock-data";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  MessageSquare, 
  Share, 
  MoreHorizontal 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PostCardProps {
  post: Post;
  className?: string;
}

export function PostCard({ post, className }: PostCardProps) {
  const [liked, setLiked] = useState(post.hasLiked || false);
  const [likeCount, setLikeCount] = useState(post.likes);

  const handleLike = () => {
    if (liked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }
    setLiked(!liked);
  };

  return (
    <GlassmorphicCard className={className}>
      <div className="flex items-start justify-between">
        <Link to={`/profile/${post.user.id}`} className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={post.user.avatar} alt={post.user.name} />
            <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{post.user.name}</h3>
            <p className="text-xs text-muted-foreground">@{post.user.username} • {formatTimeAgo(post.timestamp)}</p>
          </div>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glassmorphism border border-white/10">
            <DropdownMenuItem>Save Post</DropdownMenuItem>
            <DropdownMenuItem>Copy Link</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Report</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-3">
        <p className="whitespace-pre-wrap">{post.content}</p>
        {post.image && (
          <img
            src={post.image}
            alt="Post"
            className="mt-3 rounded-md object-cover"
          />
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          className={liked ? "text-primary" : ""}
        >
          <Heart className={`mr-1 h-5 w-5 ${liked ? "fill-primary" : ""}`} />
          {likeCount}
        </Button>
        <Button variant="ghost" size="sm">
          <MessageSquare className="mr-1 h-5 w-5" />
          {post.comments}
        </Button>
        <Button variant="ghost" size="sm">
          <Share className="mr-1 h-5 w-5" />
          {post.shares}
        </Button>
      </div>
    </GlassmorphicCard>
  );
}
