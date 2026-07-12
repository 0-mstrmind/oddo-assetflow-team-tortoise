import { useState, useEffect } from 'react';
import {
  Package, Users, CalendarCheck, ArrowRightLeft, RotateCcw,
  AlertTriangle, X, TrendingUp, TrendingDown, Minus,
  Plus, CalendarClock, MessageSquarePlus,
  Laptop, Undo2, Calendar, Wrench, PlusCircle, ClipboardCheck,
  ArrowRight, ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import {
  getDashboardKPIs,
  getDashboardAlerts,
  getRecentActivity,
  getQuickActions,
} from '@/services/api.mock';

// ─── Icon Map for Activity Feed ──────────────────────────────────
const ACTIVITY_ICON_MAP = {
  laptop: Laptop,
  undo: Undo2,
  calendar: Calendar,
  wrench: Wrench,
  'plus-circle': PlusCircle,
  'arrow-right-left': ArrowRightLeft,
  'clipboard-check': ClipboardCheck,
};

const ACTIVITY_COLOR_MAP = {
  allocation: 'bg-[#1E4620]/[0.08] text-[#1E4620]',
  return: 'bg-[#D49B28]/[0.08] text-[#D49B28]',
  booking: 'bg-[#D97736]/[0.08] text-[#D97736]',
  maintenance: 'bg-[#D49B28]/[0.08] text-[#D49B28]',
  registration: 'bg-[#1E4620]/[0.08] text-[#1E4620]',
  transfer: 'bg-[#2D3135]/[0.08] text-[#2D3135]',
  audit: 'bg-[#1E4620]/[0.08] text-[#1E4620]',
};

// ─── KPI Card Component ──────────────────────────────────────────
function KPICard({ label, count, trend, trendDirection, icon: Icon, accentColor }) {
  const trendColors = {
    up: 'text-[#1E4620]',
    down: 'text-[#C85C27]',
    neutral: 'text-[#9CA3AF]',
  };
  const TrendIcon = trendDirection === 'up' ? TrendingUp : trendDirection === 'down' ? TrendingDown : Minus;

  return (
    <div className="group relative bg-white rounded-2xl p-5 md:p-6 transition-all duration-300 hover:-translate-y-0.5"
      style={{ boxShadow: '0 1px 4px rgba(30,32,34,0.03), 0 4px 16px rgba(30,32,34,0.025)' }}
    >
      {/* Hover shadow upgrade */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: '0 6px 24px rgba(30,32,34,0.06)' }}
      />

      <div className="relative z-10 flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accentColor}`}>
          <Icon size={18} strokeWidth={1.8} />
        </div>
        {trend && trend !== '0' && (
          <div className={`flex items-center gap-0.5 text-xs font-medium ${trendColors[trendDirection]}`}>
            <TrendIcon size={12} />
            <span>{trend}</span>
          </div>
        )}
      </div>

      <div className="relative z-10">
        <p className="text-3xl font-bold text-[#1E2022] tracking-tight mb-1">{count}</p>
        <p className="text-[13px] text-[#9CA3AF] font-medium">{label}</p>
      </div>
    </div>
  );
}

