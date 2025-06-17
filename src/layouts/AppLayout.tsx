
import { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Sidebar } from "@/components/nav/Sidebar";
import { MobileNav } from "@/components/nav/MobileNav";

export default function AppLayout() {
  const { user, loading, isConfigured } = useSupabaseAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only redirect if not loading and we have a definitive auth state
    if (!loading && isConfigured) {
      if (!user && location.pathname !== "/" && location.pathname !== "/auth") {
        navigate("/auth");
      }
    }
  }, [user, loading, navigate, location.pathname, isConfigured]);

  // Show loading while auth is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-blue-500/30 rounded-full blur-3xl animate-pulse delay-2000" />
        </div>
        
        <div className="text-center relative z-10">
          <div className="relative">
            <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-t-4 border-primary mx-auto mb-4 border-gradient-to-r from-purple-400 to-pink-400" />
            <div className="absolute inset-0 animate-ping rounded-full h-32 w-32 border-2 border-primary/50 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-2">
            NightFlow
          </h2>
          <p className="text-white/80">Loading the experience...</p>
        </div>
      </div>
    );
  }

  // Show configuration error if Supabase is not configured
  if (!isConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center bg-card/20 backdrop-blur-lg border border-white/10 rounded-2xl p-8">
          <h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Configuration Required
          </h1>
          <p className="text-muted-foreground">
            Please configure your Supabase connection to access NightFlow.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-float delay-3000" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-float delay-1500" />
      </div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:50px_50px] opacity-30" />
      
      <div className="relative z-10">
        <div className="hidden lg:flex">
          <Sidebar />
          <div className="flex-1 ml-64">
            <main className="p-6">
              <div className="backdrop-blur-sm bg-black/10 rounded-2xl border border-white/10 min-h-[calc(100vh-3rem)] p-6">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
        <div className="lg:hidden">
          <MobileNav />
          <main className="p-4 pt-20 pb-20">
            <div className="backdrop-blur-sm bg-black/10 rounded-2xl border border-white/10 min-h-[calc(100vh-8rem)] p-4">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
