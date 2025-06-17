
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
import { Image, X, Plus, Sparkles, Calendar, Crown, Zap } from "lucide-react";

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
      <Tabs defaultValue="posts" className="mt-16">
        <div className="flex items-center justify-between mb-10">
          <TabsList className="grid grid-cols-3 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-blue-500/30 border-2 border-white/30 rounded-2xl p-2 backdrop-blur-2xl ultra-glow">
            <TabsTrigger 
              value="posts" 
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/50 data-[state=active]:to-pink-500/50 data-[state=active]:text-white data-[state=active]:shadow-xl transition-all duration-500 font-bold text-lg magnetic-hover"
            >
              <Sparkles className="mr-3 h-5 w-5 animate-viral-bounce ultra-glow" />
              Posts
            </TabsTrigger>
            <TabsTrigger 
              value="events"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500/50 data-[state=active]:to-blue-500/50 data-[state=active]:text-white data-[state=active]:shadow-xl transition-all duration-500 font-bold text-lg magnetic-hover"
            >
              <Calendar className="mr-3 h-5 w-5 animate-viral-bounce ultra-glow" style={{animationDelay: '0.2s'}} />
              Events
            </TabsTrigger>
            <TabsTrigger 
              value="media"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/50 data-[state=active]:to-purple-500/50 data-[state=active]:text-white data-[state=active]:shadow-xl transition-all duration-500 font-bold text-lg magnetic-hover"
            >
              <Image className="mr-3 h-5 w-5 animate-viral-bounce ultra-glow" style={{animationDelay: '0.4s'}} />
              Media
            </TabsTrigger>
          </TabsList>
          
          {isOwnProfile && (
            <Button 
              size="lg" 
              onClick={() => setIsPostDialogOpen(true)}
              className="premium-button rounded-xl px-8 py-4 font-bold text-lg ultra-glow magnetic-hover"
            >
              <Plus className="mr-3 h-5 w-5 animate-viral-bounce" />
              Create Post
              <Sparkles className="ml-3 h-5 w-5 animate-viral-bounce" style={{animationDelay: '0.3s'}} />
            </Button>
          )}
        </div>
        
        <TabsContent value="posts" className="mt-10">
          <div className="space-y-8">
            {posts.map((post) => (
              <div key={post.id} className="interactive-hover ultra-glow">
                <PostCard 
                  post={post}
                  onDelete={isOwnProfile ? onDeletePost : undefined}
                />
              </div>
            ))}
            
            {posts.length === 0 && (
              <div className="py-20 text-center premium-card rounded-3xl ultra-glow magnetic-hover">
                <div className="mb-8">
                  <Sparkles className="h-20 w-20 text-purple-400 mx-auto mb-6 animate-viral-bounce ultra-glow" />
                </div>
                <h3 className="text-3xl font-bold gradient-text mb-4 neon-text">No posts yet</h3>
                <p className="text-gray-300 text-xl mb-8 text-glow">
                  {isOwnProfile ? "You haven't" : `${userName} hasn't`} posted anything yet
                </p>
                {isOwnProfile && (
                  <Button 
                    className="premium-button rounded-xl px-10 py-4 font-bold text-xl ultra-glow magnetic-hover" 
                    onClick={() => setIsPostDialogOpen(true)}
                  >
                    <Plus className="mr-3 h-6 w-6 animate-viral-bounce" />
                    Create Your First Post
                    <Crown className="ml-3 h-6 w-6 animate-viral-bounce text-yellow-400" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="events" className="mt-10">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            {userEvents.map((event) => (
              <div key={event.id} className="interactive-hover ultra-glow">
                <EventCard event={event} />
              </div>
            ))}
            
            {userEvents.length === 0 && (
              <div className="col-span-full py-20 text-center premium-card rounded-3xl ultra-glow magnetic-hover">
                <div className="mb-8">
                  <Calendar className="h-20 w-20 text-pink-400 mx-auto mb-6 animate-viral-bounce ultra-glow" />
                </div>
                <h3 className="text-3xl font-bold gradient-text mb-4 neon-text">No upcoming events</h3>
                <p className="text-gray-300 text-xl mb-8 text-glow">
                  {isOwnProfile ? "You don't" : `${userName} doesn't`} have any upcoming events
                </p>
                {isOwnProfile && userName === 'promoter' && (
                  <Button className="premium-button rounded-xl px-10 py-4 font-bold text-xl ultra-glow magnetic-hover" asChild>
                    <Link to="/create-event">
                      <Plus className="mr-3 h-6 w-6 animate-viral-bounce" />
                      Create an Event
                      <Zap className="ml-3 h-6 w-6 animate-viral-bounce text-yellow-400" />
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="media" className="mt-10">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
            {posts
              .filter((post) => post.image)
              .map((post) => (
                <div
                  key={post.id}
                  className="aspect-square overflow-hidden rounded-2xl magnetic-hover premium-card ultra-glow"
                >
                  <img
                    src={post.image}
                    alt="Media"
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-125"
                  />
                </div>
              ))}
            
            {posts.filter((post) => post.image).length === 0 && (
              <div className="col-span-full py-20 text-center premium-card rounded-3xl ultra-glow magnetic-hover">
                <div className="mb-8">
                  <Image className="h-20 w-20 text-blue-400 mx-auto mb-6 animate-viral-bounce ultra-glow" />
                </div>
                <h3 className="text-3xl font-bold gradient-text mb-4 neon-text">No media yet</h3>
                <p className="text-gray-300 text-xl mb-8 text-glow">
                  {isOwnProfile ? "You haven't" : `${userName} hasn't`} posted any photos or videos
                </p>
                {isOwnProfile && (
                  <Button 
                    className="premium-button rounded-xl px-10 py-4 font-bold text-xl ultra-glow magnetic-hover" 
                    onClick={() => setIsPostDialogOpen(true)}
                  >
                    <Image className="mr-3 h-6 w-6 animate-viral-bounce" />
                    Upload Your First Photo
                    <Sparkles className="ml-3 h-6 w-6 animate-viral-bounce text-pink-400" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Ultra-Enhanced Create Post Dialog */}
      <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
        <DialogContent className="premium-card border-white/30 max-w-3xl ultra-glow">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold gradient-text flex items-center neon-text">
              <Sparkles className="mr-4 h-8 w-8 animate-viral-bounce ultra-glow" />
              Create a new post
              <Crown className="ml-4 h-8 w-8 animate-viral-bounce text-yellow-400 ultra-glow" />
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-8 py-8">
            <Textarea
              placeholder="What's on your mind? Share your nightlife experience and let the world know..."
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              rows={8}
              className="resize-none bg-white/10 border-white/30 rounded-xl text-xl p-6 focus:ring-2 focus:ring-purple-500/60 transition-all duration-500 ultra-glow"
            />
            
            {imageUrl ? (
              <div className="relative rounded-2xl overflow-hidden premium-card ultra-glow">
                <img 
                  src={imageUrl} 
                  alt="Post attachment" 
                  className="w-full h-80 object-cover"
                />
                <Button 
                  variant="destructive" 
                  size="icon"
                  className="absolute top-6 right-6 rounded-full bg-red-500/90 hover:bg-red-500 w-12 h-12 ultra-glow"
                  onClick={() => setImageUrl("")}
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Input
                  placeholder="Add image URL (optional)"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="bg-white/10 border-white/30 rounded-xl flex-1 text-lg p-4 ultra-glow"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  className="rounded-xl border-white/30 hover:bg-white/15 w-14 h-14 ultra-glow magnetic-hover"
                  onClick={() => document.getElementById("imageUrlInput")?.focus()}
                >
                  <Image className="h-6 w-6" />
                </Button>
              </div>
            )}
          </div>
          
          <DialogFooter className="gap-4">
            <Button 
              variant="outline" 
              onClick={() => setIsPostDialogOpen(false)}
              className="rounded-xl border-white/30 hover:bg-white/15 px-8 py-3 text-lg font-bold ultra-glow magnetic-hover"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreatePost}
              className="premium-button rounded-xl px-10 py-3 text-lg font-bold ultra-glow magnetic-hover"
            >
              <Sparkles className="mr-3 h-5 w-5 animate-viral-bounce" />
              Post
              <Zap className="ml-3 h-5 w-5 animate-viral-bounce text-yellow-400" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
