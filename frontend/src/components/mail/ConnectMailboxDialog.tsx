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
import { api } from '@/lib/api';
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { toast } from "sonner";
import { Mail, Lock, Server } from "lucide-react";

interface ConnectMailboxDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: string;
  onSuccess: () => void;
}

const providerDefaults: Record<string, { imap_host: string; imap_port: number; smtp_host: string; smtp_port: number }> = {
  gmail: { imap_host: "imap.gmail.com", imap_port: 993, smtp_host: "smtp.gmail.com", smtp_port: 587 },
  outlook: { imap_host: "outlook.office365.com", imap_port: 993, smtp_host: "smtp.office365.com", smtp_port: 587 },
  icloud: { imap_host: "imap.mail.me.com", imap_port: 993, smtp_host: "smtp.mail.me.com", smtp_port: 587 },
  office365: { imap_host: "outlook.office365.com", imap_port: 993, smtp_host: "smtp.office365.com", smtp_port: 587 },
  exchange: { imap_host: "", imap_port: 993, smtp_host: "", smtp_port: 587 },
  yahoo: { imap_host: "imap.mail.yahoo.com", imap_port: 993, smtp_host: "smtp.mail.yahoo.com", smtp_port: 587 },
  aol: { imap_host: "imap.aol.com", imap_port: 993, smtp_host: "smtp.aol.com", smtp_port: 587 },
  custom_imap: { imap_host: "", imap_port: 993, smtp_host: "", smtp_port: 587 },
};

const providerNames: Record<string, string> = {
  gmail: "Gmail",
  outlook: "Outlook",
  icloud: "iCloud",
  office365: "Office365",
  exchange: "Exchange",
  yahoo: "Yahoo!",
  aol: "AOL",
  custom_imap: "Custom IMAP+SMTP",
};

export function ConnectMailboxDialog({ open, onOpenChange, provider, onSuccess }: ConnectMailboxDialogProps) {
  const { user } = useAuth();
  const { organization } = useOrganization();
  const [loading, setLoading] = useState(false);
  const defaults = providerDefaults[provider] || providerDefaults.custom_imap;
  const isCustom = provider === "custom_imap" || provider === "exchange";

  const [form, setForm] = useState({
    email: "",
    password: "",
    display_name: "",
    imap_host: defaults.imap_host,
    imap_port: defaults.imap_port,
    smtp_host: defaults.smtp_host,
    smtp_port: defaults.smtp_port,
  });

  const handleSubmit = async () => {
    if (!user || !organization) {
      toast.error("You must be logged in");
      return;
    }
    if (!form.email || !form.password) {
      toast.error("Email and password are required");
      return;
    }

    setLoading(true);
    try {
      // 1. Save mailbox record
      const mailbox = await api.post<any>('/email/mailboxes', {
        user_id: user.id,
        org_id: organization.id,
        provider,
        email_address: form.email,
        display_name: form.display_name || form.email,
        imap_host: form.imap_host || defaults.imap_host,
        imap_port: form.imap_port || defaults.imap_port,
        smtp_host: form.smtp_host || defaults.smtp_host,
        smtp_port: form.smtp_port || defaults.smtp_port,
        imap_username: form.email,
        smtp_username: form.email,
        encrypted_password: form.password,
        is_active: true,
        sync_status: 'verifying',
      });

      toast.info('Verifying IMAP connection...');
      const verifyResult = await api.post<any>('/email/sync', { action: 'verify', mailbox_id: mailbox.id });
      if (verifyResult?.verified === false) {
        await api.delete(`/email/mailboxes/${mailbox.id}`);
        throw new Error(verifyResult?.error || 'IMAP connection failed.');
      }

      toast.info('Starting initial email sync...');
      api.post('/email/sync', { action: 'sync', mailbox_id: mailbox.id, full_sync: false })
        .then((data: any) => { if (data?.messages_synced > 0) toast.success(`Synced ${data.messages_synced} emails`); })
        .catch(() => {});

      toast.success(`${providerNames[provider]} connected successfully!`);
      onSuccess();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to connect mailbox");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Connect {providerNames[provider]}
          </DialogTitle>
          <DialogDescription>
            Enter your email credentials to connect your {providerNames[provider]} mailbox.
            {provider === "gmail" && " Use an App Password if you have 2FA enabled."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password / App Password</Label>
            <div className="relative">
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="display_name">Display Name (optional)</Label>
            <Input
              id="display_name"
              placeholder="My Work Email"
              value={form.display_name}
              onChange={(e) => setForm({ ...form, display_name: e.target.value })}
            />
          </div>

          {isCustom && (
            <div className="space-y-4 pt-2 border-t">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Server className="h-4 w-4" />
                Server Settings
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-2">
                  <Label>IMAP Host</Label>
                  <Input
                    placeholder="imap.example.com"
                    value={form.imap_host}
                    onChange={(e) => setForm({ ...form, imap_host: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Port</Label>
                  <Input
                    type="number"
                    value={form.imap_port}
                    onChange={(e) => setForm({ ...form, imap_port: parseInt(e.target.value) || 993 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-2">
                  <Label>SMTP Host</Label>
                  <Input
                    placeholder="smtp.example.com"
                    value={form.smtp_host}
                    onChange={(e) => setForm({ ...form, smtp_host: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Port</Label>
                  <Input
                    type="number"
                    value={form.smtp_port}
                    onChange={(e) => setForm({ ...form, smtp_port: parseInt(e.target.value) || 587 })}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="gradient-primary text-primary-foreground">
            {loading ? "Connecting..." : "Connect"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
