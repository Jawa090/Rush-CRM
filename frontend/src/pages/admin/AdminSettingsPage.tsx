import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Phone, Settings, Shield, Plug, Mail } from "lucide-react";
import InstantlyIntegrationPanel from "@/components/admin/InstantlyIntegrationPanel";
import { api } from '@/lib/api';
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useAdminRoles } from "@/hooks/useAdminRoles";

interface Provider {
  id: string;
  provider_name: string;
  display_name: string;
  is_enabled: boolean;
}

const providerMeta: Record<string, { description: string; status: string }> = {
  ringcentral: {
    description: "Enterprise VoIP with embedded softphone, call tracking, recording, and RingSense AI.",
    status: "Available",
  },
  twilio: {
    description: "Programmable voice with WebRTC softphone and custom IVR.",
    status: "Coming Soon",
  },
  tmobile: {
    description: "T-Mobile embedded calling with native network integration.",
    status: "Coming Soon",
  },
};

export default function AdminSettingsPage() {
  const { profile } = useAuth();
  const { roles, permissions: rolePermissions, togglePermission, isLoading: rolesLoading } = useAdminRoles();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingPerms, setSavingPerms] = useState(false);

  // Track local toggle state: roleId → { view: bool, create: bool }
  const [callingPermissions, setCallingPermissions] = useState<Record<string, { view: boolean; create: boolean }>>({});
  const [uniboxPermissions, setUniboxPermissions] = useState<Record<string, boolean>>({});

  // Initialize local state from role_permissions
  useEffect(() => {
    if (rolesLoading || roles.length === 0) return;
    const permMap: Record<string, { view: boolean; create: boolean }> = {};
    const uniboxMap: Record<string, boolean> = {};
    for (const role of roles) {
      const hasView = rolePermissions.some(p => p.role_id === role.id && p.module === 'telephony' && p.action === 'view');
      const hasCreate = rolePermissions.some(p => p.role_id === role.id && p.module === 'telephony' && p.action === 'create');
      permMap[role.id] = { view: hasView || hasCreate, create: hasCreate };

      const hasUniboxView = rolePermissions.some(p => p.role_id === role.id && p.module === 'unibox' && p.action === 'view');
      uniboxMap[role.id] = hasUniboxView;
    }
    setCallingPermissions(permMap);
    setUniboxPermissions(uniboxMap);
  }, [roles, rolePermissions, rolesLoading]);

  // Fetch telephony providers
  useEffect(() => {
    if (!profile?.org_id) return;
    api.get<any[]>('/telephony/providers')
      .then((data) => { if (data) setProviders(data as Provider[]); setLoading(false); })
      .catch(() => setLoading(false));
  }, [profile?.org_id]);

  const toggleProvider = async (providerId: string, enabled: boolean) => {
    await api.patch(`/telephony/providers/${providerId}`, { is_enabled: enabled });
    setProviders((prev) => prev.map((p) => (p.id === providerId ? { ...p, is_enabled: enabled } : p)));
    toast.success(`Provider ${enabled ? 'enabled' : 'disabled'}`);
  };

  const toggleCallingPermission = (roleId: string) => {
    setCallingPermissions((prev) => {
      const current = prev[roleId] || { view: false, create: false };
      const newChecked = !current.create;
      return { ...prev, [roleId]: { view: newChecked, create: newChecked } };
    });
  };

  const toggleUniboxPermission = (roleId: string) => {
    setUniboxPermissions((prev) => ({
      ...prev,
      [roleId]: !prev[roleId],
    }));
  };

  const saveUniboxPermissions = async () => {
    setSavingPerms(true);
    try {
      for (const role of roles) {
        if (role.slug === 'super_admin' || role.slug === 'admin') continue;
        const desired = uniboxPermissions[role.id] ?? false;
        const hasView = rolePermissions.some(p => p.role_id === role.id && p.module === 'unibox' && p.action === 'view');

        if (desired && !hasView) {
          await togglePermission.mutateAsync({ roleId: role.id, module: 'unibox', action: 'view', isGranted: true });
        } else if (!desired && hasView) {
          await togglePermission.mutateAsync({ roleId: role.id, module: 'unibox', action: 'view', isGranted: false });
        }
      }
      toast.success("Unibox permissions saved");
    } catch (err: any) {
      toast.error(err.message || "Failed to save permissions");
    } finally {
      setSavingPerms(false);
    }
  };

  const saveCallingPermissions = async () => {
    setSavingPerms(true);
    try {
      for (const role of roles) {
        if (role.slug === 'super_admin' || role.slug === 'admin') continue; // admins always have access
        const desired = callingPermissions[role.id] || { view: false, create: false };
        const hasView = rolePermissions.some(p => p.role_id === role.id && p.module === 'telephony' && p.action === 'view');
        const hasCreate = rolePermissions.some(p => p.role_id === role.id && p.module === 'telephony' && p.action === 'create');

        // Sync 'view' permission
        if (desired.view && !hasView) {
          await togglePermission.mutateAsync({ roleId: role.id, module: 'telephony', action: 'view', isGranted: true });
        } else if (!desired.view && hasView) {
          await togglePermission.mutateAsync({ roleId: role.id, module: 'telephony', action: 'view', isGranted: false });
        }
        // Sync 'create' permission
        if (desired.create && !hasCreate) {
          await togglePermission.mutateAsync({ roleId: role.id, module: 'telephony', action: 'create', isGranted: true });
        } else if (!desired.create && hasCreate) {
          await togglePermission.mutateAsync({ roleId: role.id, module: 'telephony', action: 'create', isGranted: false });
        }
      }
      toast.success("Calling permissions saved");
    } catch (err: any) {
      toast.error(err.message || "Failed to save permissions");
    } finally {
      setSavingPerms(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Settings</h1>
        <p className="text-muted-foreground">Organization-wide configuration</p>
      </div>

      <Tabs defaultValue="telephony">
        <TabsList>
          <TabsTrigger value="telephony" className="gap-2">
            <Phone className="h-4 w-4" />
            Telephony
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <Plug className="h-4 w-4" />
            Integrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="telephony" className="space-y-6 mt-4">
          {/* Provider Toggles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                Calling Providers
              </CardTitle>
              <CardDescription>Enable or disable telephony providers for your organization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {providers.map((provider) => {
                  const meta = providerMeta[provider.provider_name] || { description: "", status: "" };
                  return (
                    <div
                      key={provider.id}
                      className="flex items-center justify-between rounded-lg border border-border p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Phone className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{provider.display_name}</span>
                            <Badge
                              variant={meta.status === "Available" ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {meta.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{meta.description}</p>
                        </div>
                      </div>
                      <Switch
                        checked={provider.is_enabled}
                        onCheckedChange={(checked) => toggleProvider(provider.id, checked)}
                        disabled={loading || (provider.provider_name !== 'ringcentral')}
                      />
                    </div>
                  );
                })}
                {providers.length === 0 && !loading && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No telephony providers configured yet.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Role-Level Calling Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Calling Permissions by Role
              </CardTitle>
              <CardDescription>Control which roles can initiate calls</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-center w-[150px]">Can Make Calls</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.filter(r => r.slug !== 'super_admin' && r.slug !== 'admin').map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.name}</TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={callingPermissions[role.id]?.create ?? false}
                          onCheckedChange={() => toggleCallingPermission(role.id)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 flex justify-end">
                <Button onClick={saveCallingPermissions} disabled={savingPerms}>
                  {savingPerms ? "Saving..." : "Save Permissions"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6 mt-4">
          <InstantlyIntegrationPanel />

          {/* Unibox Access Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Unibox Mailbox Permissions
              </CardTitle>
              <CardDescription>Control which roles can access the Unibox Mailbox at /collaboration/unibox</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-center w-[180px]">Can Access Unibox</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.filter(r => r.slug !== 'super_admin' && r.slug !== 'admin').map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.name}</TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={uniboxPermissions[role.id] ?? false}
                          onCheckedChange={() => toggleUniboxPermission(role.id)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 flex justify-end">
                <Button onClick={saveUniboxPermissions} disabled={savingPerms}>
                  {savingPerms ? "Saving..." : "Save Unibox Permissions"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
