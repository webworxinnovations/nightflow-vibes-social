
import { NavLink } from 'react-router-dom';
import { Home, Search, Calendar, User, Music, Building2, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

export function MobileNav() {
  const { profile } = useSupabaseAuth();

  const baseNavItems = [
    { icon: Home, path: '/', label: 'Home' },
    { icon: Search, path: '/discover', label: 'Discover' },
    { icon: Calendar, path: '/events', label: 'Events' },
  ];
  
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
  
  const profileItem = { icon: User, path: `/profile/${profile?.username || 'me'}`, label: 'Profile' };
  
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
    <div className="fixed bottom-0 left-0 right-0 z-50 h-20 backdrop-blur-2xl bg-black/60 border-t border-white/20">
      {/* Enhanced glow effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-purple-500/30 via-pink-500/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-blue-500/10" />
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-2 left-8 w-1 h-1 bg-purple-400 rounded-full animate-pulse" />
        <div className="absolute top-4 right-12 w-1 h-1 bg-pink-400 rounded-full animate-pulse" style={{animationDelay: '1s'}} />
        <div className="absolute bottom-4 left-1/3 w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}} />
        <div className="absolute bottom-2 right-1/4 w-1 h-1 bg-violet-400 rounded-full animate-pulse" style={{animationDelay: '1.5s'}} />
      </div>
      
      <div className="relative z-10 grid h-full px-2" style={{ gridTemplateColumns: `repeat(${navItems.length}, 1fr)` }}>
        {navItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center transition-all duration-500 rounded-2xl mx-1 my-2 relative overflow-hidden group',
                isActive
                  ? 'text-white bg-gradient-to-t from-purple-500/40 via-pink-500/30 to-blue-500/20 border border-purple-400/50 shadow-lg shadow-purple-500/30 scale-105'
                  : 'text-gray-300 hover:text-white hover:bg-white/10 hover:scale-105'
              )
            }
          >
            {({ isActive }) => (
              <>
                {/* Background glow for active state */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-blue-400/20 rounded-2xl blur-sm animate-pulse" />
                )}
                
                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="relative">
                    <item.icon
                      size={24}
                      className={cn(
                        'mb-1 transition-all duration-500',
                        isActive && 'drop-shadow-[0_0_12px_rgba(168,85,247,0.8)] scale-110'
                      )}
                    />
                    {isActive && (
                      <>
                        <div className="absolute inset-0 bg-purple-400/40 rounded-full blur-lg animate-pulse" />
                        <div className="absolute -inset-2 bg-pink-400/20 rounded-full blur-xl animate-pulse" style={{animationDelay: '0.5s'}} />
                      </>
                    )}
                  </div>
                  <span className={cn(
                    "text-xs font-semibold transition-all duration-500 tracking-wide",
                    isActive ? "text-white text-glow" : "text-gray-300 group-hover:text-white"
                  )}>
                    {item.label}
                  </span>
                </div>
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute top-1 inset-x-4 h-0.5 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 rounded-full" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
