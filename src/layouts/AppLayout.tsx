
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/nav/Sidebar";
import { MobileNav } from "@/components/nav/MobileNav";
import { Header } from "@/components/nav/Header";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";

export default function AppLayout() {
  const { user } = useSupabaseAuth();
  const location = useLocation();

  // Don't show sidebar/nav on landing page
  if (location.pathname === "/" || !user) {
    return (
      <div className="min-h-screen nightclub-bg floating-particles">
        {/* Enhanced cosmic background effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 w-4 h-4 bg-purple-400 rounded-full animate-viral-bounce ultra-glow" />
          <div className="absolute top-20 right-20 w-2 h-2 bg-pink-400 rounded-full animate-viral-bounce ultra-glow" style={{animationDelay: '1s'}} />
          <div className="absolute bottom-20 left-20 w-3 h-3 bg-blue-400 rounded-full animate-viral-bounce ultra-glow" style={{animationDelay: '0.5s'}} />
          <div className="absolute bottom-10 right-10 w-2 h-2 bg-violet-400 rounded-full animate-viral-bounce ultra-glow" style={{animationDelay: '1.5s'}} />
          <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-cyan-400 rounded-full animate-viral-bounce ultra-glow" style={{animationDelay: '2s'}} />
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-fuchsia-400 rounded-full animate-viral-bounce ultra-glow" style={{animationDelay: '2.5s'}} />
          <div className="absolute bottom-1/3 left-1/2 w-1 h-1 bg-emerald-400 rounded-full animate-viral-bounce ultra-glow" style={{animationDelay: '3s'}} />
        </div>
        
        {/* Animated gradient overlays */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-radial from-purple-500/20 to-transparent rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-radial from-pink-500/20 to-transparent rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}} />
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-gradient-radial from-blue-500/15 to-transparent rounded-full blur-3xl animate-float transform -translate-x-1/2 -translate-y-1/2" style={{animationDelay: '4s'}} />
        </div>
        
        <Outlet />
      </div>
    );
  }

  return (
    <div className="min-h-screen nightclub-bg floating-particles relative overflow-hidden">
      {/* Enhanced cosmic background for authenticated pages */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Multi-layer animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-pink-900/20 to-blue-900/30 animate-mega-glow" />
        
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-radial from-purple-500/30 to-transparent rounded-full blur-2xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-gradient-radial from-pink-500/25 to-transparent rounded-full blur-2xl animate-float" style={{animationDelay: '3s'}} />
        <div className="absolute top-3/4 left-3/4 w-28 h-28 bg-gradient-radial from-blue-500/35 to-transparent rounded-full blur-2xl animate-float" style={{animationDelay: '6s'}} />
        <div className="absolute top-1/2 right-1/2 w-36 h-36 bg-gradient-radial from-violet-500/20 to-transparent rounded-full blur-3xl animate-float" style={{animationDelay: '1.5s'}} />
        
        {/* Animated particles grid */}
        <div className="absolute inset-0 opacity-40">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-purple-400 rounded-full ultra-glow animate-viral-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
        
        {/* Scanning lines effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent animate-float" style={{top: '20%'}} />
          <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-pink-400/30 to-transparent animate-float" style={{top: '60%', animationDelay: '2s'}} />
          <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent animate-float" style={{top: '80%', animationDelay: '4s'}} />
        </div>
      </div>
      
      {/* Desktop Sidebar */}
      <div className="hidden sm:block relative z-20">
        <Sidebar />
      </div>
      
      {/* Header with sign-out */}
      <div className="sm:ml-64 relative z-30">
        <Header />
      </div>
      
      {/* Main Content with enhanced styling */}
      <div className="sm:ml-64 relative z-10">
        <div className="min-h-screen backdrop-blur-sm">
          <Outlet />
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className="sm:hidden relative z-30">
        <MobileNav />
      </div>
    </div>
  );
}
