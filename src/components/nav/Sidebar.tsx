
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
    <div className="fixed inset-y-0 left-0 z-50 w-64 backdrop-blur-3xl bg-slate-900/95 border-r border-teal-400/30 rounded-r-2xl">
      {/* Ocean-themed background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-teal-500/10 via-cyan-500/5 to-blue-500/10 rounded-r-2xl" />
      <div className="absolute inset-0 nightclub-bg rounded-r-2xl opacity-30" />
      
      {/* Floating particles */}
      <div className="absolute inset-0 floating-particles rounded-r-2xl opacity-60" />
      
      <div className="relative z-10 flex h-full flex-col">
        {/* Enhanced Logo with better contrast */}
        <div className="flex h-20 items-center border-b border-teal-400/30 px-6 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 via-cyan-500/15 to-blue-500/20 rounded-r-2xl blur-xl" />
          <Link to="/home" className="relative flex items-center space-x-3 group magnetic-hover">
            <div className="relative">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 shadow-lg shadow-teal-400/30 flex items-center justify-center">
                <div className="text-white font-bold text-lg drop-shadow-lg">N</div>
              </div>
            </div>
            <span className="text-2xl font-black text-white drop-shadow-[0_0_12px_rgba(20,184,166,0.8)]" style={{
              background: 'linear-gradient(45deg, #14b8a6, #06b6d4, #3b82f6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 8px rgba(20, 184, 166, 0.6))'
            }}>
              NightFlow
            </span>
          </Link>
        </div>

        {/* Enhanced Navigation with better contrast */}
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
                    ? "bg-gradient-to-r from-teal-500/30 via-cyan-500/25 to-blue-500/30 text-white border border-teal-400/50 shadow-lg shadow-teal-400/20 backdrop-blur-xl"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60 glow-on-hover"
                )}
                style={{animationDelay: `${index * 0.1}s`}}
              >
                {/* Ocean glow for active state */}
                {isActive && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-400/15 via-cyan-400/15 to-blue-400/15 rounded-xl blur-sm animate-mega-glow" />
                    <div className="absolute -inset-1 bg-gradient-to-r from-teal-400/10 via-cyan-400/10 to-blue-400/10 rounded-xl blur-md animate-mega-glow" style={{animationDelay: '0.5s'}} />
                  </>
                )}
                
                {/* Premium hover effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />
                
                <div className="relative z-10 flex items-center space-x-4">
                  <div className="relative">
                    <Icon 
                      className={cn(
                        "h-6 w-6 transition-all duration-500",
                        isActive ? "text-teal-300 drop-shadow-[0_0_8px_rgba(20,184,166,0.8)]" : "group-hover:text-white"
                      )} 
                    />
                    {isActive && (
                      <>
                        <div className="absolute inset-0 bg-teal-400/40 rounded-full blur-lg animate-mega-glow" />
                        <div className="absolute -inset-2 bg-cyan-400/20 rounded-full blur-xl animate-mega-glow" style={{animationDelay: '0.3s'}} />
                      </>
                    )}
                  </div>
                  <span className={cn(
                    "font-bold transition-all duration-500",
                    isActive ? "text-white drop-shadow-[0_0_8px_rgba(20,184,166,0.6)]" : "group-hover:text-white"
                  )}>
                    {item.label}
                  </span>
                </div>
                
                {/* Ocean-themed active indicator */}
                {isActive && (
                  <>
                    <div className="absolute left-0 top-1/2 w-1 h-8 bg-gradient-to-b from-teal-400 via-cyan-400 to-blue-400 rounded-r-full transform -translate-y-1/2" style={{
                      boxShadow: '0 0 8px rgba(20, 184, 166, 0.8)'
                    }} />
                    <div className="absolute right-2 top-1/2 w-2 h-2 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full animate-viral-bounce transform -translate-y-1/2" style={{
                      boxShadow: '0 0 6px rgba(20, 184, 166, 0.6)'
                    }} />
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Enhanced User Profile with better contrast */}
        <div className="border-t border-teal-400/30 p-6 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-teal-500/15 via-cyan-500/10 to-transparent" />
          
          <div className="relative z-10 flex items-center space-x-4 mb-4 group magnetic-hover">
            <div className="relative">
              <Avatar className="h-12 w-12 border-2 border-teal-400/50 shadow-lg shadow-teal-400/30">
                <AvatarImage src={profile.avatar_url || ""} alt={profile.username} />
                <AvatarFallback className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold">
                  {profile.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {/* Status indicator */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-slate-900 rounded-full" style={{
                boxShadow: '0 0 8px rgba(34, 197, 94, 0.6)'
              }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate text-white drop-shadow-[0_0_6px_rgba(20,184,166,0.6)]">{profile.full_name || profile.username}</p>
              <p className="text-xs text-teal-300 capitalize font-medium">{profile.role}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Link to={`/profile/${profile.username}`}>
              <Button variant="ghost" size="sm" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all duration-300">
                <Settings className="mr-3 h-4 w-4" />
                Profile
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all duration-300"
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
