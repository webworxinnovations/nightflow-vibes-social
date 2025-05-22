
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Home,
  Search,
  Calendar,
  User,
  Music,
  Users,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

export function Sidebar() {
  // Mock user data
  const user = {
    name: 'Alex Rodriguez',
    username: 'djalexx',
    avatar: 'https://images.unsplash.com/photo-1543132220-4bf3de6e10ae?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8ZGp8ZW58MHx8MHx8fDA%3D',
    role: 'dj'
  };

  const mainNavItems = [
    { icon: Home, path: '/', label: 'Home' },
    { icon: Search, path: '/discover', label: 'Discover' },
    { icon: Calendar, path: '/events', label: 'Events' },
  ];

  const userNavItems = user.role === 'dj'
    ? [{ icon: Music, path: '/dj-dashboard', label: 'DJ Dashboard' }]
    : [{ icon: Users, path: '/promoter-dashboard', label: 'Promoter Dashboard' }];

  return (
    <div className="hidden md:flex glassmorphism flex-col w-64 p-4 border-r border-white/10">
      <div className="flex items-center mb-8 px-2">
        <h1 className="text-2xl font-bold gradient-text">NightFlow</h1>
      </div>

      <nav className="space-y-2 mb-6">
        {mainNavItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 transition-all',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <Separator className="my-4 bg-white/10" />

      <div className="px-3 py-2">
        <h2 className="mb-2 text-lg font-semibold tracking-tight">Dashboard</h2>
        <nav className="space-y-2">
          {userNavItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 transition-all',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )
              }
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto">
        <Separator className="my-4 bg-white/10" />
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">@{user.username}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <LogOut size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
