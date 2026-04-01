import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RefreshCw, Trash2, Calendar, Settings } from "lucide-react";

interface ManageCalendarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  providerId: string;
  providerName: string;
  onSync: () => void;
  onDisconnect: () => void;
}

const providerIcons: Record<string, React.ReactNode> = {
  google: (
    <svg viewBox="0 0 24 24" className="w-7 h-7">
      <rect x="3" y="4" width="18" height="18" rx="2" fill="#4285F4" />
      <rect x="3" y="4" width="18" height="5" fill="#1A73E8" />
      <text x="12" y="17" textAnchor="middle" fontSize="8" fontWeight="bold" fill="white">31</text>
    </svg>
  ),
  icloud: (
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83" />
    </svg>
  ),
  office365: (
    <svg viewBox="0 0 24 24" className="w-7 h-7">
      <path fill="#EB3C00" d="M7 2L2 6v12l5 4 10-2V4L7 2z" />
      <path fill="#FF6C40" d="M17 4l-10 2v16l10-2V4z" />
      <path fill="#FFA080" d="M22 6l-5-2v16l5-2V6z" />
    </svg>
  ),
};

export function ManageCalendarDialog({
  open,
  onOpenChange,
  providerId,
  providerName,
  onSync,
  onDisconnect,
}: ManageCalendarDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-row items-center gap-4 pb-4">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
            {providerIcons[providerId] || <Calendar className="w-7 h-7" />}
          </div>
          <div>
            <DialogTitle className="text-lg">{providerName}</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Manage your calendar connection
            </p>
          </div>
        </DialogHeader>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-12"
            onClick={() => {
              onSync();
              onOpenChange(false);
            }}
          >
            <RefreshCw className="w-5 h-5 text-primary" />
            <div className="text-left">
              <p className="font-medium">Sync now</p>
              <p className="text-xs text-muted-foreground">Force synchronization with {providerName}</p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-12"
            onClick={() => {}}
          >
            <Settings className="w-5 h-5 text-muted-foreground" />
            <div className="text-left">
              <p className="font-medium">Settings</p>
              <p className="text-xs text-muted-foreground">Configure sync options</p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-12 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => {
              onDisconnect();
              onOpenChange(false);
            }}
          >
            <Trash2 className="w-5 h-5" />
            <div className="text-left">
              <p className="font-medium">Disconnect</p>
              <p className="text-xs text-muted-foreground">Remove {providerName} connection</p>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