// ─── Alert Banner Component ──────────────────────────────────────
function AlertBanner({ alert, onDismiss }) {
  const isWarning = alert.severity === 'warning';

  return (
    <div
      className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border transition-all duration-300 ${
        isWarning
          ? 'bg-[#D49B28]/[0.06] border-[#D49B28]/15'
          : 'bg-[#1E4620]/[0.04] border-[#1E4620]/10'
      }`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
        isWarning ? 'bg-[#D49B28]/[0.12]' : 'bg-[#1E4620]/[0.08]'
      }`}>
        <AlertTriangle size={15} className={isWarning ? 'text-[#D49B28]' : 'text-[#1E4620]'} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#1E2022]">
          {alert.message}
          {alert.detail && (
            <span className="text-[#9CA3AF] font-normal"> — {alert.detail}</span>
          )}
        </p>
      </div>
      <a
        href={alert.actionHref}
        className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
          isWarning
            ? 'text-[#D49B28] hover:bg-[#D49B28]/[0.08]'
            : 'text-[#1E4620] hover:bg-[#1E4620]/[0.06]'
        }`}
      >
        {alert.actionLabel}
      </a>
      <button
        onClick={() => onDismiss(alert.id)}
        className="shrink-0 p-1 rounded-md text-[#9CA3AF] hover:text-[#6B7280] hover:bg-black/[0.03] transition-colors"
        aria-label="Dismiss alert"
      >
        <X size={14} />
      </button>
    </div>
  );
}

// ─── Quick Action Button ─────────────────────────────────────────
function QuickActionButton({ action }) {
  const isPrimary = action.variant === 'primary';

  return (
    <a
      href={action.href}
      id={`quick-${action.id}`}
      className={`group inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 active:scale-[0.98] ${
        isPrimary
          ? 'bg-[#D97736] text-white hover:bg-[#C85C27] hover:shadow-[0_4px_16px_rgba(217,119,54,0.2)]'
          : 'bg-white text-[#1E2022] hover:bg-[#F4EFEB] shadow-[0_1px_4px_rgba(30,32,34,0.04)]'
      }`}
    >
      {action.label}
      <ChevronRight size={14} className="opacity-50 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0.5" />
    </a>
  );
}

// ─── Activity Item ───────────────────────────────────────────────
function ActivityItem({ activity, isLast }) {
  const Icon = ACTIVITY_ICON_MAP[activity.icon] || Package;
  const colorClasses = ACTIVITY_COLOR_MAP[activity.type] || 'bg-[#F4EFEB] text-[#6B7280]';

  return (
    <div className={`flex gap-3.5 py-3.5 ${!isLast ? 'border-b border-[#F0EBE6]' : ''}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorClasses}`}>
        <Icon size={14} strokeWidth={1.8} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-[#1E2022] leading-relaxed">
          {activity.description}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[11px] text-[#9CA3AF]">{activity.relativeTime}</span>
          <span className="text-[11px] text-[#D8D2CC]">·</span>
          <span className="text-[11px] text-[#9CA3AF]">{activity.actor}</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  DASHBOARD PAGE
// ═══════════════════════════════════════════════════════════════════

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [kpis, setKpis] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [activity, setActivity] = useState([]);
  const [quickActions, setQuickActions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      setIsLoading(true);
      const [kpiData, alertData, activityData, actionData] = await Promise.all([
        getDashboardKPIs(),
        getDashboardAlerts(),
        getRecentActivity(),
        getQuickActions(user?.role),
      ]);
      setKpis(kpiData);
      setAlerts(alertData);
      setActivity(activityData);
      setQuickActions(actionData);
      setIsLoading(false);
    }
    fetchDashboardData();
  }, [user?.role]);

  const dismissAlert = (id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  // Greeting based on time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (isLoading || !kpis) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#E8E2DC] border-t-[#D97736] rounded-full animate-spin" />
          <p className="text-sm text-[#9CA3AF]">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  const kpiCards = [
    { key: 'available', label: 'Available', icon: Package, accentColor: 'bg-[#1E4620]/[0.08] text-[#1E4620]', ...kpis.available },
    { key: 'allocated', label: 'Allocated', icon: Users, accentColor: 'bg-[#D97736]/[0.08] text-[#D97736]', ...kpis.allocated },
    { key: 'activeBookings', label: 'Active Bookings', icon: CalendarCheck, accentColor: 'bg-[#2D3135]/[0.08] text-[#2D3135]', ...kpis.activeBookings },
    { key: 'pendingTransfers', label: 'Pending Transfers', icon: ArrowRightLeft, accentColor: 'bg-[#D49B28]/[0.08] text-[#D49B28]', ...kpis.pendingTransfers },
    { key: 'upcomingReturns', label: 'Upcoming Returns', icon: RotateCcw, accentColor: 'bg-[#1E4620]/[0.08] text-[#1E4620]', ...kpis.upcomingReturns },
  ];

  return (
    <div className="space-y-7">
      {/* ── Header ── */}
      <div>
        <p className="text-sm text-[#9CA3AF] font-medium mb-0.5">
          {greeting}, {user?.name?.split(' ')[0] || 'there'}
        </p>
        <h1 className="text-2xl md:text-[1.75rem] font-bold text-[#1E2022] tracking-[-0.02em]">
          Today's Overview
        </h1>
      </div>

      {/* ── Alert Banners ── */}
      {alerts.length > 0 && (
        <div className="space-y-2.5">
          {alerts.map((alert) => (
            <AlertBanner key={alert.id} alert={alert} onDismiss={dismissAlert} />
          ))}
        </div>
      )}

      {/* ── KPI Grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpiCards.map((card) => (
          <KPICard
            key={card.key}
            label={card.label}
            count={card.count}
            trend={card.trend}
            trendDirection={card.trendDirection}
            icon={card.icon}
            accentColor={card.accentColor}
          />
        ))}
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <h2 className="text-sm font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3.5">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          {quickActions.map((action) => (
            <QuickActionButton key={action.id} action={action} />
          ))}
        </div>
      </div>

      {/* ── Recent Activity ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[#9CA3AF] uppercase tracking-wider">
            Recent Activity
          </h2>
          <a
            href="/activity"
            className="text-xs font-medium text-[#D97736] hover:text-[#C85C27] flex items-center gap-1 transition-colors"
          >
            View All
            <ArrowRight size={12} />
          </a>
        </div>
        <div className="bg-white rounded-2xl p-5 md:p-6"
          style={{ boxShadow: '0 1px 4px rgba(30,32,34,0.03), 0 4px 16px rgba(30,32,34,0.025)' }}
        >
          {activity.map((item, i) => (
            <ActivityItem
              key={item.id}
              activity={item}
              isLast={i === activity.length - 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
