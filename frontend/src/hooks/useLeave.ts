import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { leaveApi } from '@/lib/api';
import { toast } from 'sonner';

export function useLeaveRequests(params?: { 
  status?: string; 
  userId?: string; 
  employee_id?: string; 
  limit?: number 
}) {
  return useQuery({
    queryKey: ['leave', 'requests', params],
    queryFn: () => leaveApi.getAll(params),
  });
}

export function useLeaveRequest(id: string) {
  return useQuery({
    queryKey: ['leave', 'requests', id],
    queryFn: () => leaveApi.getById(id),
    enabled: !!id,
  });
}

export function useLeaveBalance(params?: { 
  userId?: string; 
  employee_id?: string 
}) {
  return useQuery({
    queryKey: ['leave', 'balance', params],
    queryFn: () => leaveApi.getBalance(params),
  });
}

export function useLeaveTypes() {
  return useQuery({
    queryKey: ['leave', 'types'],
    queryFn: () => leaveApi.getTypes(),
  });
}

export function useCreateLeaveRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: leaveApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave'] });
      toast.success('Leave request submitted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit leave request');
    },
  });
}

export function useUpdateLeaveRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      leaveApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave'] });
      toast.success('Leave request updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update leave request');
    },
  });
}

export function useApproveLeave() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: leaveApi.approve,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave'] });
      toast.success('Leave request approved');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve leave request');
    },
  });
}

export function useRejectLeave() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => 
      leaveApi.reject(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave'] });
      toast.success('Leave request rejected');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reject leave request');
    },
  });
}

export function useCreateLeaveType() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: leaveApi.createType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave', 'types'] });
      toast.success('Leave type created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create leave type');
    },
  });
}