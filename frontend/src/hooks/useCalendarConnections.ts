import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

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
    queryFn: async () => [] as CalendarConnection[],
  });

  const connectCalendar = useMutation({
    mutationFn: async (provider: string) => provider,
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
    mutationFn: async (_: string) => {},
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
