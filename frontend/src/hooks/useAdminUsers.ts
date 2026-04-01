import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, rolesApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  department: string | null;
  phone: string | null;
  job_title: string | null;
  status: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  role: string | null;
  role_id: string | null;
  role_name: string | null;
}

export interface Invite {
  id: string;
  email: string;
  role: string;
  invited_by: string | null;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

export function useAdminUsers() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const orgId = profile?.org_id;

  const usersQuery = useQuery({
    queryKey: ['admin-users', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const users = await usersApi.getAll();
      return users as AdminUser[];
    },
    enabled: !!orgId,
  });

  const rolesQuery = useQuery({
    queryKey: ['admin-org-roles', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const roles = await rolesApi.getAll();
      return roles as any[];
    },
    enabled: !!orgId,
  });

  const sendInvite = useMutation({
    mutationFn: async ({ email, role, fullName, department }: { email: string; role: string; fullName: string; department?: string }) => {
      const { organizationApi } = await import('@/lib/api');
      return organizationApi.createInvite({ email, role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-invites'] });
      toast.success('Invitation sent successfully');
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const adminCreateUser = useMutation({
    mutationFn: async ({ email, fullName, roleSlug, department, phone }: { email: string; fullName: string; roleSlug: string; department?: string; phone?: string }) => {
      return usersApi.create({ email, fullName, role: roleSlug, department, phone });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User created successfully');
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const updateUser = useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: Partial<{ full_name: string; department: string; status: string; job_title: string; phone: string }> }) => {
      return usersApi.update(userId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User updated successfully');
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const deleteInvite = useMutation({
    mutationFn: async (inviteId: string) => {
      const { organizationApi } = await import('@/lib/api');
      return organizationApi.deleteInvite(inviteId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-invites'] });
      toast.success('Invitation deleted');
    },
  });

  const resetPassword = useMutation({
    mutationFn: async (userId: string) => {
      return usersApi.resetPassword(userId);
    },
    onSuccess: () => {
      toast.success('Password reset email sent');
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  return {
    users: usersQuery.data || [],
    invites: [] as Invite[],
    roles: rolesQuery.data || [],
    isLoading: usersQuery.isLoading,
    sendInvite,
    adminCreateUser,
    updateUser,
    deleteInvite,
    resetPassword,
  };
}
