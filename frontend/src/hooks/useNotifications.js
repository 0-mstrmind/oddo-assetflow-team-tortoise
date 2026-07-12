import { useState, useEffect, useCallback } from 'react';
import { api } from '@/api/axios';
import { socketService } from '@/services/socket.service';
import { toast } from 'sonner';

/**
 * Global hook to manage real-time notifications.
 * Returns unread count and notification list, auto-updated via socket.
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await api.get('/notifications');
      const list = data.notifications || [];
      setNotifications(list);
      setUnreadCount(list.filter(n => !n.isRead).length);
    } catch (err) {
      // Silently fail — badge will just show 0
      console.error('[useNotifications] fetch error:', err.message);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    // Listen for real-time notifications from socket
    const handleNew = (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(c => c + 1);

      // Show a toast immediately
      const isApproval = notification.type === 'approval';
      const isAlert    = notification.type === 'alert';

      if (isApproval) {
        const isApproved = notification.title?.toLowerCase().includes('approved');
        const isRejected = notification.title?.toLowerCase().includes('rejected');
        if (isApproved) {
          toast.success(notification.title, { description: notification.message });
        } else if (isRejected) {
          toast.error(notification.title, { description: notification.message });
        } else {
          toast.info(notification.title, { description: notification.message });
        }
      } else if (isAlert) {
        toast.warning(notification.title, { description: notification.message });
      } else {
        toast.info(notification.title, { description: notification.message });
      }
    };

    socketService.on('NEW_NOTIFICATION', handleNew);

    return () => {
      socketService.off('NEW_NOTIFICATION', handleNew);
    };
  }, [fetchNotifications]);

  const markAllRead = useCallback(async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('[useNotifications] mark-all-read error:', err.message);
    }
  }, []);

  return { notifications, unreadCount, fetchNotifications, markAllRead };
}
