import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rolesApi, api } from '@/lib/api';
import { toast } from 'sonner';

export interface Role {
  id: string;
  org_id: string;
  name: string;
  slug?: string;
  description: string | null;
  color: string | null;
  user_count?: number;
}

export interface RolePermission {
  id?: string;
  role_id: string;
  module: string;
  action: string;
  is_granted: boolean;
}

export function useAdminRoles() {
  const queryClient = useQueryClient();

  const rolesQuery = useQuery({
    queryKey: ['admin-roles'],
    queryFn: () => rolesApi.getAll() as Promise<Role[]>,
  });

  const permissionsQuery = useQuery({
    queryKey: ['admin-role-permissions'],
    queryFn: () => api.get<RolePermission[]>('/roles/permissions').catch(() => [] as RolePermission[]),
  });

  const createRole = useMutation({
    mutationFn: async ({ name, description, color }: { name: string; description?: string; color?: string }) => {
      return rolesApi.create({ name, description, permissions: [] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      toast.success('Role created');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateRole = useMutation({
    mutationFn: async ({ roleId, updates }: { roleId: string; updates: Partial<Role> }) => {
      return rolesApi.update(roleId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      toast.success('Role updated');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteRole = useMutation({
    mutationFn: (roleId: string) => rolesApi.delete(roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      toast.success('Role deleted');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const togglePermission = useMutation({
    mutationFn: async ({ roleId, module, action, isGranted }: { roleId: string; module: string; action: string; isGranted: boolean }) => {
      return api.post('/roles/permissions/toggle', { roleId, module, action, isGranted });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-role-permissions'] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const setModulePermissions = useMutation({
    mutationFn: async ({ roleId, module, actions }: { roleId: string; module: string; actions: string[] }) => {
      return api.post('/roles/permissions/module', { roleId, module, actions });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-role-permissions'] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const logPermissionChange = async (action: string, entityType: string, entityId: string, oldValue: any, newValue: any) => {
    try {
      await api.post('/roles/audit-log', { action, entityType, entityId, oldValue, newValue });
    } catch { /* non-critical */ }
  };

  return {
    roles: (rolesQuery.data || []) as Role[],
    permissions: (permissionsQuery.data || []) as RolePermission[],
    isLoading: rolesQuery.isLoading,
    isPermissionsLoading: permissionsQuery.isLoading,
    createRole,
    updateRole,
    deleteRole,
    togglePermission,
    setModulePermissions,
    logPermissionChange,
  };
}
