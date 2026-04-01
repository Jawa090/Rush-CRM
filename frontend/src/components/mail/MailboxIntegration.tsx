import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link2, Mail, Settings, Trash2 } from "lucide-react";
import { ConnectMailboxDialog } from "./ConnectMailboxDialog";
import { api } from '@/lib/api';
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const providers = [
  {
    id: "gmail",
    name: "Gmail",
    authType: "oauth" as const,
    icon: (
      <svg viewBox="0 0 24 24" className="w-10 h-10">
        <path d="M22 6l-10 7L2 6V4l10 7 10-7v2z" fill="#EA4335" />
        <path d="M2 6v12h4V10l6 4 6-4v8h4V6l-10 7L2 6z" fill="#4285F4" />
        <path d="M2 6l10 7V18L2 12V6z" fill="#34A853" />
        <path d="M22 6l-10 7v5l10-6V6z" fill="#FBBC05" />
      </svg>
    ),
  },
  {
    id: "outlook",
    name: "Outlook / Hotmail",
    authType: "oauth" as const,
    icon: (
      <div className="w-10 h-10 rounded-lg bg-[#0078D4] flex items-center justify-center">
        <span className="text-white font-bold text-xl">O</span>
      </div>
    ),
  },
  {
    id: "icloud",
    name: "iCloud",
    authType: "password" as const,
    icon: (
      <svg viewBox="0 0 24 24" className="w-10 h-10" fill="#3693F5">
        <path d="M19.35 10.04A7.49 7.49 0 0012 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 000 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
      </svg>
    ),
  },
  {
    id: "custom_imap",
    name: "Custom mailbox",
    subtitle: "IMAP+SMTP",
    authType: "password" as const,
    icon: (
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
        <Mail className="w-6 h-6 text-primary" />
      </div>
    ),
  },
];

interface MailboxIntegrationProps {
  onMailboxConnected: () => void;
}

export function MailboxIntegration({ onMailboxConnected }: MailboxIntegrationProps) {
  const [connectDialog, setConnectDialog] = useState<string | null>(null);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const { user } = useAuth();
  const { organization } = useOrganization();
  const queryClient = useQueryClient();

  const { data: connectedMailboxes = [], isLoading } = useQuery({
    queryKey: ["connected-mailboxes", user?.id],
    queryFn: async () => {
      const data = await api.get<any[]>('/email/mailboxes');
      return data || [];
    },
    enabled: !!user,
  });

  const connectedProviders = new Set(connectedMailboxes.map((m) => m.provider));

  const handleOAuthConnect = async (providerId: string) => {
    setOauthLoading(providerId);
    try {
      const functionName = providerId === 'gmail' ? 'gmail-mail-auth' : 'outlook-mail-auth';
      const data = await api.get<any>(`/email/oauth-url/${functionName}`);
      if (!data?.authUrl) throw new Error('Failed to get auth URL');
      const isInIframe = window.self !== window.top;
      if (isInIframe) window.open(data.authUrl, '_blank', 'width=600,height=700');
      else window.location.href = data.authUrl;
    } catch (err: any) {
      console.error("OAuth error:", err);
      toast.error(err.message || "Failed to start authentication");
    } finally {
      setOauthLoading(null);
    }
  };

  const handleProviderClick = (provider: (typeof providers)[0]) => {
    if (provider.authType === "oauth") {
      handleOAuthConnect(provider.id);
    } else {
      setConnectDialog(provider.id);
    }
  };

  const handleDisconnect = async (id: string) => {
    await api.delete(`/email/mailboxes/${id}`);
    toast.success('Mailbox disconnected');
    queryClient.invalidateQueries({ queryKey: ['connected-mailboxes'] });
  };

  const hasConnectedMailboxes = connectedMailboxes.length > 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">Mailbox Integration</h1>
          <Settings className="h-5 w-5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
        </div>
        {hasConnectedMailboxes && (
          <Button variant="outline" onClick={onMailboxConnected}>
            <Mail className="mr-2 h-4 w-4" />
            Open Webmail
          </Button>
        )}
      </div>

      {/* Connected Mailboxes */}
      {hasConnectedMailboxes && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Connected Mailboxes</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {connectedMailboxes.map((mb) => {
              const prov = providers.find((p) => p.id === mb.provider);
              return (
                <Card
                  key={mb.id}
                  className="p-4 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
                  onClick={onMailboxConnected}
                >
                  <div className="flex items-center gap-3">
                    <div className="shrink-0">{prov?.icon}</div>
                    <div>
                      <p className="font-medium text-sm">{mb.email_address}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {mb.provider.replace("_", " ")} • {mb.sync_status === "synced" ? "Synced" : mb.sync_status}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={mb.is_active ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {mb.access_token ? "OAuth" : "IMAP"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDisconnect(mb.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Provider Grid */}
      <div className="text-center py-8">
        <h2 className="text-xl font-medium text-foreground mb-2">
          Connect your email
        </h2>
        <p className="text-sm text-muted-foreground mb-8">
          Gmail and Outlook use secure OAuth — no passwords needed. Your CRM will sync real emails.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {providers.map((provider) => {
            const isConnected = connectedProviders.has(provider.id);
            const isLoading = oauthLoading === provider.id;
            return (
              <Card
                key={provider.id}
                className={`p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border-border/50 relative ${
                  isConnected ? "ring-2 ring-success/30" : ""
                } ${isLoading ? "opacity-70 pointer-events-none" : ""}`}
                onClick={() => handleProviderClick(provider)}
              >
                {isConnected && (
                  <Badge className="absolute top-2 right-2 text-[10px] h-5 bg-success text-success-foreground">
                    Connected
                  </Badge>
                )}
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-xl">
                    <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {provider.icon}
                <div className="text-center">
                  <p className="font-medium text-sm">{provider.name}</p>
                  {"subtitle" in provider && (
                    <p className="text-xs text-muted-foreground">{provider.subtitle}</p>
                  )}
                  {provider.authType === "oauth" && !isConnected && (
                    <p className="text-[10px] text-primary mt-1">Sign in with OAuth</p>
                  )}
                  {provider.authType === "password" && !isConnected && (
                    <p className="text-[10px] text-muted-foreground mt-1">App password</p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Only show password dialog for iCloud/custom IMAP */}
      {connectDialog && (
        <ConnectMailboxDialog
          open={!!connectDialog}
          onOpenChange={(open) => !open && setConnectDialog(null)}
          provider={connectDialog}
          onSuccess={() => {
            setConnectDialog(null);
            queryClient.invalidateQueries({ queryKey: ["connected-mailboxes"] });
          }}
        />
      )}
    </div>
  );
}
