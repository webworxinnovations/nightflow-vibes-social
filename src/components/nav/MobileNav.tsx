
import { NavLink } from 'react-router-dom';
import { Home, Search, Calendar, User, Music } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileNav() {
  const navItems = [
    { icon: Home, path: '/', label: 'Home' },
    { icon: Search, path: '/discover', label: 'Discover' },
    { icon: Calendar, path: '/events', label: 'Events' },
    { icon: Music, path: '/dj-dashboard', label: 'DJ' },
    { icon: User, path: '/profile/me', label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t border-white/10 bg-nightflow-dark-lighter backdrop-blur-lg">
      <div className="grid h-full grid-cols-5">
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
