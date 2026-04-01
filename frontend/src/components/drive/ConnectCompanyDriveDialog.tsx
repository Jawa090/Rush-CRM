import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOrganizationProfiles } from "@/hooks/useTenantQuery";
import { Checkbox } from "@/components/ui/checkbox";
import { Cloud, Server, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  useCreateDrive, 
  useBulkCreateDrivePermissions,
  DriveType,
  DriveAccessLevel 
} from "@/hooks/useDrives";
import { networkDriveService } from "@/services/networkDriveService";
import { toast } from "sonner";

const driveTypes = [
  { id: "google_drive" as DriveType, name: "Google Drive", icon: Cloud, color: "text-red-500", supported: true },
  { id: "onedrive" as DriveType, name: "OneDrive", icon: Cloud, color: "text-blue-500", supported: true },
  { id: "icloud" as DriveType, name: "iCloud", icon: Cloud, color: "text-sky-400", supported: true },
  { id: "network_webdav" as DriveType, name: "WebDAV (Recommended)", icon: Server, color: "text-green-500", supported: true, recommended: true },
  { id: "network_sftp" as DriveType, name: "SFTP / FTP", icon: Server, color: "text-muted-foreground", supported: false, hint: "Path validation only" },
  { id: "network_smb" as DriveType, name: "SMB / CIFS", icon: Server, color: "text-muted-foreground", supported: false, hint: "Path validation only" },
  { id: "network_nfs" as DriveType, name: "NFS", icon: Server, color: "text-muted-foreground", supported: false, hint: "Path validation only" },
];

const accessLevels: { value: DriveAccessLevel; label: string; description: string }[] = [
  { value: "read_only", label: "Read Only", description: "Can only view files" },
  { value: "download", label: "Download", description: "Can view and download files" },
  { value: "upload", label: "Upload", description: "Can view, download, and upload files" },
  { value: "edit", label: "Edit", description: "Can view, download, upload, and edit files" },
  { value: "full_access", label: "Full Access", description: "Complete control including delete" },
];

interface UserPermission {
  userId: string;
  accessLevel: DriveAccessLevel;
}

interface ConnectCompanyDriveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConnectCompanyDriveDialog({ open, onOpenChange }: ConnectCompanyDriveDialogProps) {
  const [step, setStep] = useState<"select" | "configure" | "permissions">("select");
  const [selectedDrive, setSelectedDrive] = useState<DriveType | null>(null);
  const [driveName, setDriveName] = useState("");
  const [networkPath, setNetworkPath] = useState("");
  const [networkUsername, setNetworkUsername] = useState("");
  const [networkPassword, setNetworkPassword] = useState("");
  const [networkDomain, setNetworkDomain] = useState("");
  const [networkPort, setNetworkPort] = useState("");
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle");
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([]);
  
  const { data: profiles } = useOrganizationProfiles();
  const createDrive = useCreateDrive();
  const bulkCreatePermissions = useBulkCreateDrivePermissions();

  const isNetworkDrive = selectedDrive?.startsWith("network_");

  const handleSelectDrive = (driveId: DriveType) => {
    setSelectedDrive(driveId);
    setConnectionStatus("idle");
    setStep("configure");
  };

  const testNetworkConnection = async () => {
    if (!selectedDrive || !networkPath) return;

    setTestingConnection(true);
    setConnectionStatus("idle");

    try {
      const protocol = selectedDrive.replace("network_", "") as "smb" | "nfs" | "webdav" | "sftp";
      
      const result = await networkDriveService.testConnection(
        protocol,
        networkPath,
        {
          username: networkUsername || undefined,
          password: networkPassword || undefined,
          domain: networkDomain || undefined,
          port: networkPort ? parseInt(networkPort, 10) : undefined,
        }
      );

      if (result.success) {
        setConnectionStatus("success");
        toast.success(result.message || "Connection successful");
      } else {
        setConnectionStatus("error");
        toast.error(result.message || "Connection failed");
      }
    } catch (error) {
      console.error("Connection test error:", error);
      setConnectionStatus("error");
      toast.error("Failed to test connection");
    } finally {
      setTestingConnection(false);
    }
  };

