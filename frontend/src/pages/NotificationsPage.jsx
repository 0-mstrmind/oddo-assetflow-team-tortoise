import { useState, useEffect } from 'react';
import { getActivityLogs } from '@/services/activity.service';
import {
  Bell,
  AlertTriangle,
  FileCheck,
  CalendarDays,
  Info,
} from 'lucide-react';

const FILTER_OPTIONS = [
  { id: 'all', label: 'All Activity' },
  { id: 'alerts', label: 'Alerts Only' },
  { id: 'approvals', label: 'Approvals' },
  { id: 'bookings', label: 'Resource Bookings' },
];

const getRelativeTime = (dateString) => {
  if (!dateString) return 'Just now';
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
};

const mapLog = (log) => {
  const desc = (log.description || '').toLowerCase();
  let category = 'general';
  let isAlert = false;
  
  if (desc.includes('alert') || desc.includes('warn') || desc.includes('fail') || desc.includes('overdue')) {
    category = 'alerts';
    isAlert = true;
  } else if (desc.includes('transfer') || desc.includes('approve') || desc.includes('reject')) {
    category = 'approvals';
  } else if (desc.includes('book') || desc.includes('reservation')) {
    category = 'bookings';
  }

  return {
    id: log._id || log.id,
    text: log.description || `${log.action} ${log.entity}`,
    category,
    isAlert,
    relativeTime: getRelativeTime(log.createdAt),
  };
};

export default function NotificationsPage() {
  const [logs, setLogs] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    import('@/services/socket.service').then(({ socketService }) => {
      const handleNewActivity = (newLog) => {
        setLogs((prev) => {
          const mapped = mapLog(newLog);
          // Apply filter if necessary, but typically we add it and then filter handles rendering if we keep all in state.
          // Wait, 'logs' state only holds filtered items from fetch!
          // We should ideally keep raw/mapped all items, but for now we'll just add it if it matches the filter.
          if (activeFilter !== 'all' && mapped.category !== activeFilter) {
            return prev;
          }
          return [mapped, ...prev];
        });
      };
      
      socketService.on("NEW_ACTIVITY", handleNewActivity);
      
      return () => {
        socketService.off("NEW_ACTIVITY", handleNewActivity);
      };
    }).catch(console.error);
  }, [activeFilter]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const rawLogs = await getActivityLogs();
      const mappedLogs = rawLogs.map(mapLog);

      const filtered = mappedLogs.filter(log => {
        if (activeFilter === 'all') return true;
        return log.category === activeFilter;
      });

      setLogs(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [activeFilter]);

  const getLogIcon = (category) => {
    switch (category) {
      case 'alerts':
        return <AlertTriangle size={14} className="text-[#C85C27]" />;
      case 'approvals':
        return <FileCheck size={14} className="text-[#D49B28]" />;
      case 'bookings':
        return <CalendarDays size={14} className="text-[#1E4620]" />;
      default:
        return <Info size={14} className="text-[#6B7280]" />;
    }
  };

  const getLogColorClass = (category) => {
    switch (category) {
      case 'alerts':
        return 'bg-[#C85C27]/10 border-[#C85C27]/10';
      case 'approvals':
        return 'bg-[#D49B28]/10 border-[#D49B28]/10';
      case 'bookings':
        return 'bg-[#1E4620]/10 border-[#1E4620]/10';
      default:
        return 'bg-gray-100 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-[1.75rem] font-bold text-[#1E2022] tracking-[-0.02em] mb-1">
          Activity Logs & Notifications
        </h1>
        <p className="text-sm text-[#9CA3AF] font-medium">
          Review general audit actions, resource reservations and system alerts.
        </p>
      </div>

      {/* Pill-shaped Filters */}
      <div className="flex flex-wrap gap-2.5">
        {FILTER_OPTIONS.map(opt => (
          <button
            key={opt.id}
            onClick={() => setActiveFilter(opt.id)}
            className={`px-4.5 py-2.5 rounded-full text-xs font-semibold tracking-tight transition-all active:scale-[0.98] ${
              activeFilter === opt.id
                ? 'bg-[#1E2022] text-white shadow-sm'
                : 'bg-white text-[#6B7280] hover:text-[#1E2022] border border-[#F0EBE6] shadow-sm'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Feed list */}
      {isLoading ? (
        <div className="flex items-center justify-center h-[40vh] bg-white rounded-2xl border border-[#F0EBE6] shadow-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#E8E2DC] border-t-[#D97736] rounded-full animate-spin" />
            <p className="text-sm text-[#9CA3AF]">Refreshing log feed...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#F0EBE6] shadow-[0_1px_4px_rgba(30,32,34,0.03),0_4px_16px_rgba(30,32,34,0.025)] overflow-hidden p-5 md:p-6 space-y-4">
          <div className="space-y-3.5">
            {logs.map((log) => (
              <div
                key={log.id}
                className={`flex items-center gap-3.5 p-4 rounded-xl border transition-all hover:bg-gray-50/50 ${
                  log.isAlert ? 'border-[#C85C27]/10' : 'border-[#F0EBE6]'
                }`}
              >
                {/* Icon wrapper */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${getLogColorClass(log.category)}`}>
                  {getLogIcon(log.category)}
                </div>

                {/* Log Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#1E2022] leading-relaxed">
                    {log.text}
                  </p>
                </div>

                {/* Time Stamp */}
                <div className="shrink-0 text-[10px] font-bold text-[#9CA3AF]">
                  {log.relativeTime}
                </div>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="text-center py-12 text-[#9CA3AF]">
                <Bell size={24} className="mx-auto mb-2 text-[#E8E2DC]" />
                <p className="text-xs">No activity logs recorded under this category.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
