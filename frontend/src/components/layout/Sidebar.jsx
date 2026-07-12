import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Package, ArrowRightLeft,
  CalendarClock, Wrench, ClipboardCheck, BarChart3,
  Bell, LogOut, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { getNavigationItems } from '@/services/api.mock';
import { useAuthStore } from '@/store/useAuthStore';

const ICON_MAP = {
  'layout-dashboard': LayoutDashboard,
  'building-2': Building2,
  'package': Package,
  'arrow-right-left': ArrowRightLeft,
  'calendar-clock': CalendarClock,
  'wrench': Wrench,
  'clipboard-check': ClipboardCheck,
  'bar-chart-3': BarChart3,
  'bell': Bell,
};

const ROLE_RULES = {
  dashboard: ['admin', 'manager', 'department_head', 'employee', 'auditor', 'technician'],
  organization: ['admin'],
  assets: ['admin', 'manager', 'department_head', 'employee'],
  allocation: ['admin', 'manager', 'department_head'],
  booking: ['admin', 'manager', 'department_head', 'employee'],
  maintenance: ['admin', 'manager', 'technician'],
  audit: ['admin', 'manager', 'auditor'],
  reports: ['admin', 'manager'],
  notifications: ['admin', 'manager', 'department_head', 'employee'],
};

export default function Sidebar({ collapsed, onToggle }) {
  const [navItems, setNavItems] = useState([]);
  const location = useLocation();
  const { user, signOut } = useAuthStore();

  useEffect(() => {
    getNavigationItems().then(setNavItems);
  }, []);

  // Filter items by current user's role
  const visibleItems = navItems.filter((item) => {
    const allowed = ROLE_RULES[item.id];
    if (!allowed) return true; // Default allow if not configured
    return user && allowed.includes(user.role);
  });

  return (
    <aside
      id="sidebar"
      className={`fixed top-0 left-0 h-dvh z-40 flex flex-col bg-[#1E2022] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        collapsed ? 'w-[68px]' : 'w-[252px]'
      }`}
    >
      {/* ── Logo Area ── */}
      <div className={`flex items-center h-[68px] px-4 ${collapsed ? 'justify-center' : 'gap-2.5'}`}>
        <div className="relative shrink-0">
          <div className="w-9 h-9 bg-white/[0.06] rounded-lg flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M4 18V8l8-5l8 5v10l-8 5L4 18Z" stroke="#D97736" strokeWidth="1.8" strokeLinejoin="round"/>
              <path d="M12 13v9M4 8l8 5l8-5" stroke="#D97736" strokeWidth="1.8" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#D97736] rounded-full" />
        </div>
        {!collapsed && (
          <span className="text-white/90 text-[15px] font-semibold tracking-tight truncate">
            Asset<span className="font-bold">Flow</span>
          </span>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-0.5 scrollbar-none">
        {visibleItems.map((item) => {
          const Icon = ICON_MAP[item.icon] || Package;
          const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');

          return (
            <NavLink
              key={item.id}
              to={item.href}
              id={`nav-${item.id}`}
              title={collapsed ? item.label : undefined}
              className={`group relative flex items-center gap-3 h-10 rounded-xl transition-all duration-200 ${
                collapsed ? 'justify-center px-0' : 'px-3'
              } ${
                isActive
                  ? 'bg-white/[0.08] text-white'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
              }`}
            >
              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#D97736] rounded-r-full" />
              )}

              <Icon size={18} strokeWidth={1.7} className="shrink-0" />

              {!collapsed && (
                <span className="text-[13px] font-medium truncate">{item.label}</span>
              )}

              {/* Badge */}
              {item.badge && !collapsed && (
                <span className="ml-auto flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-[#D97736] text-white text-[10px] font-bold rounded-full">
                  {item.badge}
                </span>
              )}
              {item.badge && collapsed && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#D97736] rounded-full" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ── User Section ── */}
      <div className="px-2.5 pb-3 space-y-2">
        {/* Collapse toggle */}
        <button
          onClick={onToggle}
          id="sidebar-toggle"
          className="w-full flex items-center justify-center h-9 rounded-xl text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all duration-200"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        {/* User pill */}
        <div className={`flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.04] ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 bg-[#D97736]/20 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-[11px] font-bold text-[#D97736]">
              {user?.initials || 'U'}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white/80 truncate">{user?.name || 'User'}</p>
              <select
                value={user?.role || ''}
                onChange={(e) => {
                  const { setMockRole } = useAuthStore.getState();
                  setMockRole(e.target.value);
                }}
                className="block w-full mt-1 px-1 py-0.5 bg-[#2D3135] border border-white/10 rounded text-[10px] text-white/60 focus:outline-none focus:border-[#D97736]"
              >
                <option value="admin">Admin</option>
                <option value="manager">Asset Manager</option>
                <option value="department_head">Dept Head</option>
                <option value="employee">Employee</option>
              </select>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={signOut}
              id="sidebar-signout"
              className="p-1.5 rounded-lg text-white/25 hover:text-white/60 hover:bg-white/[0.06] transition-colors"
              title="Sign out"
            >
              <LogOut size={14} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
