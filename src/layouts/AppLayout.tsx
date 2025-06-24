
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
        {/* Enhanced light background effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 w-4 h-4 bg-teal-400/60 rounded-full animate-viral-bounce ultra-glow" />
          <div className="absolute top-20 right-20 w-2 h-2 bg-cyan-400/60 rounded-full animate-viral-bounce ultra-glow" style={{animationDelay: '1s'}} />
          <div className="absolute bottom-20 left-20 w-3 h-3 bg-blue-400/60 rounded-full animate-viral-bounce ultra-glow" style={{animationDelay: '0.5s'}} />
          <div className="absolute bottom-10 right-10 w-2 h-2 bg-sky-400/60 rounded-full animate-viral-bounce ultra-glow" style={{animationDelay: '1.5s'}} />
          <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-teal-300/60 rounded-full animate-viral-bounce ultra-glow" style={{animationDelay: '2s'}} />
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-cyan-300/60 rounded-full animate-viral-bounce ultra-glow" style={{animationDelay: '2.5s'}} />
          <div className="absolute bottom-1/3 left-1/2 w-1 h-1 bg-blue-300/60 rounded-full animate-viral-bounce ultra-glow" style={{animationDelay: '3s'}} />
        </div>
        
        {/* Animated gradient overlays for light theme */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-radial from-teal-200/20 to-transparent rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-radial from-cyan-200/20 to-transparent rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}} />
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-gradient-radial from-blue-200/15 to-transparent rounded-full blur-3xl animate-float transform -translate-x-1/2 -translate-y-1/2" style={{animationDelay: '4s'}} />
        </div>
        
        <Outlet />
      </div>
    );
  }

  return (
    <div className="min-h-screen nightclub-bg floating-particles flex">
      {/* Enhanced light background for authenticated pages */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Multi-layer animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50/30 via-cyan-50/20 to-blue-50/30 animate-mega-glow" />
        
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-radial from-teal-200/30 to-transparent rounded-full blur-2xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-gradient-radial from-cyan-200/25 to-transparent rounded-full blur-2xl animate-float" style={{animationDelay: '3s'}} />
        <div className="absolute top-3/4 left-3/4 w-28 h-28 bg-gradient-radial from-blue-200/35 to-transparent rounded-full blur-2xl animate-float" style={{animationDelay: '6s'}} />
        <div className="absolute top-1/2 right-1/2 w-36 h-36 bg-gradient-radial from-sky-200/20 to-transparent rounded-full blur-3xl animate-float" style={{animationDelay: '1.5s'}} />
        
        {/* Animated particles grid */}
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-teal-400/60 rounded-full ultra-glow animate-viral-bounce"
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
          <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-teal-300/30 to-transparent animate-float" style={{top: '20%'}} />
          <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-300/20 to-transparent animate-float" style={{top: '60%', animationDelay: '2s'}} />
          <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-300/25 to-transparent animate-float" style={{top: '80%', animationDelay: '4s'}} />
        </div>
      </div>
      
      {/* Desktop Sidebar - Fixed positioning */}
      <div className="hidden sm:flex sm:flex-shrink-0 relative z-20">
        <Sidebar />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Header */}
        <div className="relative z-30">
          <Header />
        </div>
        
        {/* Page Content */}
        <main className="flex-1 backdrop-blur-sm">
          <Outlet />
        </main>
      </div>
      
      {/* Mobile Navigation */}
      <div className="sm:hidden relative z-30">
        <MobileNav />
      </div>
    </div>
  );
}
