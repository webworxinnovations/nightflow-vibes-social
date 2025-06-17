
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
    <div className="fixed bottom-0 left-0 right-0 z-50 h-24 backdrop-blur-3xl bg-slate-900/90 border-t border-teal-400/30">
      {/* Ocean-themed background effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-teal-500/20 via-cyan-500/15 to-blue-500/10 animate-mega-glow" />
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-2 left-8 w-2 h-2 bg-teal-400 rounded-full animate-viral-bounce ultra-glow" />
        <div className="absolute top-4 right-12 w-1 h-1 bg-cyan-400 rounded-full animate-viral-bounce ultra-glow" style={{animationDelay: '1s'}} />
        <div className="absolute bottom-4 left-1/3 w-1 h-1 bg-blue-400 rounded-full animate-viral-bounce ultra-glow" style={{animationDelay: '0.5s'}} />
        <div className="absolute bottom-2 right-1/4 w-2 h-2 bg-sky-400 rounded-full animate-viral-bounce ultra-glow" style={{animationDelay: '1.5s'}} />
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
                  ? 'text-white bg-gradient-to-br from-teal-500/40 via-cyan-500/30 to-blue-500/40 border border-teal-400/60 shadow-lg shadow-teal-400/30 backdrop-blur-xl'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60 hover:scale-105 glow-on-hover'
              )
            }
          >
            {({ isActive }) => (
              <>
                {/* Ocean glow for active state */}
                {isActive && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-400/20 via-cyan-400/15 to-blue-400/20 rounded-2xl blur-sm animate-mega-glow" />
                    <div className="absolute -inset-1 bg-gradient-to-br from-teal-400/10 via-cyan-400/10 to-blue-400/10 rounded-2xl blur-md animate-mega-glow" style={{animationDelay: '0.5s'}} />
                  </>
                )}
                
                {/* Enhanced hover effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-teal-500/10 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="relative mb-1">
                    <item.icon
                      size={28}
                      className={cn(
                        'transition-all duration-700',
                        isActive && 'drop-shadow-[0_0_12px_rgba(20,184,166,0.8)] scale-110 text-teal-300'
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
                    "text-xs font-bold transition-all duration-700 tracking-wider",
                    isActive ? "text-white drop-shadow-[0_0_8px_rgba(20,184,166,0.8)]" : "text-slate-300 group-hover:text-white"
                  )}>
                    {item.label}
                  </span>
                </div>
                
                {/* Ocean-themed active indicator */}
                {isActive && (
                  <>
                    <div className="absolute top-1 inset-x-3 h-1 bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 rounded-full opacity-80" style={{
                      boxShadow: '0 0 8px rgba(20, 184, 166, 0.6)'
                    }} />
                    <div className="absolute bottom-1 inset-x-4 h-0.5 bg-gradient-to-r from-cyan-400 via-teal-400 to-sky-400 rounded-full opacity-60" style={{
                      boxShadow: '0 0 6px rgba(6, 182, 212, 0.5)'
                    }} />
                  </>
                )}

                {/* Soft ripple effect on active */}
                {isActive && (
                  <div className="absolute inset-0 rounded-2xl border border-teal-400/30 animate-ping opacity-60" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
