
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
    <div className="fixed bottom-0 left-0 right-0 z-50 h-24 backdrop-blur-3xl bg-black/70 border-t border-white/30">
      {/* Ultra-enhanced glow effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-purple-500/40 via-pink-500/30 to-blue-500/20 animate-mega-glow" />
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/15 via-transparent to-blue-500/15" />
      
      {/* Premium floating particles effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-2 left-8 w-2 h-2 bg-purple-400 rounded-full animate-viral-bounce ultra-glow" />
        <div className="absolute top-4 right-12 w-1 h-1 bg-pink-400 rounded-full animate-viral-bounce ultra-glow" style={{animationDelay: '1s'}} />
        <div className="absolute bottom-4 left-1/3 w-1 h-1 bg-blue-400 rounded-full animate-viral-bounce ultra-glow" style={{animationDelay: '0.5s'}} />
        <div className="absolute bottom-2 right-1/4 w-2 h-2 bg-violet-400 rounded-full animate-viral-bounce ultra-glow" style={{animationDelay: '1.5s'}} />
        <div className="absolute top-1/2 left-16 w-1 h-1 bg-cyan-400 rounded-full animate-viral-bounce ultra-glow" style={{animationDelay: '2s'}} />
        <div className="absolute bottom-1/2 right-16 w-1 h-1 bg-fuchsia-400 rounded-full animate-viral-bounce ultra-glow" style={{animationDelay: '2.5s'}} />
      </div>
      
      <div className="relative z-10 grid h-full px-3" style={{ gridTemplateColumns: `repeat(${navItems.length}, 1fr)` }}>
        {navItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center transition-all duration-700 rounded-2xl mx-1 my-3 relative overflow-hidden group magnetic-hover',
                isActive
                  ? 'text-white bg-gradient-to-t from-purple-500/50 via-pink-500/40 to-blue-500/30 border-2 border-purple-400/60 ultra-glow scale-110'
                  : 'text-gray-300 hover:text-white hover:bg-white/15 hover:scale-110 glow-on-hover'
              )
            }
          >
            {({ isActive }) => (
              <>
                {/* Ultra background glow for active state */}
                {isActive && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400/30 via-pink-400/30 to-blue-400/30 rounded-2xl blur-sm animate-mega-glow" />
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-blue-400/20 rounded-2xl blur-md animate-mega-glow" style={{animationDelay: '0.5s'}} />
                  </>
                )}
                
                {/* Enhanced hover effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="relative mb-1">
                    <item.icon
                      size={28}
                      className={cn(
                        'transition-all duration-700',
                        isActive && 'drop-shadow-[0_0_16px_rgba(168,85,247,0.9)] scale-125 text-glow'
                      )}
                    />
                    {isActive && (
                      <>
                        <div className="absolute inset-0 bg-purple-400/50 rounded-full blur-lg animate-mega-glow" />
                        <div className="absolute -inset-3 bg-pink-400/30 rounded-full blur-xl animate-mega-glow" style={{animationDelay: '0.3s'}} />
                        <div className="absolute -inset-4 bg-blue-400/20 rounded-full blur-2xl animate-mega-glow" style={{animationDelay: '0.6s'}} />
                      </>
                    )}
                  </div>
                  <span className={cn(
                    "text-xs font-bold transition-all duration-700 tracking-wider",
                    isActive ? "text-white text-glow gradient-text" : "text-gray-300 group-hover:text-white group-hover:text-glow"
                  )}>
                    {item.label}
                  </span>
                </div>
                
                {/* Ultra active indicator */}
                {isActive && (
                  <>
                    <div className="absolute top-1 inset-x-3 h-1 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 rounded-full ultra-glow" />
                    <div className="absolute bottom-1 inset-x-4 h-0.5 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full ultra-glow" />
                  </>
                )}

                {/* Ripple effect on active */}
                {isActive && (
                  <div className="absolute inset-0 rounded-2xl border border-purple-400/50 animate-ping" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
