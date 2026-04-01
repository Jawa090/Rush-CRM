import { useQuery } from "@tanstack/react-query";

export interface OneDriveConnection {
  id: string;
  microsoft_email: string | null;
  drive_id: string | null;
  drive_name: string | null;
  sync_enabled: boolean;
  last_sync_at: string | null;
  access_token?: string;
}

export function useOneDriveConnection() {
  return useQuery({
    queryKey: ["onedrive-connection"],
    queryFn: async () => {
      return null as OneDriveConnection | null;
    },
    enabled: true,
  });
}
