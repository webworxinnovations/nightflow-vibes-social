
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import { ThemeProvider } from "./providers/ThemeProvider";

// Import pages
import Home from "./pages/Home";
import Discover from "./pages/Discover";
import Events from "./pages/Events";
import Profile from "./pages/Profile";
import DjDashboard from "./pages/DjDashboard";
import PromoterDashboard from "./pages/PromoterDashboard";
import NotFound from "./pages/NotFound";
import EventDetails from "./pages/EventDetails";
import CreateEvent from "./pages/CreateEvent";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Home />} />
              <Route path="discover" element={<Discover />} />
              <Route path="events" element={<Events />} />
              <Route path="events/:id" element={<EventDetails />} />
              <Route path="profile/:id" element={<Profile />} />
              <Route path="dj-dashboard" element={<DjDashboard />} />
              <Route path="promoter-dashboard" element={<PromoterDashboard />} />
              <Route path="create-event" element={<CreateEvent />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
