
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
    if (!loading && isConfigured) {
      if (!user && location.pathname !== "/" && location.pathname !== "/auth") {
        navigate("/auth");
      }
    }
  }, [user, loading, navigate, location.pathname, isConfigured]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center relative overflow-hidden">
        {/* Ultra-premium animated background */}
        <div className="absolute inset-0 floating-particles">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-float animate-mega-glow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-float animate-mega-glow" style={{animationDelay: '2s'}} />
          <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-blue-500/30 rounded-full blur-3xl animate-float animate-mega-glow" style={{animationDelay: '4s'}} />
          <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-violet-500/40 rounded-full blur-2xl animate-float animate-mega-glow" style={{animationDelay: '1s'}} />
          <div className="absolute top-1/3 right-1/3 w-48 h-48 bg-indigo-500/25 rounded-full blur-3xl animate-float animate-mega-glow" style={{animationDelay: '3s'}} />
        </div>
        
        {/* Floating sparkles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-2 h-2 bg-purple-400 rounded-full animate-viral-bounce" />
          <div className="absolute top-40 right-32 w-1 h-1 bg-pink-400 rounded-full animate-viral-bounce" style={{animationDelay: '0.5s'}} />
          <div className="absolute bottom-40 left-40 w-2 h-2 bg-blue-400 rounded-full animate-viral-bounce" style={{animationDelay: '1s'}} />
          <div className="absolute bottom-20 right-20 w-1 h-1 bg-violet-400 rounded-full animate-viral-bounce" style={{animationDelay: '1.5s'}} />
          <div className="absolute top-1/2 left-10 w-1 h-1 bg-cyan-400 rounded-full animate-viral-bounce" style={{animationDelay: '2s'}} />
          <div className="absolute top-60 right-10 w-2 h-2 bg-fuchsia-400 rounded-full animate-viral-bounce" style={{animationDelay: '2.5s'}} />
        </div>
        
        <div className="text-center relative z-10">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-40 w-40 border-4 border-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mx-auto p-1 ultra-glow">
              <div className="rounded-full h-full w-full bg-gray-900"></div>
            </div>
            <div className="absolute inset-0 animate-ping rounded-full h-40 w-40 border-2 border-purple-400/50 mx-auto" />
            <div className="absolute inset-2 animate-pulse rounded-full bg-gradient-to-r from-purple-400/30 to-pink-400/30 mx-auto ultra-glow" />
            <div className="absolute inset-4 animate-ping rounded-full border border-blue-400/30 mx-auto" style={{animationDelay: '0.5s'}} />
          </div>
          <h2 className="text-6xl font-bold gradient-text mb-6 neon-text animate-viral-bounce">
            NightFlow
          </h2>
          <p className="text-white/95 text-2xl font-bold mb-4 text-glow">Entering the ultimate nightlife experience...</p>
          <p className="text-purple-300 text-lg font-medium mb-8">Where the elite connect and vibe</p>
          <div className="mt-8 flex justify-center space-x-3">
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-viral-bounce ultra-glow" />
            <div className="w-3 h-3 bg-pink-400 rounded-full animate-viral-bounce ultra-glow" style={{animationDelay: '0.1s'}} />
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-viral-bounce ultra-glow" style={{animationDelay: '0.2s'}} />
            <div className="w-3 h-3 bg-violet-400 rounded-full animate-viral-bounce ultra-glow" style={{animationDelay: '0.3s'}} />
          </div>
        </div>
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 nightclub-bg">
        <div className="text-center premium-card rounded-3xl p-16 max-w-lg mx-auto ultra-glow">
          <h1 className="text-4xl font-bold mb-8 gradient-text neon-text">
            Configuration Required
          </h1>
          <p className="text-white/90 text-xl leading-relaxed">
            Please configure your Supabase connection to access the elite NightFlow experience.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 relative overflow-hidden nightclub-bg">
      {/* Ultra-enhanced background with multiple layers */}
      <div className="absolute inset-0 floating-particles opacity-50">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float animate-mega-glow" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-float animate-mega-glow" style={{animationDelay: '3s'}} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-float animate-mega-glow" style={{animationDelay: '1.5s'}} />
        <div className="absolute top-1/4 right-1/3 w-48 h-48 bg-violet-500/25 rounded-full blur-2xl animate-float animate-mega-glow" style={{animationDelay: '4.5s'}} />
        <div className="absolute bottom-1/3 left-1/6 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl animate-float animate-mega-glow" style={{animationDelay: '2.5s'}} />
        <div className="absolute top-2/3 right-1/6 w-56 h-56 bg-cyan-500/15 rounded-full blur-3xl animate-float animate-mega-glow" style={{animationDelay: '6s'}} />
      </div>
      
      {/* Premium grid overlay with glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:80px_80px] opacity-40" />
      
      {/* Additional sparkle effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-1 h-1 bg-purple-400 rounded-full animate-viral-bounce" />
        <div className="absolute top-20 right-20 w-1 h-1 bg-pink-400 rounded-full animate-viral-bounce" style={{animationDelay: '1s'}} />
        <div className="absolute bottom-20 left-20 w-1 h-1 bg-blue-400 rounded-full animate-viral-bounce" style={{animationDelay: '0.5s'}} />
        <div className="absolute bottom-10 right-10 w-1 h-1 bg-violet-400 rounded-full animate-viral-bounce" style={{animationDelay: '1.5s'}} />
        <div className="absolute top-1/3 left-1/2 w-1 h-1 bg-cyan-400 rounded-full animate-viral-bounce" style={{animationDelay: '2s'}} />
        <div className="absolute bottom-1/3 right-1/2 w-1 h-1 bg-fuchsia-400 rounded-full animate-viral-bounce" style={{animationDelay: '2.5s'}} />
      </div>
      
      <div className="relative z-10">
        <div className="hidden lg:flex">
          <Sidebar />
          <div className="flex-1 ml-64">
            <main className="p-8">
              <div className="premium-card rounded-3xl min-h-[calc(100vh-4rem)] p-8 interactive-hover ultra-glow">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
        <div className="lg:hidden">
          <MobileNav />
          <main className="p-6 pt-24 pb-28">
            <div className="premium-card rounded-3xl min-h-[calc(100vh-12rem)] p-6 ultra-glow">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
