
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
    console.log('AppLayout: Auth state change', { user: !!user, loading, path: location.pathname });
    
    if (!loading && isConfigured && !user && location.pathname !== "/") {
      console.log('AppLayout: Redirecting to auth page');
      navigate("/auth");
    }
  }, [user, loading, navigate, location.pathname, isConfigured]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-white">Loading application...</p>
        </div>
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Supabase Not Configured</h1>
          <p className="text-muted-foreground">
            Please configure your Supabase connection to use this app.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="hidden lg:flex">
        <Sidebar />
        <div className="flex-1 ml-64">
          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
      <div className="lg:hidden">
        <MobileNav />
        <main className="p-4 pt-20">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
