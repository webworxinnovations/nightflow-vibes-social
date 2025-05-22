
import { NavLink } from 'react-router-dom';
import { Home, Search, Calendar, User, Music, Building2, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export function MobileNav() {
  const { currentUser } = useAuth();

  // Base navigation items for all users
  const baseNavItems = [
    { icon: Home, path: '/', label: 'Home' },
    { icon: Search, path: '/discover', label: 'Discover' },
    { icon: Calendar, path: '/events', label: 'Events' },
  ];
  
  // Get appropriate dashboard link based on user role
  const getDashboardItem = () => {
    if (!currentUser) return null;
    
    switch (currentUser.role) {
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
  const profileItem = { icon: User, path: `/profile/${currentUser?.id || 'me'}`, label: 'Profile' };
  
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
    <div className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t border-white/10 bg-nightflow-dark-lighter backdrop-blur-lg">
      <div className="grid h-full" style={{ gridTemplateColumns: `repeat(${navItems.length}, 1fr)` }}>
        {navItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-primary'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  size={20}
                  className={cn(
                    'mb-1',
                    isActive && 'animate-pulse-glow'
                  )}
                />
                <span className="text-xs">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
