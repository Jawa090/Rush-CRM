import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Simulate real-time notifications (in production, use WebSocket)
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate random notifications for demo
      if (Math.random() < 0.1) { // 10% chance every 30 seconds
        const notification: Notification = {
          id: `notif-${Date.now()}`,
          title: 'New Lead',
          message: 'A new lead has been assigned to you',
          type: 'info',
          timestamp: new Date(),
          read: false,
          actionUrl: '/crm/leads'
        };
        
        setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep last 50
        setUnreadCount(prev => prev + 1);
        
        toast.info(notification.message, {
          action: {
            label: 'View',
            onClick: () => window.location.href = notification.actionUrl || '/'
          }
        });
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    setUnreadCount(0);
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll
  };
}