import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ExternalLink, ShieldCheck } from "lucide-react";

interface ICloudCredentialsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (appleId: string, appPassword: string) => Promise<void>;
  isConnecting: boolean;
}

export function ICloudCredentialsDialog({
  open,
  onOpenChange,
  onConnect,
  isConnecting,
}: ICloudCredentialsDialogProps) {
  const [appleId, setAppleId] = useState("");
  const [appPassword, setAppPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appleId.trim() || !appPassword.trim()) return;
    await onConnect(appleId.trim(), appPassword.trim());
  };

  const handleClose = (open: boolean) => {
    if (!isConnecting) {
      onOpenChange(open);
      if (!open) {
        setAppleId("");
        setAppPassword("");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-row items-center gap-4 pb-2">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83" />
            </svg>
          </div>
          <div>
            <DialogTitle className="text-lg">Connect iCloud Calendar</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Use an app-specific password to connect securely
            </p>
          </div>
        </DialogHeader>

        <div className="bg-sky-50 dark:bg-sky-950/30 rounded-lg p-3 text-sm flex items-start gap-2">
          <ShieldCheck className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-foreground">App-specific password required</p>
            <p className="text-muted-foreground mt-1">
              For security, Apple requires an app-specific password instead of your regular
              iCloud password. Generate one at{" "}
              <a
                href="https://appleid.apple.com/account/manage"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                appleid.apple.com
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="appleId">Apple ID (email)</Label>
            <Input
              id="appleId"
              type="email"
              placeholder="yourname@icloud.com"
              value={appleId}
              onChange={(e) => setAppleId(e.target.value)}
              disabled={isConnecting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="appPassword">App-Specific Password</Label>
            <Input
              id="appPassword"
              type="password"
              placeholder="xxxx-xxxx-xxxx-xxxx"
              value={appPassword}
              onChange={(e) => setAppPassword(e.target.value)}
              disabled={isConnecting}
              required
            />
            <p className="text-xs text-muted-foreground">
              Go to Apple ID → Sign-In & Security → App-Specific Passwords → Generate
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => handleClose(false)}
              disabled={isConnecting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
              disabled={isConnecting || !appleId.trim() || !appPassword.trim()}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
