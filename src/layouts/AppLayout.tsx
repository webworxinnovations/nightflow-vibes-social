
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
        {/* Enhanced animated background */}
        <div className="absolute inset-0 floating-particles">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}} />
          <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-float" style={{animationDelay: '4s'}} />
          <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-violet-500/30 rounded-full blur-2xl animate-float" style={{animationDelay: '1s'}} />
        </div>
        
        <div className="text-center relative z-10">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-32 w-32 border-4 border-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mx-auto p-1">
              <div className="rounded-full h-full w-full bg-gray-900"></div>
            </div>
            <div className="absolute inset-0 animate-ping rounded-full h-32 w-32 border-2 border-purple-400/50 mx-auto" />
            <div className="absolute inset-2 animate-pulse rounded-full bg-gradient-to-r from-purple-400/20 to-pink-400/20 mx-auto" />
          </div>
          <h2 className="text-4xl font-bold gradient-text mb-4 neon-text">
            NightFlow
          </h2>
          <p className="text-white/90 text-lg font-medium">Entering the elite experience...</p>
          <div className="mt-6 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}} />
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
          </div>
        </div>
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        <div className="text-center premium-card rounded-3xl p-12 max-w-md mx-auto">
          <h1 className="text-3xl font-bold mb-6 gradient-text">
            Configuration Required
          </h1>
          <p className="text-white/80 text-lg leading-relaxed">
            Please configure your Supabase connection to access the elite NightFlow experience.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 relative overflow-hidden">
      {/* Enhanced background with multiple layers */}
      <div className="absolute inset-0 floating-particles opacity-40">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/15 rounded-full blur-3xl animate-float" style={{animationDelay: '3s'}} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl animate-float" style={{animationDelay: '1.5s'}} />
        <div className="absolute top-1/4 right-1/3 w-48 h-48 bg-violet-500/20 rounded-full blur-2xl animate-float" style={{animationDelay: '4.5s'}} />
        <div className="absolute bottom-1/3 left-1/6 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl animate-float" style={{animationDelay: '2.5s'}} />
      </div>
      
      {/* Premium grid overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:60px_60px] opacity-30" />
      
      <div className="relative z-10">
        <div className="hidden lg:flex">
          <Sidebar />
          <div className="flex-1 ml-64">
            <main className="p-8">
              <div className="premium-card rounded-3xl min-h-[calc(100vh-4rem)] p-8 interactive-hover">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
        <div className="lg:hidden">
          <MobileNav />
          <main className="p-6 pt-24 pb-24">
            <div className="premium-card rounded-3xl min-h-[calc(100vh-12rem)] p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
