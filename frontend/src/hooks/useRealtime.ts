import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

export function useRealtime() {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Initialize socket connection
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []);

  const subscribeToCampaign = (campaignId: string) => {
    socketRef.current?.emit('subscribe:campaign', campaignId);
  };

  const unsubscribeFromCampaign = (campaignId: string) => {
    socketRef.current?.emit('unsubscribe:campaign', campaignId);
  };

  const subscribeToAnalytics = () => {
    socketRef.current?.emit('subscribe:analytics');
  };

  const on = (event: string, callback: (...args: any[]) => void) => {
    socketRef.current?.on(event, callback);
  };

  const off = (event: string, callback?: (...args: any[]) => void) => {
    socketRef.current?.off(event, callback);
  };

  return {
    socket: socketRef.current,
    isConnected,
    subscribeToCampaign,
    unsubscribeFromCampaign,
    subscribeToAnalytics,
    on,
    off,
  };
}

// Hook for campaign real-time stats
export function useCampaignRealtime(campaignId: string) {
  const { subscribeToCampaign, unsubscribeFromCampaign, on, off } = useRealtime();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!campaignId) return;

    subscribeToCampaign(campaignId);

    const handleStats = (data: any) => {
      setStats(data);
    };

    const handleOpened = (data: any) => {
      setStats((prev: any) => prev ? { ...prev, opened_count: prev.opened_count + 1 } : null);
    };

    const handleClicked = (data: any) => {
      setStats((prev: any) => prev ? { ...prev, clicked_count: prev.clicked_count + 1 } : null);
    };

    on('campaign:stats', handleStats);
    on('campaign:opened', handleOpened);
    on('campaign:clicked', handleClicked);

    return () => {
      unsubscribeFromCampaign(campaignId);
      off('campaign:stats', handleStats);
      off('campaign:opened', handleOpened);
      off('campaign:clicked', handleClicked);
    };
  }, [campaignId]);

  return stats;
}

// Hook for analytics real-time updates
export function useAnalyticsRealtime() {
  const { subscribeToAnalytics, on, off } = useRealtime();
  const [metrics, setMetrics] = useState<Record<string, any>>({});

  useEffect(() => {
    subscribeToAnalytics();

    const handleUpdate = (data: any) => {
      setMetrics((prev) => ({ ...prev, ...data }));
    };

    const handleMetric = (data: any) => {
      setMetrics((prev) => ({ ...prev, [data.metric]: data.value }));
    };

    on('analytics:update', handleUpdate);
    on('metric:update', handleMetric);

    return () => {
      off('analytics:update', handleUpdate);
      off('metric:update', handleMetric);
    };
  }, []);

  return metrics;
}
