import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Phone, Settings, Link, Unlink, CheckCircle2, AlertCircle } from "lucide-react";
import { api } from '@/lib/api';
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  checkRCConnectionStatus,
  getRCAuthUrl,
  exchangeRCCode,
  disconnectRC,
} from "@/services/telephonyService";

interface Provider {
  id: string;
  provider_name: string;
  display_name: string;
  is_enabled: boolean;
}

export default function TelephonySettingsPage() {
  const { profile } = useAuth();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [rcStatus, setRcStatus] = useState<{ connected: boolean; expired: boolean; accountId: string | null }>({
    connected: false, expired: false, accountId: null,
  });
  const [rcLoading, setRcLoading] = useState(false);

  useEffect(() => {
    if (!profile?.org_id) return;
    const load = async () => {
      const [data, status] = await Promise.all([
        api.get<any[]>('/telephony/providers').catch(() => [] as any[]),
        checkRCConnectionStatus(),
      ]);
      if (data) setProviders(data as Provider[]);
      setRcStatus(status);
      setLoading(false);
    };
    load();
  }, [profile?.org_id]);

  // Handle OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    if (code && state) {
      setRcLoading(true);
      exchangeRCCode(code, window.location.origin + '/admin/settings')
        .then(() => {
          toast.success('RingCentral connected successfully!');
          setRcStatus({ connected: true, expired: false, accountId: null });
          // Clean URL
          window.history.replaceState({}, '', '/admin/settings');
        })
        .catch((err) => {
          toast.error('Failed to connect RingCentral: ' + err.message);
        })
        .finally(() => setRcLoading(false));
    }
  }, []);

  const toggleProvider = async (providerId: string, enabled: boolean) => {
    await api.patch(`/telephony/providers/${providerId}`, { is_enabled: enabled });
    setProviders(prev => prev.map(p => p.id === providerId ? { ...p, is_enabled: enabled } : p));
    toast.success(`Provider ${enabled ? 'enabled' : 'disabled'}`);
  };

  const handleConnectRC = async () => {
    setRcLoading(true);
    try {
      const redirectUri = window.location.origin + '/admin/settings';
      const authUrl = await getRCAuthUrl(redirectUri);
      window.location.href = authUrl;
    } catch (err) {
      toast.error('Failed to start RingCentral auth');
      setRcLoading(false);
    }
  };

  const handleDisconnectRC = async () => {
    setRcLoading(true);
    try {
      await disconnectRC();
      setRcStatus({ connected: false, expired: false, accountId: null });
      toast.success('RingCentral disconnected');
    } catch {
      toast.error('Failed to disconnect');
    }
    setRcLoading(false);
  };

  const providerMeta: Record<string, { description: string; status: string }> = {
    ringcentral: {
      description: 'Enterprise VoIP with call tracking, recording, RingSense AI transcripts, and analytics.',
      status: 'Available',
    },
    twilio: {
      description: 'Programmable voice with custom IVR and call routing.',
      status: 'Coming Soon',
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Telephony Settings</h1>
          <p className="text-muted-foreground">Configure calling providers for your organization</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {providers.map(provider => {
          const meta = providerMeta[provider.provider_name] || { description: '', status: '' };
          const isRC = provider.provider_name === 'ringcentral';
          return (
            <Card key={provider.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{provider.display_name}</CardTitle>
                      <Badge
                        variant={meta.status === 'Available' ? 'default' : 'secondary'}
                        className="mt-1 text-xs"
                      >
                        {meta.status}
                      </Badge>
                    </div>
                  </div>
                  <Switch
                    checked={provider.is_enabled}
                    onCheckedChange={(checked) => toggleProvider(provider.id, checked)}
                    disabled={loading || provider.provider_name === 'twilio'}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription>{meta.description}</CardDescription>
                
                {/* RingCentral OAuth Section */}
                {isRC && provider.is_enabled && (
                  <div className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      {rcStatus.connected && !rcStatus.expired ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : rcStatus.expired ? (
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-sm font-medium">
                        {rcStatus.connected && !rcStatus.expired
                          ? 'Connected'
                          : rcStatus.expired
                            ? 'Token Expired — Reconnect'
                            : 'Not Connected'}
                      </span>
                    </div>
                    
                    {rcStatus.accountId && (
                      <p className="text-xs text-muted-foreground">Account: {rcStatus.accountId}</p>
                    )}
                    
                    {rcStatus.connected ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={handleDisconnectRC}
                        disabled={rcLoading}
                      >
                        <Unlink className="h-4 w-4" />
                        {rcLoading ? 'Disconnecting...' : 'Disconnect'}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="gap-2"
                        onClick={handleConnectRC}
                        disabled={rcLoading}
                      >
                        <Link className="h-4 w-4" />
                        {rcLoading ? 'Connecting...' : 'Connect RingCentral'}
                      </Button>
                    )}
                  </div>
                )}

                {provider.is_enabled && !isRC && (
                  <Button variant="outline" size="sm" className="gap-2">
                    <Settings className="h-4 w-4" />
                    Configure
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
