import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface EntityDriveFile {
  id: string;
  org_id: string;
  entity_type: string;
  entity_id: string;
  provider: string;
  drive_connection_id: string;
  file_id: string;
  file_name: string;
  mime_type: string | null;
  file_size: number | null;
  web_view_link: string | null;
  thumbnail_link: string | null;
  folder_path: string | null;
  linked_by: string;
  created_at: string;
}

export function useEntityDriveFiles(entityType: string, entityId: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["entity-drive-files", entityType, entityId],
    queryFn: async () => {
      const { data } = await api.get(`/drives/entity-files?entityType=${entityType}&entityId=${entityId}`);
      return data as EntityDriveFile[];
    },
    enabled: !!profile?.org_id && !!entityId,
  });
}

export function useLinkDriveFile() {
  const queryClient = useQueryClient();
  const { profile, user } = useAuth();

  return useMutation({
    mutationFn: async (input: {
      entity_type: string;
      entity_id: string;
      provider: string;
      drive_connection_id: string;
      file_id: string;
      file_name: string;
      mime_type?: string;
      file_size?: number;
      web_view_link?: string;
      thumbnail_link?: string;
      folder_path?: string;
    }) => {
      if (!profile?.org_id || !user?.id) throw new Error("Not authenticated");

      const { data } = await api.post("/drives/entity-files", {
        org_id: profile.org_id,
        entity_type: input.entity_type,
        entity_id: input.entity_id,
        provider: input.provider,
        drive_connection_id: input.drive_connection_id,
        file_id: input.file_id,
        file_name: input.file_name,
        mime_type: input.mime_type || null,
        file_size: input.file_size || null,
        web_view_link: input.web_view_link || null,
        thumbnail_link: input.thumbnail_link || null,
        folder_path: input.folder_path || null,
        linked_by: user.id,
      });

      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["entity-drive-files", vars.entity_type, vars.entity_id],
      });
      toast.success("File linked successfully");
    },
    onError: (error: Error) => {
      if (error.message?.includes("duplicate")) {
        toast.info("This file is already linked");
      } else {
        toast.error(`Failed to link file: ${error.message}`);
      }
    },
  });
}

export function useUnlinkDriveFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, entityType, entityId }: { id: string; entityType: string; entityId: string }) => {
      await api.delete(`/drives/entity-files/${id}`);
      return { entityType, entityId };
    },
    onSuccess: (vars) => {
      queryClient.invalidateQueries({
        queryKey: ["entity-drive-files", vars.entityType, vars.entityId],
      });
      toast.success("File unlinked");
    },
    onError: (error: Error) => {
      toast.error(`Failed to unlink file: ${error.message}`);
    },
  });
}
