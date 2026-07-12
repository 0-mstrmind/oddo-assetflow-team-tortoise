import { useState, useEffect, useCallback } from 'react';
import { api } from '@/api/axios';
import { socketService } from '@/services/socket.service';
import { toast } from 'sonner';
import {
  Bell,
  BellOff,
  CheckCheck,
  Package,
  ShieldCheck,
  ShieldX,
  AlertTriangle,
  CalendarDays,
  Info,
  Loader2,
  RefreshCw,
  Circle,
} from 'lucide-react';

// ─── Type Config ─────────────────────────────────────────────────
const TYPE_CONFIG = {
  approval: {
    label: 'Approval',
    Icon: ShieldCheck,
    iconCls: 'bg-emerald-50 text-emerald-600',
    borderCls: 'border-emerald-100',
    dotCls: 'bg-emerald-500',
  },
  alert: {
    label: 'Alert',
    Icon: AlertTriangle,
    iconCls: 'bg-red-50 text-red-500',
    borderCls: 'border-red-100',
    dotCls: 'bg-red-500',
  },
  booking: {
    label: 'Booking',
    Icon: CalendarDays,
    iconCls: 'bg-blue-50 text-blue-600',
    borderCls: 'border-blue-100',
    dotCls: 'bg-blue-500',
  },
  info: {
    label: 'Info',
    Icon: Info,
    iconCls: 'bg-[#D97736]/[0.08] text-[#D97736]',
    borderCls: 'border-[#D97736]/10',
    dotCls: 'bg-[#D97736]',
  },
};

const FILTERS = [
  { id: 'all',      label: 'All' },
  { id: 'approval', label: 'Requests & Approvals' },
  { id: 'alert',    label: 'Alerts' },
  { id: 'booking',  label: 'Bookings' },
  { id: 'info',     label: 'Info' },
];

// ─── Helpers ──────────────────────────────────────────────────────
function getRelativeTime(dateStr) {
  if (!dateStr) return 'Just now';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  if (mins < 1)   return 'Just now';
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ─── Notification Item ────────────────────────────────────────────
function NotificationItem({ notification, onMarkRead }) {
  const cfg = TYPE_CONFIG[notification.type] || TYPE_CONFIG.info;
  const { Icon, iconCls, borderCls, dotCls } = cfg;

  return (
    <div
      className={`group flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200 cursor-default ${
        notification.isRead
          ? 'bg-white border-[#F0EBE6]'
          : `bg-white ${borderCls} shadow-[0_2px_8px_rgba(30,32,34,0.05)]`
      }`}
    >
      {/* Icon */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconCls}`}>
        <Icon size={17} strokeWidth={1.8} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {!notification.isRead && (
              <span className={`w-2 h-2 rounded-full shrink-0 ${dotCls}`} />
            )}
            <p className={`text-sm font-semibold truncate ${notification.isRead ? 'text-[#6B7280]' : 'text-[#1E2022]'}`}>
              {notification.title}
            </p>
          </div>
          <span className="text-[11px] text-[#9CA3AF] shrink-0 mt-0.5">
            {getRelativeTime(notification.createdAt)}
          </span>
        </div>
        <p className={`text-xs mt-1 leading-relaxed ${notification.isRead ? 'text-[#9CA3AF]' : 'text-[#6B7280]'}`}>
          {notification.message}
        </p>
      </div>

      {/* Mark read button */}
      {!notification.isRead && (
        <button
          onClick={() => onMarkRead(notification._id)}
          title="Mark as read"
          className="shrink-0 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#D97736] hover:bg-[#D97736]/[0.06] transition-all"
        >
          <CheckCheck size={14} />
        </button>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────
export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter]               = useState('all');
  const [isLoading, setIsLoading]         = useState(true);

  // ── Fetch ─────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Real-time socket listener ─────────────────────────────────
  useEffect(() => {
    fetchNotifications();

    const handleNew = (notification) => {
      setNotifications(prev => [notification, ...prev]);
    };

    socketService.on('NEW_NOTIFICATION', handleNew);
    return () => socketService.off('NEW_NOTIFICATION', handleNew);
  }, [fetchNotifications]);

  // ── Mark single as read ───────────────────────────────────────
  const handleMarkRead = useCallback(async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
    } catch (err) {
      toast.error('Could not mark notification as read');
    }
  }, []);

  // ── Mark all as read ──────────────────────────────────────────
  const handleMarkAllRead = useCallback(async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Could not mark all as read');
    }
  }, []);

  // ── Derived ───────────────────────────────────────────────────
  const filtered   = filter === 'all' ? notifications : notifications.filter(n => n.type === filter);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-[1.75rem] font-bold text-[#1E2022] tracking-[-0.02em]">
            Notifications
          </h1>
          <p className="text-sm text-[#9CA3AF] mt-1">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'All caught up!'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchNotifications}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#6B7280] bg-white border border-[#F0EBE6] rounded-xl hover:text-[#D97736] hover:border-[#D97736]/20 transition-all shadow-[0_1px_4px_rgba(30,32,34,0.03)]"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#1E2022] rounded-xl hover:bg-[#2D3135] transition-all shadow-[0_1px_4px_rgba(30,32,34,0.06)]"
            >
              <CheckCheck size={13} />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total',     value: notifications.length,                                        color: 'text-[#1E2022]' },
          { label: 'Unread',    value: unreadCount,                                                  color: 'text-[#D97736]' },
          { label: 'Approvals', value: notifications.filter(n => n.type === 'approval').length,     color: 'text-emerald-600' },
          { label: 'Alerts',    value: notifications.filter(n => n.type === 'alert').length,        color: 'text-red-500' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl p-4 border border-[#F0EBE6] shadow-[0_1px_4px_rgba(30,32,34,0.03)]">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-[#9CA3AF] mt-0.5 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── Filter Tabs ── */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {FILTERS.map(f => {
          const count = f.id === 'all'
            ? notifications.length
            : notifications.filter(n => n.type === f.id).length;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
                filter === f.id
                  ? 'bg-[#1E2022] text-white shadow-sm'
                  : 'bg-white text-[#6B7280] border border-[#F0EBE6] hover:text-[#1E2022] hover:border-[#E8E2DC]'
              }`}
            >
              {f.label}
              {count > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  filter === f.id ? 'bg-white/20 text-white' : 'bg-[#F0EBE6] text-[#6B7280]'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Notification Feed ── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-[#D97736]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-2xl border border-[#F0EBE6]">
          <div className="w-14 h-14 bg-[#F4EFEB] rounded-2xl flex items-center justify-center">
            <BellOff size={24} className="text-[#D8D2CC]" />
          </div>
          <p className="text-sm font-semibold text-[#6B7280]">No notifications</p>
          <p className="text-xs text-[#9CA3AF]">
            {filter === 'all'
              ? 'You have no notifications yet. They will appear here when actions occur.'
              : `No ${filter} notifications found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map(notification => (
            <NotificationItem
              key={notification._id}
              notification={notification}
              onMarkRead={handleMarkRead}
            />
          ))}
        </div>
      )}
    </div>
  );
}
