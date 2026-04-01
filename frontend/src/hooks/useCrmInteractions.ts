import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsApi, dealsApi, contactsApi, companiesApi, activitiesApi } from '@/lib/api';
import { toast } from 'sonner';

export function useActivities(entityType: string, entityId: string) {
  return useQuery({
    queryKey: ['activities', entityType, entityId],
    queryFn: () => activitiesApi.getByEntity(entityType, entityId),
    enabled: !!entityId,
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      entityType: string;
      entityId: string;
      activityType: string;
      title?: string;
      description?: string;
    }) => {
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['activities', vars.entityType, vars.entityId] });
    },
  });
}

export function useLead(id: string) {
  return useQuery({
    queryKey: ['lead', id],
    queryFn: () => leadsApi.getById(id),
    enabled: !!id,
  });
}

export function useDeal(id: string) {
  return useQuery({
    queryKey: ['deal', id],
    queryFn: () => dealsApi.getById(id),
    enabled: !!id,
  });
}

export function useContact(id: string) {
  return useQuery({
    queryKey: ['contact', id],
    queryFn: () => contactsApi.getById(id),
    enabled: !!id,
  });
}

export function useCompany(id: string) {
  return useQuery({
    queryKey: ['company', id],
    queryFn: () => companiesApi.getById(id),
    enabled: !!id,
  });
}

// Comments timeline helpers (stubs to support UI until backend supports comments)
export function useComments(entityType: string, entityId: string) {
  const queryKey = ['comments', entityType, entityId];
  return useQuery({
    queryKey,
    queryFn: async () => {
      // Placeholder: fetch from API if available in future
      return [];
    },
    enabled: !!entityId && !!entityType,
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { entity_type: string; entity_id: string; content: string }) => {
      // Placeholder: would call API to create a comment
      return payload;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['comments', vars.entity_type, vars.entity_id] });
      toast.success('Comment created');
    },
    onError: (error: any) => toast.error(`Failed to create comment: ${error?.message ?? error}`),
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: string; entity_type: string; entity_id: string }) => payload,
    onSuccess: (vars) => {
      queryClient.invalidateQueries({ queryKey: ['comments', vars.entity_type, vars.entity_id] });
      toast.success('Comment deleted');
    },
    onError: (error: any) => toast.error(`Failed to delete comment: ${error?.message ?? error}`),
  });
}

export function useUpdateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: string; content: string; entity_type: string; entity_id: string }) => payload,
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['comments', vars.entity_type, vars.entity_id] });
      toast.success('Comment updated');
    },
    onError: (error: any) => toast.error(`Failed to update comment: ${error?.message ?? error}`),
  });
}
