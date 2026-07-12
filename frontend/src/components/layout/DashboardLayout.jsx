import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import { socketService } from '@/services/socket.service';
import { useNotifications } from '@/hooks/useNotifications';

/**
 * DashboardLayout — Wraps all authenticated pages with the sidebar + content area.
 * Uses the warm sand workspace background.
 */
export default function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { unreadCount } = useNotifications();

  useEffect(() => {
    socketService.connect();
    return () => {
      // Keep socket alive across route changes — only disconnect on logout
    };
  }, []);

  return (
    <div className="min-h-dvh bg-[#F4EFEB]">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
        notificationCount={unreadCount}
      />
      <main
        className={`transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] min-h-dvh ${
          sidebarCollapsed ? 'ml-[68px]' : 'ml-[252px]'
        }`}
      >
        <div className="px-6 md:px-8 lg:px-10 py-6 md:py-8 max-w-[1400px]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