  const handleContinueToPermissions = () => {
    if (!driveName) return;
    if (isNetworkDrive && !networkPath) return;
    setStep("permissions");
  };

  const handleConnect = async () => {
    if (!selectedDrive || !driveName) return;

    try {
      const drive = await createDrive.mutateAsync({
        ownership: "company",
        drive_type: selectedDrive,
        display_name: driveName,
        network_path: isNetworkDrive ? networkPath : undefined,
        network_protocol: isNetworkDrive ? selectedDrive.replace("network_", "").toUpperCase() : undefined,
      });

      if (userPermissions.length > 0) {
        await bulkCreatePermissions.mutateAsync({
          driveId: drive.id,
          permissions: userPermissions.map(p => ({
            user_id: p.userId,
            access_level: p.accessLevel,
          })),
        });
      }

      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Failed to connect drive:", error);
    }
  };

  const resetForm = () => {
    setStep("select");
    setSelectedDrive(null);
    setDriveName("");
    setNetworkPath("");
    setNetworkUsername("");
    setNetworkPassword("");
    setNetworkDomain("");
    setNetworkPort("");
    setConnectionStatus("idle");
    setUserPermissions([]);
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  const toggleUserPermission = (userId: string) => {
    setUserPermissions(prev => {
      const exists = prev.find(p => p.userId === userId);
      if (exists) {
        return prev.filter(p => p.userId !== userId);
      }
      return [...prev, { userId, accessLevel: "read_only" as DriveAccessLevel }];
    });
  };

  const updateUserAccessLevel = (userId: string, accessLevel: DriveAccessLevel) => {
    setUserPermissions(prev => 
      prev.map(p => p.userId === userId ? { ...p, accessLevel } : p)
    );
  };

  const isLoading = createDrive.isPending || bulkCreatePermissions.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {step === "select" && "Connect Company Drive"}
            {step === "configure" && `Configure ${driveTypes.find(d => d.id === selectedDrive)?.name}`}
            {step === "permissions" && "Set User Permissions"}
          </DialogTitle>
          <DialogDescription>
            {step === "select" && "Select a cloud storage provider to connect for your organization."}
            {step === "configure" && "Configure the drive settings."}
            {step === "permissions" && "Assign access levels to users who can access this drive."}
          </DialogDescription>
        </DialogHeader>

        {step === "select" && (
          <div className="space-y-4 py-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Tip:</strong> WebDAV is recommended for network drives as it works over HTTP and provides full file browsing support.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {driveTypes.map((drive) => {
                const Icon = drive.icon;
                return (
                  <button
                    key={drive.id}
                    onClick={() => handleSelectDrive(drive.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-colors relative ${
                      drive.supported 
                        ? "border-border hover:border-primary hover:bg-accent" 
                        : "border-dashed border-muted-foreground/30 opacity-60"
                    } ${drive.recommended ? "ring-2 ring-primary ring-offset-2" : ""}`}
                  >
                    {drive.recommended && (
                      <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                        Best
                      </span>
                    )}
                    <Icon className={`h-8 w-8 ${drive.color}`} />
                    <span className="text-sm font-medium text-center">{drive.name}</span>
                    {drive.hint && (
                      <span className="text-xs text-muted-foreground">{drive.hint}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === "configure" && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="driveName">Display Name *</Label>
              <Input
                id="driveName"
                placeholder="e.g., Company Shared Drive"
                value={driveName}
                onChange={(e) => setDriveName(e.target.value)}
              />
            </div>

            {isNetworkDrive && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="networkPath">Network Path *</Label>
                  <Input
                    id="networkPath"
                    placeholder={
                      selectedDrive === "network_smb" ? "\\\\server\\share" :
                      selectedDrive === "network_nfs" ? "server:/path/to/share" :
                      selectedDrive === "network_sftp" ? "server.com:/path/to/folder" :
                      "https://server.com/webdav"
                    }
                    value={networkPath}
                    onChange={(e) => setNetworkPath(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {selectedDrive === "network_smb" && "SMB/CIFS path (e.g., \\\\server\\share)"}
                    {selectedDrive === "network_nfs" && "NFS path (e.g., server:/path/to/share)"}
                    {selectedDrive === "network_sftp" && "SFTP path (e.g., server.com:/path/to/folder)"}
                    {selectedDrive === "network_webdav" && "WebDAV URL (e.g., https://server.com/webdav)"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="networkUsername">Username</Label>
                    <Input
                      id="networkUsername"
                      placeholder="Username"
                      value={networkUsername}
                      onChange={(e) => setNetworkUsername(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="networkPassword">Password</Label>
                    <Input
                      id="networkPassword"
                      type="password"
                      placeholder="Password"
                      value={networkPassword}
                      onChange={(e) => setNetworkPassword(e.target.value)}
                    />
                  </div>
                </div>

                {selectedDrive === "network_smb" && (
                  <div className="space-y-2">
                    <Label htmlFor="networkDomain">Domain (optional)</Label>
                    <Input
                      id="networkDomain"
                      placeholder="DOMAIN"
                      value={networkDomain}
                      onChange={(e) => setNetworkDomain(e.target.value)}
                    />
                  </div>
                )}

                {selectedDrive === "network_sftp" && (
                  <div className="space-y-2">
                    <Label htmlFor="networkPort">Port (optional)</Label>
                    <Input
                      id="networkPort"
                      type="number"
                      placeholder="22"
                      value={networkPort}
                      onChange={(e) => setNetworkPort(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Default is 22 for SFTP</p>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={testNetworkConnection}
                    disabled={!networkPath || testingConnection}
                  >
                    {testingConnection ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      "Test Connection"
                    )}
                  </Button>
                  {connectionStatus === "success" && (
                    <span className="text-sm text-green-600 dark:text-green-400">Connected</span>
                  )}
                  {connectionStatus === "error" && (
                    <span className="text-sm text-red-600 dark:text-red-400">Connection failed</span>
                  )}
                </div>
              </>
            )}

            {!isNetworkDrive && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  You will be redirected to {driveTypes.find(d => d.id === selectedDrive)?.name} to authenticate and authorize access.
                </p>
              </div>
            )}
          </div>
        )}

        {step === "permissions" && (
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Select users and their access level. Users not selected will not have access to this drive.
            </p>
            <div className="max-h-64 overflow-y-auto space-y-3 border rounded-md p-3">
              {profiles?.map((profile) => {
                const permission = userPermissions.find(p => p.userId === profile.id);
                const isSelected = !!permission;
                
                return (
                  <div key={profile.id} className="flex items-center justify-between gap-3 p-2 rounded hover:bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={profile.id}
                        checked={isSelected}
                        onCheckedChange={() => toggleUserPermission(profile.id)}
                      />
                      <label htmlFor={profile.id} className="text-sm cursor-pointer">
                        {profile.full_name || profile.email || "Unknown User"}
                      </label>
                    </div>
                    {isSelected && (
                      <Select
                        value={permission.accessLevel}
                        onValueChange={(value: DriveAccessLevel) => updateUserAccessLevel(profile.id, value)}
                      >
                        <SelectTrigger className="w-32 h-8">
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
                    )}
                  </div>
                );
              }) || (
                <p className="text-sm text-muted-foreground">No users found</p>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          {step !== "select" && (
            <Button 
              variant="outline" 
              onClick={() => setStep(step === "permissions" ? "configure" : "select")}
              disabled={isLoading}
            >
              Back
            </Button>
          )}
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          {step === "configure" && (
            <Button 
              onClick={handleContinueToPermissions} 
              disabled={!driveName || (isNetworkDrive && !networkPath)}
            >
              Next: Set Permissions
            </Button>
          )}
          {step === "permissions" && (
            <Button onClick={handleConnect} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect Drive"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
