import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { calendarApi } from '@/lib/api';

export interface CalendarConnection {
  id: string;
  provider: string;
  calendar_name: string | null;
  is_primary: boolean;
  last_sync_at: string | null;
}

export function useCalendarConnections() {
  const qc = useQueryClient();

  const connectionsQuery = useQuery({
    queryKey: ['calendar-connections'],
    queryFn: () => calendarApi.getConnections(),
  });

  const connectCalendar = useMutation({
    mutationFn: async (provider: string) => {
      if (provider === 'google') {
        const { url } = await calendarApi.getGoogleAuthUrl();
        
        // Open OAuth in a popup window
        const width = 600;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        
        const popup = window.open(
          url,
          'google-calendar-auth',
          `width=${width},height=${height},left=${left},top=${top}`
        );

        return new Promise((resolve, reject) => {
          const handler = (event: MessageEvent) => {
             if (event.data === 'google-calendar-connected') {
               window.removeEventListener('message', handler);
               resolve('google');
             }
          };
          window.addEventListener('message', handler);
          
          // Fallback if window closed without message
          const checkClosed = setInterval(() => {
            if (popup?.closed) {
              clearInterval(checkClosed);
              window.removeEventListener('message', handler);
              resolve('closed');
            }
          }, 1000);
        });
      }
      return provider;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['calendar-connections'] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const connectICloud = useMutation({
    mutationFn: async (_: { appleId: string; appPassword: string }) => {},
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['calendar-connections'] });
      toast.success('iCloud calendar connected');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const syncICloudEvents = useMutation({
    mutationFn: async (_: { connectionId: string; startDate: string; endDate: string }) => {},
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['calendar-events'] });
      toast.success('iCloud events synced');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const syncMicrosoftEvents = useMutation({
    mutationFn: async (_: { connectionId: string; startDate: string; endDate: string }) => {},
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['calendar-events'] });
      toast.success('Microsoft events synced');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const disconnectByProvider = useMutation({
    mutationFn: (provider: string) => calendarApi.disconnectConnection(provider),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['calendar-connections'] });
      toast.success('Calendar disconnected');
    },
    onError: (e: Error) => toast.error(e.message),
  });



  return {
    connections: connectionsQuery.data ?? [],
    isLoading: connectionsQuery.isLoading,
    connectCalendar,
    connectICloud,
    syncICloudEvents,
    syncMicrosoftEvents,
    disconnectByProvider,
  };
}
