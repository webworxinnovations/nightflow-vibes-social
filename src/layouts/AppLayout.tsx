
import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Home, 
  Search, 
  Calendar, 
  User, 
  Music 
} from 'lucide-react';
import { MobileNav } from '@/components/nav/MobileNav';
import { Sidebar } from '@/components/nav/Sidebar';

export function AppLayout() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [showTipModal, setShowTipModal] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gradient-to-br from-nightflow-dark to-nightflow-dark-lighter">
      {!isMobile && <Sidebar />}
      
      <main className="flex-1 overflow-auto pb-20 md:pb-0 px-2 md:px-4">
        <div className={cn(
          "container mx-auto py-4",
          isMobile ? "pt-2" : "pt-6"
        )}>
          <Outlet />
        </div>
      </main>
      
      {isMobile && <MobileNav />}
    </div>
  );
}
