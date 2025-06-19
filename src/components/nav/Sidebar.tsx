
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Home, 
  Calendar, 
  Users, 
  Music, 
  User,
  Radio,
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";

const navigation = [
  { name: "Home", href: "/home", icon: Home },
  { name: "Live Streams", href: "/live", icon: Radio },
  { name: "Discover", href: "/discover", icon: Users },
  { name: "Events", href: "/events", icon: Calendar },
  { name: "DJ Dashboard", href: "/dj-dashboard", icon: Music },
];

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useSupabaseAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/auth");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className={`h-screen bg-card/90 backdrop-blur border-r border-border/50 transition-all duration-300 flex flex-col ${
      isCollapsed ? "w-16" : "w-64"
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-primary">Nightflow</h1>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Button
              key={item.name}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start ${isCollapsed ? "px-2" : ""}`}
              onClick={() => navigate(item.href)}
            >
              <item.icon className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">{item.name}</span>}
            </Button>
          );
        })}
      </nav>

      {/* User Section */}
      {user && (
        <div className="p-4 border-t border-border/50">
          <div className={`flex items-center gap-3 mb-4 ${isCollapsed ? "justify-center" : ""}`}>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback>
                {user.user_metadata?.username?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.user_metadata?.username || "User"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              className={`w-full justify-start ${isCollapsed ? "px-2" : ""}`}
              onClick={() => navigate("/profile")}
            >
              <User className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">Profile</span>}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className={`w-full justify-start ${isCollapsed ? "px-2" : ""}`}
            >
              <Settings className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">Settings</span>}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className={`w-full justify-start ${isCollapsed ? "px-2" : ""}`}
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">Logout</span>}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
