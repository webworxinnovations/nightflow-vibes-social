
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Home, 
  Calendar, 
  Users, 
  Search, 
  Settings, 
  LogOut,
  Music,
  BarChart3,
  UserPlus
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useSupabaseAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getNavigationItems = () => {
    const baseItems = [
      { icon: Home, label: "Home", href: "/home" },
      { icon: Search, label: "Discover", href: "/discover" },
      { icon: Calendar, label: "Events", href: "/events" },
    ];

    if (profile?.role === "dj") {
      baseItems.push({ icon: Music, label: "DJ Dashboard", href: "/dj-dashboard" });
    } else if (profile?.role === "promoter") {
      baseItems.push({ icon: BarChart3, label: "Promoter Dashboard", href: "/promoter-dashboard" });
      baseItems.push({ icon: UserPlus, label: "Sub-Promoters", href: "/sub-promoter-management" });
    } else if (profile?.role === "sub_promoter") {
      baseItems.push({ icon: BarChart3, label: "Sub-Promoter Dashboard", href: "/sub-promoter-dashboard" });
    }

    return baseItems;
  };

  if (!user || !profile) {
    return null;
  }

  const navigationItems = getNavigationItems();

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 premium-card border-r-0 rounded-r-2xl backdrop-blur-3xl">
      {/* Enhanced background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-pink-500/5 to-blue-500/10 rounded-r-2xl" />
      <div className="absolute inset-0 nightclub-bg rounded-r-2xl opacity-50" />
      
      {/* Floating particles */}
      <div className="absolute inset-0 floating-particles rounded-r-2xl" />
      
      <div className="relative z-10 flex h-full flex-col">
        {/* Ultra-enhanced Logo */}
        <div className="flex h-20 items-center border-b border-white/20 px-6 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/15 to-blue-500/20 rounded-r-2xl blur-xl" />
          <Link to="/home" className="relative flex items-center space-x-3 group magnetic-hover">
            <div className="relative">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 ultra-glow interactive-hover flex items-center justify-center">
                <div className="text-white font-bold text-lg animate-viral-bounce">N</div>
              </div>
              {/* Orbiting particles around logo */}
              <div className="absolute -inset-2 pointer-events-none">
                <div className="absolute top-0 left-1/2 w-1 h-1 bg-purple-400 rounded-full animate-viral-bounce ultra-glow" style={{animationDelay: '0s'}} />
                <div className="absolute top-1/2 right-0 w-1 h-1 bg-pink-400 rounded-full animate-viral-bounce ultra-glow" style={{animationDelay: '0.5s'}} />
                <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-blue-400 rounded-full animate-viral-bounce ultra-glow" style={{animationDelay: '1s'}} />
                <div className="absolute top-1/2 left-0 w-1 h-1 bg-violet-400 rounded-full animate-viral-bounce ultra-glow" style={{animationDelay: '1.5s'}} />
              </div>
            </div>
            <span className="text-2xl font-black nightflow-logo">
              NightFlow
            </span>
          </Link>
        </div>

        {/* Enhanced Navigation */}
        <nav className="flex-1 space-y-2 p-6">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center space-x-4 rounded-xl px-4 py-3 text-sm transition-all duration-500 relative group magnetic-hover overflow-hidden",
                  isActive
                    ? "bg-gradient-to-r from-purple-500/30 via-pink-500/25 to-blue-500/30 text-white border-2 border-purple-400/50 ultra-glow"
                    : "text-gray-300 hover:text-white hover:bg-white/10 glow-on-hover"
                )}
                style={{animationDelay: `${index * 0.1}s`}}
              >
                {/* Enhanced background glow for active state */}
                {isActive && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-blue-400/20 rounded-xl blur-sm animate-mega-glow" />
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-400/15 via-pink-400/15 to-blue-400/15 rounded-xl blur-md animate-mega-glow" style={{animationDelay: '0.5s'}} />
                  </>
                )}
                
                {/* Premium hover effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />
                
                <div className="relative z-10 flex items-center space-x-4">
                  <div className="relative">
                    <Icon 
                      className={cn(
                        "h-6 w-6 transition-all duration-500",
                        isActive ? "text-white animate-viral-bounce ultra-glow" : "group-hover:text-white group-hover:animate-viral-bounce"
                      )} 
                    />
                    {isActive && (
                      <>
                        <div className="absolute inset-0 bg-purple-400/50 rounded-full blur-lg animate-mega-glow" />
                        <div className="absolute -inset-2 bg-pink-400/30 rounded-full blur-xl animate-mega-glow" style={{animationDelay: '0.3s'}} />
                      </>
                    )}
                  </div>
                  <span className={cn(
                    "font-bold transition-all duration-500",
                    isActive ? "text-white text-glow gradient-text" : "group-hover:text-white group-hover:text-glow"
                  )}>
                    {item.label}
                  </span>
                </div>
                
                {/* Active indicator */}
                {isActive && (
                  <>
                    <div className="absolute left-0 top-1/2 w-1 h-8 bg-gradient-to-b from-purple-400 via-pink-400 to-blue-400 rounded-r-full ultra-glow transform -translate-y-1/2" />
                    <div className="absolute right-2 top-1/2 w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full ultra-glow animate-viral-bounce transform -translate-y-1/2" />
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Ultra-enhanced User Profile */}
        <div className="border-t border-white/20 p-6 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-purple-500/15 via-pink-500/10 to-transparent" />
          
          <div className="relative z-10 flex items-center space-x-4 mb-4 group magnetic-hover">
            <div className="relative">
              <Avatar className="h-12 w-12 ultra-glow border-2 border-purple-400/50 animate-viral-bounce">
                <AvatarImage src={profile.avatar_url || ""} alt={profile.username} />
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold">
                  {profile.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {/* Status indicator */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-black rounded-full ultra-glow animate-viral-bounce" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate text-white text-glow">{profile.full_name || profile.username}</p>
              <p className="text-xs text-purple-300 capitalize font-medium">{profile.role}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Link to={`/profile/${profile.username}`}>
              <Button variant="ghost" size="sm" className="w-full justify-start premium-button text-white hover:ultra-glow">
                <Settings className="mr-3 h-4 w-4 animate-viral-bounce" />
                Profile
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/20 glow-on-hover transition-all duration-500"
              onClick={handleSignOut}
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
