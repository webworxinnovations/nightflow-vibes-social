
import { NavLink } from 'react-router-dom';
import { Home, Search, Calendar, User, Music, Building2, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

export function MobileNav() {
  const { profile } = useSupabaseAuth();

  // Base navigation items for all users
  const baseNavItems = [
    { icon: Home, path: '/', label: 'Home' },
    { icon: Search, path: '/discover', label: 'Discover' },
    { icon: Calendar, path: '/events', label: 'Events' },
  ];
  
  // Get appropriate dashboard link based on user role
  const getDashboardItem = () => {
    if (!profile) return null;
    
    switch (profile.role) {
      case 'dj':
        return { icon: Music, path: '/dj-dashboard', label: 'DJ' };
      case 'promoter':
        return { icon: Users, path: '/promoter-dashboard', label: 'Promo' };
      case 'venue':
        return { icon: Building2, path: '/venue-dashboard', label: 'Venue' };
      default:
        return null;
    }
  };
  
  // Profile item is always shown
  const profileItem = { icon: User, path: `/profile/${profile?.username || 'me'}`, label: 'Profile' };
  
  // Build final navigation items
  const buildNavItems = () => {
    const items = [...baseNavItems];
    const dashboardItem = getDashboardItem();
    
    if (dashboardItem) {
      items.push(dashboardItem);
    }
    
    items.push(profileItem);
    return items;
  };
  
  const navItems = buildNavItems();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 h-20 backdrop-blur-xl bg-black/40 border-t border-white/10">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 via-pink-500/10 to-transparent" />
      
      <div className="relative z-10 grid h-full px-2" style={{ gridTemplateColumns: `repeat(${navItems.length}, 1fr)` }}>
        {navItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center transition-all duration-300 rounded-2xl mx-1 my-2',
                isActive
                  ? 'text-white bg-gradient-to-t from-purple-500/30 to-pink-500/20 border border-purple-400/30 shadow-lg shadow-purple-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <item.icon
                    size={24}
                    className={cn(
                      'mb-1 transition-all duration-300',
                      isActive && 'drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]'
                    )}
                  />
                  {isActive && (
                    <div className="absolute inset-0 bg-purple-400/30 rounded-full blur-lg animate-pulse" />
                  )}
                </div>
                <span className={cn(
                  "text-xs font-medium transition-all duration-300",
                  isActive ? "text-white" : "text-gray-400"
                )}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
