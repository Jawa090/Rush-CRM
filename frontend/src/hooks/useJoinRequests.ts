import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface JoinRequest {
  id: string;
  email: string;
  full_name: string;
  message: string | null;
  requested_role: string;
  status: string;
  created_at: string;
}

export function useOrgJoinRequests() {
  return useQuery({
    queryKey: ['org_join_requests'],
    queryFn: async () => [] as JoinRequest[],
  });
}

export function useMyJoinRequests() {
  return useQuery({
    queryKey: ['my_join_requests'],
    queryFn: async () => [] as JoinRequest[],
  });
}

export function useCreateJoinRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ org_id, message, requested_role }: { org_id: string; message?: string; requested_role?: string }) => {
      return { org_id, message, requested_role };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my_join_requests'] });
      toast.success('Join request sent successfully');
    },
    onError: (err: Error) => toast.error('Failed: ' + err.message),
  });
}

export function useApproveJoinRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ requestId, role }: { requestId: string; role: string }) => {
      return { requestId, role };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org_join_requests'] });
      toast.success('Request approved');
    },
    onError: (err: Error) => toast.error('Failed: ' + err.message),
  });
}

export function useRejectJoinRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ requestId, reason }: { requestId: string; reason?: string }) => {
      return { requestId, reason };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org_join_requests'] });
      toast.success('Request rejected');
    },
    onError: (err: Error) => toast.error('Failed: ' + err.message),
  });
}
