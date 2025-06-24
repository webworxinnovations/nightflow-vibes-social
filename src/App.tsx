
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SupabaseAuthProvider, useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import DjDashboard from "./pages/DjDashboard";
import PromoterDashboard from "./pages/PromoterDashboard";
import SubPromoterDashboard from "./pages/SubPromoterDashboard";
import SubPromoterManagement from "./pages/SubPromoterManagement";
import Profile from "./pages/Profile";
import Discover from "./pages/Discover";
import LiveStreams from "./pages/LiveStreams";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import CreateEvent from "./pages/CreateEvent";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useSupabaseAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirects to dashboard if already logged in)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useSupabaseAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dj-dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SupabaseAuthProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<PublicRoute><Index /></PublicRoute>} />
              <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
              
              {/* Protected routes */}
              <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/dj-dashboard" element={<ProtectedRoute><DjDashboard /></ProtectedRoute>} />
              <Route path="/promoter-dashboard" element={<ProtectedRoute><PromoterDashboard /></ProtectedRoute>} />
              <Route path="/subpromoter-dashboard" element={<ProtectedRoute><SubPromoterDashboard /></ProtectedRoute>} />
              <Route path="/subpromoter-management" element={<ProtectedRoute><SubPromoterManagement /></ProtectedRoute>} />
              <Route path="/profile/:userId?" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/discover" element={<ProtectedRoute><Discover /></ProtectedRoute>} />
              <Route path="/live-streams" element={<ProtectedRoute><LiveStreams /></ProtectedRoute>} />
              <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
              <Route path="/events/:eventId" element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />
              <Route path="/create-event" element={<ProtectedRoute><CreateEvent /></ProtectedRoute>} />
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SupabaseAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
