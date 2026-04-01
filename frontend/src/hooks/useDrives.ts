import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type DriveType = 'google_drive' | 'onedrive' | 'icloud' | 'network_smb' | 'network_nfs' | 'network_webdav' | 'network_sftp';
export type DriveAccessLevel = 'read_only' | 'upload' | 'download' | 'edit' | 'full_access';
export type DriveOwnership = 'company' | 'personal';

export interface ConnectedDrive {
  id: string;
  org_id: string;
  ownership: DriveOwnership;
  drive_type: DriveType;
  display_name: string;
  access_token?: string | null;
  refresh_token?: string | null;
  token_expires_at?: string | null;
  network_path?: string | null;
  network_protocol?: string | null;
  connected_by: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DrivePermission {
  id: string;
  drive_id: string;
  org_id: string;
  user_id?: string | null;
  role?: string | null;
  access_level: DriveAccessLevel;
  created_at: string;
  updated_at: string;
}

export interface CreateDriveInput {
  ownership: DriveOwnership;
  drive_type: DriveType;
  display_name: string;
  network_path?: string;
  network_protocol?: string;
}

export interface CreatePermissionInput {
  drive_id: string;
  user_id?: string;
  role?: string;
  access_level: DriveAccessLevel;
}

export function useConnectedDrives(ownership?: DriveOwnership) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["connected-drives", profile?.org_id, ownership],
    queryFn: async () => {
      const endpoint = ownership 
        ? `/drives?ownership=${ownership}` 
        : "/drives";
      const { data } = await api.get(endpoint);
      return data as ConnectedDrive[];
    },
    enabled: !!profile?.org_id,
  });
}

export function useDrivePermissions(driveId?: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["drive-permissions", driveId],
    queryFn: async () => {
      const { data } = await api.get(`/drives/${driveId}/permissions`);
      return data as DrivePermission[];
    },
    enabled: !!profile?.org_id && !!driveId,
  });
}

export function useCreateDrive() {
  const queryClient = useQueryClient();
  const { profile, user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateDriveInput) => {
      if (!profile?.org_id || !user?.id) {
        throw new Error("User must be authenticated");
      }

      const { data } = await api.post("/drives", {
        org_id: profile.org_id,
        ownership: input.ownership,
        drive_type: input.drive_type,
        display_name: input.display_name,
        network_path: input.network_path,
        network_protocol: input.network_protocol,
        connected_by: user.id,
      });

      return data as ConnectedDrive;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connected-drives"] });
      toast.success("Drive connected successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to connect drive: ${error.message}`);
    },
  });
}

export function useUpdateDrive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; display_name?: string; network_path?: string; network_protocol?: string; ownership?: DriveOwnership }) => {
      const { data } = await api.put(`/drives/${id}`, updates);
      return data as ConnectedDrive;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connected-drives"] });
      toast.success("Drive updated");
    },
    onError: (error: Error) => toast.error(`Failed to update drive: ${error.message}`),
  });
}

export function useDeleteDrive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (driveId: string) => {
      await api.delete(`/drives/${driveId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connected-drives"] });
      toast.success("Drive disconnected successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to disconnect drive: ${error.message}`);
    },
  });
}

type AppRole = "admin" | "employee" | "hr_manager" | "inventory_manager" | "sales_rep" | "super_admin";

export function useCreateDrivePermission() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (input: CreatePermissionInput) => {
      if (!profile?.org_id) {
        throw new Error("User must be authenticated");
      }

      const { data } = await api.post(`/drives/${input.drive_id}/permissions`, {
        drive_id: input.drive_id,
        org_id: profile.org_id,
        user_id: input.user_id,
        role: input.role,
        access_level: input.access_level,
      });

      return data as DrivePermission;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["drive-permissions", variables.drive_id] });
      toast.success("Permission added successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to add permission: ${error.message}`);
    },
  });
}

export function useDeleteDrivePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ permissionId, driveId }: { permissionId: string; driveId: string }) => {
      await api.delete(`/drives/${driveId}/permissions/${permissionId}`);
      return driveId;
    },
    onSuccess: (driveId) => {
      queryClient.invalidateQueries({ queryKey: ["drive-permissions", driveId] });
      toast.success("Permission removed successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove permission: ${error.message}`);
    },
  });
}

export function useBulkCreateDrivePermissions() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({ driveId, permissions }: { 
      driveId: string; 
      permissions: Array<{ user_id?: string; role?: string; access_level: DriveAccessLevel }> 
    }) => {
      if (!profile?.org_id) {
        throw new Error("User must be authenticated");
      }

      const permissionsToInsert = permissions.map(p => ({
        drive_id: driveId,
        org_id: profile.org_id!,
        user_id: p.user_id,
        role: p.role,
        access_level: p.access_level,
      }));

      const { data } = await api.post(`/drives/${driveId}/permissions/bulk`, {
        permissions: permissionsToInsert,
      });

      return data as DrivePermission[];
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["drive-permissions", variables.driveId] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to set permissions: ${error.message}`);
    },
  });
}
