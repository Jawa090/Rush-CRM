import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Settings, Calendar } from "lucide-react";

interface CalendarProvider {
  id: string;
  name: string;
  icon: React.ReactNode;
  connected: boolean;
  connectedAt?: string;
}

interface ConnectCalendarsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connectedCalendars: string[];
  onConnect: (providerId: string) => void;
  onManage: (providerId: string) => void;
}

export function ConnectCalendarsDialog({
  open,
  onOpenChange,
  connectedCalendars,
  onConnect,
  onManage,
}: ConnectCalendarsDialogProps) {
  const providers: CalendarProvider[] = [
    {
      id: "google",
      name: "Google Calendar",
      icon: (
        <div className="w-12 h-12 rounded-full bg-white border flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-7 h-7">
            <rect x="3" y="4" width="18" height="18" rx="2" fill="#4285F4" />
            <rect x="3" y="4" width="18" height="5" fill="#1A73E8" />
            <text x="12" y="17" textAnchor="middle" fontSize="8" fontWeight="bold" fill="white">31</text>
          </svg>
        </div>
      ),
      connected: connectedCalendars.includes("google"),
      connectedAt: connectedCalendars.includes("google") ? "JUST NOW" : undefined,
    },
    {
      id: "icloud",
      name: "iCloud Calendar",
      icon: (
        <div className="w-12 h-12 rounded-full bg-white border flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83" />
          </svg>
        </div>
      ),
      connected: connectedCalendars.includes("icloud"),
      connectedAt: connectedCalendars.includes("icloud") ? "JUST NOW" : undefined,
    },
    {
      id: "microsoft",
      name: "Microsoft Calendar",
      icon: (
        <div className="w-12 h-12 rounded-full bg-white border flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-7 h-7">
            <path fill="#EB3C00" d="M7 2L2 6v12l5 4 10-2V4L7 2z" />
            <path fill="#FF6C40" d="M17 4l-10 2v16l10-2V4z" />
            <path fill="#FFA080" d="M22 6l-5-2v16l5-2V6z" />
          </svg>
        </div>
      ),
      connected: connectedCalendars.includes("microsoft"),
      connectedAt: connectedCalendars.includes("microsoft") ? "JUST NOW" : undefined,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="flex flex-row items-center gap-4 pb-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-success" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-sky-400 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
          </div>
          <div>
            <DialogTitle className="text-xl">Connect calendars</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Keep track of your events and meetings in your calendar
            </p>
          </div>
        </DialogHeader>

        <div className="bg-sky-50 dark:bg-sky-950/30 rounded-lg p-4 space-y-3">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className={`flex items-center justify-between p-4 bg-card rounded-lg border-2 transition-colors ${
                provider.connected
                  ? "border-success bg-success/5"
                  : "border-transparent hover:border-muted"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  {provider.icon}
                  {provider.connected && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-success flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium">{provider.name}</p>
                  {provider.connectedAt && (
                    <p className="text-xs text-muted-foreground">{provider.connectedAt}</p>
                  )}
                </div>
              </div>
              {provider.connected ? (
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-success text-sm font-medium">
                    <Check className="w-4 h-4" />
                    CONNECTED
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onManage(provider.id)}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  className="bg-success hover:bg-success/90 text-success-foreground rounded-full px-6"
                  onClick={() => onConnect(provider.id)}
                >
                  CONNECT
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-start gap-2 text-sm text-muted-foreground mt-2">
          <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
          <p>
            Streamline your work by connecting your calendars. Manage your team
            involvement from any device.
          </p>
        </div>

        <div className="space-y-1 text-sm">
          <button className="text-primary hover:underline">Connect other calendars</button>
          <p className="text-muted-foreground">More about calendar synchronization</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
