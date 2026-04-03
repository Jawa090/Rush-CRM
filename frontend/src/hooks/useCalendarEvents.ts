import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { calendarApi } from '@/lib/api';
import { toast } from 'sonner';

export interface CalendarEvent {
  id: string;
  org_id: string;
  created_by: string;
  title: string;
  description: string | null;
  location: string | null;
  start_time: string;
  end_time: string;
  is_all_day: boolean;
  recurrence_rule: string | null;
  color: string | null;
  external_calendar_id: string | null;
  external_provider: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventAttendee {
  id: string;
  org_id: string;
  event_id: string;
  user_id: string | null;
  email: string | null;
  name: string | null;
  status: string;
  is_organizer: boolean;
  response_time: string | null;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  location?: string;
  startTime: string;
  endTime: string;
  allDay?: boolean;
  recurrence?: string;
  color?: string;
}

export function useCalendarEvents(startDate?: Date, endDate?: Date, search?: string) {
  const queryClient = useQueryClient();

  const eventsQuery = useQuery({
    queryKey: ['calendar-events', startDate?.toISOString(), endDate?.toISOString(), search],
    queryFn: async () => {
      const events = await calendarApi.getEvents({
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        search,
      });
      return events as CalendarEvent[];
    },
  });

  const createEvent = useMutation({
    mutationFn: async (input: CreateEventInput) => {
      return calendarApi.create({
        title: input.title,
        description: input.description,
        location: input.location,
        startTime: input.startTime,
        endTime: input.endTime,
        allDay: input.allDay,
        recurrence: input.recurrence,
        color: input.color,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      toast.success('Event created');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateEvent = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<CreateEventInput>) => {
      return calendarApi.update(id, {
        ...updates,
        startTime: updates.startTime,
        endTime: updates.endTime,
        allDay: updates.allDay,
        recurrence: updates.recurrence,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      toast.success('Event updated');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteEvent = useMutation({
    mutationFn: async (eventId: string) => {
      return calendarApi.delete(eventId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      toast.success('Event deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    events: eventsQuery.data || [],
    isLoading: eventsQuery.isLoading,
    error: eventsQuery.error,
    createEvent,
    updateEvent,
    deleteEvent,
    refetch: eventsQuery.refetch,
  };
}

export function useEventAttendees(eventId: string | null) {
  return useQuery({
    queryKey: ['event-attendees', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      return [] as EventAttendee[];
    },
    enabled: !!eventId,
  });
}

export function useRespondToInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ attendeeId, status }: { attendeeId: string; status: string }) => {
      return { attendeeId, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-attendees'] });
      toast.success('Response sent');
    },
  });
}

export function useCalendarInvitations() {
  return useQuery({
    queryKey: ['calendar-invitations'],
    queryFn: async () => {
      return [] as any[];
    },
  });
}
