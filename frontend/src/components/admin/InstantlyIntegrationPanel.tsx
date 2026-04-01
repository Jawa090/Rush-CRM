import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Zap,
  Plug,
  RefreshCw,
  Copy,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Mail,
  Activity,
  Eye,
  EyeOff,
} from "lucide-react";
import { api } from '@/lib/api';
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";

interface Integration {
  id: string;
  org_id: string;
  is_enabled: boolean;
  status: string;
  webhook_url: string | null;
  webhook_secret: string | null;
  last_sync_at: string | null;
}

interface WebhookHealth {
  status: string;
  last_received_at: string | null;
  total_received: number;
  total_processed: number;
  total_failed: number;
  last_error: string | null;
}

interface RecentEvent {
  id: string;
  event_type: string;
  sender_email: string;
  subject: string;
  processed: boolean;
  received_at: string;
  lead_id: string | null;
}

export default function InstantlyIntegrationPanel() {
  const { profile } = useAuth();
  const [integration, setIntegration] = useState<Integration | null>(null);
  const [health, setHealth] = useState<WebhookHealth | null>(null);
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  const fetchHealth = async () => {
    if (!profile?.org_id) return;
    try {
      const res = await api.post<any>('/integrations/instantly', { action: 'health' });
      if (res) {
        setIntegration(res.integration);
        setHealth(res.health);
        setRecentEvents(res.recent_events || []);
      }
    } catch (err) {
      console.error("Failed to fetch health:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, [profile?.org_id]);

  const handleConnect = async () => {
    if (!apiKey.trim()) {
      toast.error("Please enter your Instantly.ai API key");
      return;
    }
    setConnecting(true);
    try {
      const res = await api.post<any>('/integrations/instantly', { action: 'connect', api_key: apiKey.trim() });
      if (!res) throw new Error('Connection failed');
      toast.success("Instantly.ai connected successfully!");
      setApiKey("");
      setShowApiKeyInput(false);
      await fetchHealth();
    } catch (err: any) {
      toast.error("Failed to connect: " + (err.message || "Unknown error"));
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await api.post('/integrations/instantly', { action: 'disconnect' });
      toast.success("Instantly.ai disconnected");
      await fetchHealth();
    } catch (err: any) {
      toast.error("Failed to disconnect");
    }
  };

  const handleToggle = async (enabled: boolean) => {
    try {
      await api.post('/integrations/instantly', { action: 'toggle', is_enabled: enabled });
      toast.success(`Unibox integration ${enabled ? "enabled" : "disabled"}`);
      await fetchHealth();
    } catch (err: any) {
      toast.error("Failed to toggle integration");
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await api.post<any>('/integrations/instantly', { action: 'sync' });
      if (res) toast.success(res.message || 'Sync complete');
      await fetchHealth();
    } catch (err: any) {
      toast.error("Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "healthy":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "disconnected":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "degraded":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
      case "healthy":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Connected</Badge>;
      case "disconnected":
        return <Badge variant="destructive">Disconnected</Badge>;
      case "degraded":
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Degraded</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-muted/50 animate-pulse rounded-lg" />
        <div className="h-48 bg-muted/50 animate-pulse rounded-lg" />
      </div>
    );
  }

  const isConnected = integration?.status === "connected";

  return (
    <div className="space-y-6">
      {/* Connection Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Instantly.ai — Unibox Integration
          </CardTitle>
          <CardDescription>
            Connect your Instantly.ai account to auto-create leads from Unibox email events
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Row */}
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="flex items-center gap-3">
              {getStatusIcon(integration?.status || "disconnected")}
              <div>
                <span className="font-medium text-foreground">Connection Status</span>
                <p className="text-sm text-muted-foreground">
                  {isConnected
                    ? "Your Instantly.ai account is connected and receiving webhook events"
                    : "Connect your Instantly.ai account to get started"}
                </p>
              </div>
            </div>
            {getStatusBadge(integration?.status || "disconnected")}
          </div>

          {/* Enable/Disable Toggle */}
          {isConnected && (
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <span className="font-medium text-foreground">Unibox Integration</span>
                <p className="text-sm text-muted-foreground">
                  Enable or disable auto-lead creation from Unibox emails
                </p>
              </div>
              <Switch
                checked={integration?.is_enabled ?? false}
                onCheckedChange={handleToggle}
              />
            </div>
          )}

          {/* Last Sync */}
          {isConnected && integration?.last_sync_at && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Last sync: {format(new Date(integration.last_sync_at), "PPpp")}
            </div>
          )}

          {/* Connect / Disconnect Buttons */}
          <div className="flex gap-2">
            {!isConnected ? (
              <>
                {showApiKeyInput ? (
                  <div className="flex-1 space-y-3">
                    <div>
                      <Label className="text-sm">Instantly.ai API Key</Label>
                      <Input
                        type="password"
                        placeholder="Enter your API key from Instantly.ai dashboard"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Find your API key at Settings → Integrations in your Instantly.ai dashboard
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleConnect} disabled={connecting}>
                        {connecting ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <Plug className="h-4 w-4 mr-2" />
                            Connect
                          </>
                        )}
                      </Button>
                      <Button variant="ghost" onClick={() => setShowApiKeyInput(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button onClick={() => setShowApiKeyInput(true)}>
                    <Plug className="h-4 w-4 mr-2" />
                    Connect Instantly.ai
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleSync} disabled={syncing}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
                  {syncing ? "Syncing..." : "Sync Now"}
                </Button>
                <Button variant="destructive" onClick={handleDisconnect}>
                  Disconnect
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Webhook Configuration Card */}
      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Webhook Configuration
            </CardTitle>
            <CardDescription>
              Configure this webhook URL in your Instantly.ai dashboard under Unibox settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Webhook URL */}
            <div>
              <Label className="text-sm font-medium">Webhook URL</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={integration?.webhook_url || ""}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(integration?.webhook_url || "")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Paste this URL in Instantly.ai → Settings → Webhooks
              </p>
            </div>

            {/* Webhook Secret */}
            {integration?.webhook_secret && (
              <div>
                <Label className="text-sm font-medium">Webhook Secret</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={showSecret ? integration.webhook_secret : "••••••••••••••••"}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowSecret(!showSecret)}
                  >
                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(integration.webhook_secret || "")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Webhook Health */}
            {health && (
              <div className="rounded-lg border border-border p-4 space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(health.status)}
                  <span className="font-medium text-sm">Webhook Health</span>
                  {getStatusBadge(health.status)}
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-foreground">{health.total_received}</p>
                    <p className="text-xs text-muted-foreground">Received</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{health.total_processed}</p>
                    <p className="text-xs text-muted-foreground">Processed</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-destructive">{health.total_failed}</p>
                    <p className="text-xs text-muted-foreground">Failed</p>
                  </div>
                </div>
                {health.last_received_at && (
                  <p className="text-xs text-muted-foreground">
                    Last event: {format(new Date(health.last_received_at), "PPpp")}
                  </p>
                )}
                {health.last_error && (
                  <p className="text-xs text-destructive">Last error: {health.last_error}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Events */}
      {isConnected && recentEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Recent Unibox Events
            </CardTitle>
            <CardDescription>Latest email events received from Instantly.ai</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sender</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Received</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium text-sm">
                      {event.sender_email || "—"}
                    </TableCell>
                    <TableCell className="text-sm max-w-[200px] truncate">
                      {event.subject || "—"}
                    </TableCell>
                    <TableCell>
                      {event.processed ? (
                        <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">
                          Lead Created
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(event.received_at), "PP p")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
