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
import { Cloud, CheckCircle2 } from "lucide-react";
import { useCreateDrive } from "@/hooks/useDrives";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { googleDriveService } from "@/services/googleDriveService";
import { oneDriveService } from "@/services/oneDriveService";
import { toast } from "sonner";

const personalDriveTypes = [
  { id: "google_drive", name: "Google Drive", icon: Cloud, color: "text-red-500", bgColor: "bg-red-500/10" },
  { id: "onedrive", name: "OneDrive", icon: Cloud, color: "text-blue-500", bgColor: "bg-blue-500/10" },
  { id: "icloud", name: "iCloud", icon: Cloud, color: "text-sky-400", bgColor: "bg-sky-400/10" },
];

interface ConnectPersonalDriveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connectedDrives?: string[];
}

export function ConnectPersonalDriveDialog({ 
  open, 
  onOpenChange, 
  connectedDrives = [] 
}: ConnectPersonalDriveDialogProps) {
  const [connecting, setConnecting] = useState<string | null>(null);
  const { user } = useAuth();
  const { organization } = useOrganization();
  const createDrive = useCreateDrive();

  const handleConnect = async (driveId: string) => {
    if (!user || !organization) {
      toast.error("You must be logged in to connect a drive");
      return;
    }

    setConnecting(driveId);

    try {
      const drive = await createDrive.mutateAsync({
        ownership: "personal",
        drive_type: driveId as "google_drive" | "onedrive" | "icloud",
        display_name: `My ${personalDriveTypes.find(d => d.id === driveId)?.name || "Drive"}`,
      });

      if (driveId === "google_drive") {
        const redirectUri = `${window.location.origin}/collaboration/drive`;
        try {
          const authUrl = await googleDriveService.getAuthUrl(redirectUri, drive.id, "personal");
          window.location.href = authUrl;
        } catch (err: any) {
          toast.error(err.message || "Failed to initiate Google Sign-In");
          setConnecting(null);
        }
        return;
      }

      if (driveId === "onedrive") {
        try {
          const authUrl = await oneDriveService.getAuthUrl();
          window.location.href = authUrl;
        } catch (err: any) {
          toast.error(err.message || "Failed to start OneDrive authentication");
          setConnecting(null);
        }
        return;
      }

      toast.info(`${personalDriveTypes.find(d => d.id === driveId)?.name} connection coming soon!`);
      setConnecting(null);
    } catch (error) {
      console.error("Error connecting drive:", error);
      toast.error("Failed to connect drive");
      setConnecting(null);
    }
  };

  const isConnected = (driveId: string) => connectedDrives.includes(driveId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Personal Drive</DialogTitle>
          <DialogDescription>
            Connect your personal cloud storage to access your files.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {personalDriveTypes.map((drive) => {
            const Icon = drive.icon;
            const connected = isConnected(drive.id);
            const isConnecting = connecting === drive.id;
            
            return (
              <div
                key={drive.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  connected ? "border-green-500/50 bg-green-500/5" : "border-border"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${drive.bgColor}`}>
                    <Icon className={`h-5 w-5 ${drive.color}`} />
                  </div>
                  <div>
                    <p className="font-medium">{drive.name}</p>
                {connected && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Connected
                  </p>
                )}
                  </div>
                </div>
                
                {connected ? (
                  <Button variant="outline" size="sm">
                    Disconnect
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    onClick={() => handleConnect(drive.id)}
                    disabled={isConnecting}
                  >
                    {isConnecting ? "Connecting..." : "Connect"}
                  </Button>
                )}
              </div>
            );
          })}
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
