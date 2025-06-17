import { useState } from "react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/cards/post-card";
import { EventCard } from "@/components/cards/event-card";
import { Post, User } from "@/lib/mock-data";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
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
import { Image, X, Plus, Sparkles, Calendar, Photo } from "lucide-react";

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
  const { user: currentUser } = useSupabaseAuth();
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
      <Tabs defaultValue="posts" className="mt-12">
        <div className="flex items-center justify-between mb-8">
          <TabsList className="grid grid-cols-3 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 border border-white/20 rounded-2xl p-1 backdrop-blur-xl">
            <TabsTrigger 
              value="posts" 
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/40 data-[state=active]:to-pink-500/40 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 font-semibold"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger 
              value="events"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500/40 data-[state=active]:to-blue-500/40 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 font-semibold"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Events
            </TabsTrigger>
            <TabsTrigger 
              value="media"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/40 data-[state=active]:to-purple-500/40 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 font-semibold"
            >
              <Photo className="mr-2 h-4 w-4" />
              Media
            </TabsTrigger>
          </TabsList>
          
          {isOwnProfile && (
            <Button 
              size="sm" 
              onClick={() => setIsPostDialogOpen(true)}
              className="premium-button rounded-xl px-6 py-3 font-semibold"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Post
            </Button>
          )}
        </div>
        
        <TabsContent value="posts" className="mt-8">
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post.id} className="interactive-hover">
                <PostCard 
                  post={post}
                  onDelete={isOwnProfile ? onDeletePost : undefined}
                />
              </div>
            ))}
            
            {posts.length === 0 && (
              <div className="py-16 text-center premium-card rounded-3xl">
                <div className="mb-6">
                  <Sparkles className="h-16 w-16 text-purple-400 mx-auto mb-4 animate-pulse" />
                </div>
                <h3 className="text-2xl font-bold gradient-text mb-3">No posts yet</h3>
                <p className="text-gray-300 text-lg mb-6">
                  {isOwnProfile ? "You haven't" : `${userName} hasn't`} posted anything yet
                </p>
                {isOwnProfile && (
                  <Button 
                    className="premium-button rounded-xl px-8 py-3 font-semibold text-lg" 
                    onClick={() => setIsPostDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Create Your First Post
                  </Button>
                )}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="events" className="mt-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {userEvents.map((event) => (
              <div key={event.id} className="interactive-hover">
                <EventCard event={event} />
              </div>
            ))}
            
            {userEvents.length === 0 && (
              <div className="col-span-full py-16 text-center premium-card rounded-3xl">
                <div className="mb-6">
                  <Calendar className="h-16 w-16 text-pink-400 mx-auto mb-4 animate-pulse" />
                </div>
                <h3 className="text-2xl font-bold gradient-text mb-3">No upcoming events</h3>
                <p className="text-gray-300 text-lg mb-6">
                  {isOwnProfile ? "You don't" : `${userName} doesn't`} have any upcoming events
                </p>
                {isOwnProfile && userName === 'promoter' && (
                  <Button className="premium-button rounded-xl px-8 py-3 font-semibold text-lg" asChild>
                    <Link to="/create-event">
                      <Plus className="mr-2 h-5 w-5" />
                      Create an Event
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="media" className="mt-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {posts
              .filter((post) => post.image)
              .map((post) => (
                <div
                  key={post.id}
                  className="aspect-square overflow-hidden rounded-2xl interactive-hover premium-card"
                >
                  <img
                    src={post.image}
                    alt="Media"
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                </div>
              ))}
            
            {posts.filter((post) => post.image).length === 0 && (
              <div className="col-span-full py-16 text-center premium-card rounded-3xl">
                <div className="mb-6">
                  <Photo className="h-16 w-16 text-blue-400 mx-auto mb-4 animate-pulse" />
                </div>
                <h3 className="text-2xl font-bold gradient-text mb-3">No media yet</h3>
                <p className="text-gray-300 text-lg mb-6">
                  {isOwnProfile ? "You haven't" : `${userName} hasn't`} posted any photos or videos
                </p>
                {isOwnProfile && (
                  <Button 
                    className="premium-button rounded-xl px-8 py-3 font-semibold text-lg" 
                    onClick={() => setIsPostDialogOpen(true)}
                  >
                    <Photo className="mr-2 h-5 w-5" />
                    Upload Your First Photo
                  </Button>
                )}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Enhanced Create Post Dialog */}
      <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
        <DialogContent className="premium-card border-white/20 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold gradient-text flex items-center">
              <Sparkles className="mr-3 h-6 w-6" />
              Create a new post
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-6">
            <Textarea
              placeholder="What's on your mind? Share your nightlife experience..."
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              rows={6}
              className="resize-none bg-white/5 border-white/20 rounded-xl text-lg p-4 focus:ring-2 focus:ring-purple-500/50 transition-all duration-300"
            />
            
            {imageUrl ? (
              <div className="relative rounded-2xl overflow-hidden premium-card">
                <img 
                  src={imageUrl} 
                  alt="Post attachment" 
                  className="w-full h-64 object-cover"
                />
                <Button 
                  variant="destructive" 
                  size="icon"
                  className="absolute top-4 right-4 rounded-full bg-red-500/80 hover:bg-red-500"
                  onClick={() => setImageUrl("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Input
                  placeholder="Add image URL (optional)"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="bg-white/5 border-white/20 rounded-xl flex-1"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  className="rounded-xl border-white/20 hover:bg-white/10"
                  onClick={() => document.getElementById("imageUrlInput")?.focus()}
                >
                  <Image className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          
          <DialogFooter className="gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsPostDialogOpen(false)}
              className="rounded-xl border-white/20 hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreatePost}
              className="premium-button rounded-xl px-8"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
