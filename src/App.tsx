
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { SupabaseAuthProvider } from "@/contexts/SupabaseAuthContext";
import { SubPromoterProvider } from "@/contexts/SubPromoterContext";
import AppLayout from "@/layouts/AppLayout";
import Index from "@/pages/Index";
import Home from "@/pages/Home";
import Discover from "@/pages/Discover";
import Events from "@/pages/Events";
import EventDetails from "@/pages/EventDetails";
import CreateEvent from "@/pages/CreateEvent";
import Profile from "@/pages/Profile";
import DjDashboard from "@/pages/DjDashboard";
import PromoterDashboard from "@/pages/PromoterDashboard";
import SubPromoterDashboard from "@/pages/SubPromoterDashboard";
import SubPromoterManagement from "@/pages/SubPromoterManagement";
import SignUp from "@/pages/SignUp";
import AuthPage from "@/pages/AuthPage";
import NotFound from "@/pages/NotFound";

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
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <TooltipProvider>
          <SupabaseAuthProvider>
            <SubPromoterProvider>
              <Router>
                <Routes>
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/" element={<AppLayout />}>
                    <Route index element={<Index />} />
                    <Route path="home" element={<Home />} />
                    <Route path="discover" element={<Discover />} />
                    <Route path="events" element={<Events />} />
                    <Route path="events/:id" element={<EventDetails />} />
                    <Route path="create-event" element={<CreateEvent />} />
                    <Route path="profile/:username" element={<Profile />} />
                    <Route path="dj-dashboard" element={<DjDashboard />} />
                    <Route path="promoter-dashboard" element={<PromoterDashboard />} />
                    <Route path="sub-promoter-dashboard" element={<SubPromoterDashboard />} />
                    <Route path="sub-promoter-management" element={<SubPromoterManagement />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Router>
            </SubPromoterProvider>
            <Toaster />
          </SupabaseAuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
