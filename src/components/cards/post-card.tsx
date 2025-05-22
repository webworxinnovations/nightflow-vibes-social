
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
  MoreHorizontal,
  Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface PostCardProps {
  post: Post;
  className?: string;
  onDelete?: (postId: string) => void;
}

export function PostCard({ post, className, onDelete }: PostCardProps) {
  const [liked, setLiked] = useState(post.hasLiked || false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const { toast } = useToast();
  const { currentUser } = useAuth();
  
  const isOwnPost = currentUser?.id === post.user.id;

  const handleLike = () => {
    if (liked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }
    setLiked(!liked);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href + `?post=${post.id}`);
    toast({
      title: "Post link copied",
      description: "Post link has been copied to clipboard",
    });
  };

  const handleDeletePost = () => {
    if (onDelete) {
      onDelete(post.id);
    }
    setIsAlertOpen(false);
    toast({
      title: "Post deleted",
      description: "Your post has been successfully deleted",
    });
  };

  return (
    <>
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
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(post.content)}>
                Copy Text
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShare}>
                Copy Link
              </DropdownMenuItem>
              {isOwnPost && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={() => setIsAlertOpen(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Post
                  </DropdownMenuItem>
                </>
              )}
              {!isOwnPost && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">Report</DropdownMenuItem>
                </>
              )}
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
          <Button variant="ghost" size="sm" onClick={handleShare}>
            <Share className="mr-1 h-5 w-5" />
            {post.shares}
          </Button>
        </div>
      </GlassmorphicCard>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your post.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePost}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
