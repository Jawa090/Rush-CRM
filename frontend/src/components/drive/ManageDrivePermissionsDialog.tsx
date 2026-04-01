import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrganizationProfiles } from "@/hooks/useTenantQuery";
import { 
  useDrivePermissions, 
  useCreateDrivePermission,
  useDeleteDrivePermission,
  ConnectedDrive,
  DriveAccessLevel 
} from "@/hooks/useDrives";

const accessLevels: { value: DriveAccessLevel; label: string }[] = [
  { value: "read_only", label: "Read Only" },
  { value: "download", label: "Download" },
  { value: "upload", label: "Upload" },
  { value: "edit", label: "Edit" },
  { value: "full_access", label: "Full Access" },
];

interface ManageDrivePermissionsDialogProps {
  drive: ConnectedDrive | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageDrivePermissionsDialog({ 
  drive, 
  open, 
  onOpenChange 
}: ManageDrivePermissionsDialogProps) {
  const { data: profiles } = useOrganizationProfiles();
  const { data: existingPermissions, isLoading: loadingPermissions } = useDrivePermissions(drive?.id);
  const createPermission = useCreateDrivePermission();
  const deletePermission = useDeleteDrivePermission();

  const [newUserId, setNewUserId] = useState<string>("");
  const [newAccessLevel, setNewAccessLevel] = useState<DriveAccessLevel>("read_only");

  // Get users who don't already have permissions
  const availableUsers = profiles?.filter(
    p => !existingPermissions?.some(ep => ep.user_id === p.id)
  ) || [];

  const handleAddPermission = async () => {
    if (!drive || !newUserId) return;

    await createPermission.mutateAsync({
      drive_id: drive.id,
      user_id: newUserId,
      access_level: newAccessLevel,
    });

    setNewUserId("");
    setNewAccessLevel("read_only");
  };

  const handleRemovePermission = async (permissionId: string) => {
    if (!drive) return;
    await deletePermission.mutateAsync({ permissionId, driveId: drive.id });
  };

  if (!drive) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage Permissions</DialogTitle>
          <DialogDescription>
            Configure who can access "{drive.display_name}" and their permission level.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Add new permission */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Add User</label>
            <div className="flex gap-2">
              <Select value={newUserId} onValueChange={setNewUserId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select user..." />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.length === 0 ? (
                    <div className="py-2 px-2 text-sm text-muted-foreground text-center">
                      All users have access
                    </div>
                  ) : (
                    availableUsers.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.full_name || profile.email}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Select value={newAccessLevel} onValueChange={(v: DriveAccessLevel) => setNewAccessLevel(v)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {accessLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={handleAddPermission} 
                disabled={!newUserId || createPermission.isPending}
              >
                {createPermission.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Add"
                )}
              </Button>
            </div>
          </div>

          {/* Existing permissions */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Current Permissions</label>
            {loadingPermissions ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : existingPermissions && existingPermissions.length > 0 ? (
              <div className="border rounded-md divide-y max-h-48 overflow-y-auto">
                {existingPermissions.map((perm) => {
                  const profile = profiles?.find(p => p.id === perm.user_id);
                  const accessLabel = accessLevels.find(l => l.value === perm.access_level)?.label;

                  return (
                    <div key={perm.id} className="flex items-center justify-between p-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {profile?.full_name || profile?.email || perm.role || "Unknown"}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {accessLabel}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleRemovePermission(perm.id)}
                        disabled={deletePermission.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center border rounded-md">
                No permissions set. Only admins can access this drive.
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
