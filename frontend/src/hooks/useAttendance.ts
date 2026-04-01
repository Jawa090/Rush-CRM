import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '@/lib/api';
import { toast } from 'sonner';

export function useAttendance(params?: { 
  date?: string; 
  userId?: string; 
  employee_id?: string; 
  status?: string; 
  limit?: number 
}) {
  return useQuery({
    queryKey: ['attendance', params],
    queryFn: () => attendanceApi.getAll(params),
  });
}

export function useAttendanceRecord(id: string) {
  return useQuery({
    queryKey: ['attendance', id],
    queryFn: () => attendanceApi.getById(id),
    enabled: !!id,
  });
}

export function useAttendanceStats(params?: { 
  startDate?: string; 
  endDate?: string; 
  date?: string 
}) {
  return useQuery({
    queryKey: ['attendance', 'stats', params],
    queryFn: () => attendanceApi.getStats(params),
  });
}

export function useClockIn() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: attendanceApi.clockIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast.success('Clocked in successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to clock in');
    },
  });
}

export function useClockOut() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: attendanceApi.clockOut,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast.success('Clocked out successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to clock out');
    },
  });
}

export function useCreateAttendance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: attendanceApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast.success('Attendance record created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create attendance record');
    },
  });
}

export function useUpdateAttendance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      attendanceApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast.success('Attendance updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update attendance');
    },
  });
}