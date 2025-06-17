
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";

export default function Index() {
  const { user, loading } = useSupabaseAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      navigate("/home");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
          NightFlow
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          The ultimate platform connecting DJs, promoters, venues, and music fans. 
          Stream live sets, manage events, and discover the best nightlife experiences.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => navigate("/auth")} 
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Get Started
          </Button>
          <Button 
            onClick={() => navigate("/discover")} 
            variant="outline" 
            size="lg"
          >
            Explore Events
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">🎧</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">For DJs</h3>
            <p className="text-muted-foreground">
              Stream live sets, receive song requests with tips, and grow your fanbase
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-pink-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">🎉</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">For Promoters</h3>
            <p className="text-muted-foreground">
              Manage events, track sales, and coordinate with sub-promoters
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">🎵</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">For Fans</h3>
            <p className="text-muted-foreground">
              Discover events, request songs, and support your favorite DJs
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
