
import { useState } from "react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/cards/post-card";
import { EventCard } from "@/components/cards/event-card";
import { Post, User } from "@/lib/mock-data";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Image, X } from "lucide-react";

interface ProfileTabsProps {
  posts: Post[];
  userEvents: any[];
  isOwnProfile: boolean;
  userName: string;
  onCreatePost?: (content: string, imageUrl?: string) => void;
  onDeletePost?: (postId: string) => void;
}

export function ProfileTabs({ 
  posts, 
  userEvents, 
  isOwnProfile, 
  userName,
  onCreatePost,
  onDeletePost
}: ProfileTabsProps) {
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const handleCreatePost = () => {
    if (postContent.trim() === "") {
      toast({
        title: "Empty post",
        description: "Please write something in your post",
        variant: "destructive",
      });
      return;
    }

    if (onCreatePost) {
      onCreatePost(postContent, imageUrl || undefined);
    }

    setPostContent("");
    setImageUrl("");
    setIsPostDialogOpen(false);
    
    toast({
      title: "Post created",
      description: "Your post has been successfully published",
    });
  };

  return (
    <>
      <Tabs defaultValue="posts" className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
          </TabsList>
          
          {isOwnProfile && (
            <Button size="sm" onClick={() => setIsPostDialogOpen(true)}>
              Create Post
            </Button>
          )}
        </div>
        
        <TabsContent value="posts" className="mt-6">
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post}
                onDelete={isOwnProfile ? onDeletePost : undefined}
              />
            ))}
            
            {posts.length === 0 && (
              <div className="py-12 text-center">
                <h3 className="text-lg font-semibold">No posts yet</h3>
                <p className="text-muted-foreground">
                  {isOwnProfile ? "You haven't" : `${userName} hasn't`} posted anything yet
                </p>
                {isOwnProfile && (
                  <Button className="mt-4" onClick={() => setIsPostDialogOpen(true)}>
                    Create Your First Post
                  </Button>
                )}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="events" className="mt-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {userEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
            
            {userEvents.length === 0 && (
              <div className="col-span-full py-12 text-center">
                <h3 className="text-lg font-semibold">No upcoming events</h3>
                <p className="text-muted-foreground">
                  {isOwnProfile ? "You don't" : `${userName} doesn't`} have any upcoming events
                </p>
                {isOwnProfile && userName === 'promoter' && (
                  <Button className="mt-4" asChild>
                    <Link to="/create-event">Create an Event</Link>
                  </Button>
                )}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="media" className="mt-6">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {posts
              .filter((post) => post.image)
              .map((post) => (
                <div
                  key={post.id}
                  className="aspect-square overflow-hidden rounded-md"
                >
                  <img
                    src={post.image}
                    alt="Media"
                    className="h-full w-full object-cover transition-transform hover:scale-110"
                  />
                </div>
              ))}
            
            {posts.filter((post) => post.image).length === 0 && (
              <div className="col-span-full py-12 text-center">
                <h3 className="text-lg font-semibold">No media yet</h3>
                <p className="text-muted-foreground">
                  {isOwnProfile ? "You haven't" : `${userName} hasn't`} posted any photos or videos
                </p>
                {isOwnProfile && (
                  <Button className="mt-4" onClick={() => setIsPostDialogOpen(true)}>
                    Upload Your First Photo
                  </Button>
                )}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Create Post Dialog */}
      <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a new post</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="What's on your mind?"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              rows={5}
              className="resize-none"
            />
            
            {imageUrl ? (
              <div className="relative rounded-md overflow-hidden">
                <img 
                  src={imageUrl} 
                  alt="Post attachment" 
                  className="w-full h-48 object-cover"
                />
                <Button 
                  variant="destructive" 
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => setImageUrl("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Add image URL (optional)"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => document.getElementById("imageUrlInput")?.focus()}
                >
                  <Image className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPostDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePost}>
              Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
