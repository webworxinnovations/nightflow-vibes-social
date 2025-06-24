
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/nav/Sidebar";
import { MobileNav } from "@/components/nav/MobileNav";
import { Header } from "@/components/nav/Header";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useSupabaseAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen nightclub-bg floating-particles flex dark">
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
          {children}
        </main>
      </div>
      
      {/* Mobile Navigation */}
      <div className="sm:hidden relative z-30">
        <MobileNav />
      </div>
    </div>
  );
}
