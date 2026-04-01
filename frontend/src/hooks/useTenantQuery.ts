import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, rolesApi } from '@/lib/api';
import { toast } from 'sonner';

export function useOrganizationProfiles() {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: () => usersApi.getAll(),
  });
}

export function useOrganizationRoles() {
  return useQuery({
    queryKey: ['user_roles'],
    queryFn: () => rolesApi.getAll(),
  });
}

export function useOrganizationPermissions() {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: () => rolesApi.getAll(),
  });
}

export function useOrganizationInvites() {
  return useQuery({
    queryKey: ['organization_invites'],
    queryFn: () => [] as any[],
  });
}

export function useCreateInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      return { email, role };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization_invites'] });
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      return usersApi.update(userId, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_roles'] });
      toast.success('Role updated');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
