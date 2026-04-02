import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Cloud, Server, MoreVertical, Settings, Trash2, Loader2, FolderOpen, Link } from "lucide-react";
import { useConnectedDrives, useDeleteDrive, ConnectedDrive } from "@/hooks/useDrives";
import { useOneDriveConnection } from "@/hooks/useOneDriveConnection";
import { googleDriveService } from "@/services/googleDriveService";
import { oneDriveService } from "@/services/oneDriveService";
import { toast } from "sonner";
import { useCustomDialog } from "@/contexts/DialogContext";

const driveTypeIcons: Record<string, { icon: typeof Cloud; color: string }> = {
  google_drive: { icon: Cloud, color: "text-red-500" },
  onedrive: { icon: Cloud, color: "text-blue-500" },
  icloud: { icon: Cloud, color: "text-sky-400" },
  network_smb: { icon: Server, color: "text-orange-500" },
  network_nfs: { icon: Server, color: "text-amber-500" },
  network_webdav: { icon: Server, color: "text-yellow-500" },
  network_sftp: { icon: Server, color: "text-purple-500" },
};

const driveTypeLabels: Record<string, string> = {
  google_drive: "Google Drive",
  onedrive: "OneDrive",
  icloud: "iCloud",
  network_smb: "SMB",
  network_nfs: "NFS",
  network_webdav: "WebDAV",
  network_sftp: "SFTP",
};

interface PersonalDrivesListProps {
  onBrowse?: (drive: ConnectedDrive) => void;
}

export function PersonalDrivesList({ onBrowse }: PersonalDrivesListProps) {
  const { data: drives, isLoading } = useConnectedDrives("personal");
  const { data: oneDriveConn } = useOneDriveConnection();
  const { confirm } = useCustomDialog();
  const deleteDrive = useDeleteDrive();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!drives || drives.length === 0) {
    return null;
  }

  const handleDelete = async (driveId: string) => {
    if (await confirm("Are you sure you want to disconnect this personal drive?", { variant: 'destructive', title: 'Disconnect Personal Drive' })) {
      await deleteDrive.mutateAsync(driveId);
    }
  };

  const handleConnect = async (drive: ConnectedDrive) => {
    if (drive.drive_type === "google_drive") {
      try {
        const redirectUri = `${window.location.origin}/collaboration/drive`;
        const authUrl = await googleDriveService.getAuthUrl(redirectUri, drive.id, drive.ownership);
        window.location.href = authUrl;
      } catch (error: any) {
        toast.error(error.message || "Failed to start authentication");
      }
    } else if (drive.drive_type === "onedrive") {
      try {
        const authUrl = await oneDriveService.getAuthUrl();
        window.location.href = authUrl;
      } catch (error: any) {
        toast.error(error.message || "Failed to start OneDrive authentication");
      }
    } else {
      toast.info("OAuth for this provider is not yet implemented");
    }
  };

  const isConnected = (drive: ConnectedDrive) => {
    const isNetworkDrive = ["network_smb", "network_nfs", "network_webdav", "network_sftp"].includes(drive.drive_type);
    if (isNetworkDrive) return true;
    if (drive.drive_type === "onedrive") return !!oneDriveConn?.access_token;
    return !!drive.access_token;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">My Personal Drives</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {drives.map((drive) => {
            const typeInfo = driveTypeIcons[drive.drive_type] || { icon: Cloud, color: "text-muted-foreground" };
            const Icon = typeInfo.icon;

            return (
              <div
                key={drive.id}
                className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Icon className={`h-5 w-5 ${typeInfo.color}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{drive.display_name}</p>
                      <Badge variant="outline" className="text-xs">
                        {driveTypeLabels[drive.drive_type] || drive.drive_type}
                      </Badge>
                      {!isConnected(drive) && (
                        <Badge variant="outline" className="text-xs text-yellow-600 dark:text-yellow-400">
                          Not Connected
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">Personal</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isConnected(drive) && onBrowse && (
                    <Button variant="outline" size="sm" onClick={() => onBrowse(drive)}>
                      <FolderOpen className="h-4 w-4 mr-1" />
                      Browse
                    </Button>
                  )}
                  {!isConnected(drive) && (
                    <Button variant="outline" size="sm" onClick={() => handleConnect(drive)}>
                      <Link className="h-4 w-4 mr-1" />
                      Connect
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => handleDelete(drive.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Disconnect
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
