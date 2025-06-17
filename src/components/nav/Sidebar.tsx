
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
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card/40 backdrop-blur-xl border-r border-white/10">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-white/10 px-6">
          <Link to="/home" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              NightFlow
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile.avatar_url || ""} alt={profile.username} />
              <AvatarFallback>
                {profile.username?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{profile.full_name || profile.username}</p>
              <p className="text-xs text-muted-foreground capitalize">{profile.role}</p>
            </div>
          </div>
          
          <div className="mt-3 space-y-1">
            <Link to={`/profile/${profile.username}`}>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" />
                Profile
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start text-red-400 hover:text-red-300"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
