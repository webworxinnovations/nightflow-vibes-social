
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { SupabaseAuthProvider } from "@/contexts/SupabaseAuthContext";
import { SubPromoterProvider } from "@/contexts/SubPromoterContext";

// Pages - using default imports
import Index from "@/pages/Index";
import AuthPage from "@/pages/AuthPage";
import SignUp from "@/pages/SignUp";
import Home from "@/pages/Home";
import { LiveStreams } from "@/pages/LiveStreams";
import Discover from "@/pages/Discover";
import Events from "@/pages/Events";
import CreateEvent from "@/pages/CreateEvent";
import EventDetails from "@/pages/EventDetails";
import DjDashboard from "@/pages/DjDashboard";
import PromoterDashboard from "@/pages/PromoterDashboard";
import SubPromoterDashboard from "@/pages/SubPromoterDashboard";
import SubPromoterManagement from "@/pages/SubPromoterManagement";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";

// Layout
import AppLayout from "@/layouts/AppLayout";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <SupabaseAuthProvider>
          <SubPromoterProvider>
            <Router>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/signup" element={<SignUp />} />
                
                {/* Protected routes with layout */}
                <Route element={<AppLayout />}>
                  <Route path="/home" element={<Home />} />
                  <Route path="/live" element={<LiveStreams />} />
                  <Route path="/discover" element={<Discover />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/events/create" element={<CreateEvent />} />
                  <Route path="/events/:id" element={<EventDetails />} />
                  <Route path="/dj-dashboard" element={<DjDashboard />} />
                  <Route path="/promoter-dashboard" element={<PromoterDashboard />} />
                  <Route path="/sub-promoter-dashboard" element={<SubPromoterDashboard />} />
                  <Route path="/sub-promoter-management" element={<SubPromoterManagement />} />
                  <Route path="/profile/:username?" element={<Profile />} />
                </Route>
                
                {/* Catch all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </Router>
          </SubPromoterProvider>
        </SupabaseAuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
