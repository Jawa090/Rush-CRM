import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Shield, Search, Save, Loader2, Eye, History } from "lucide-react";
import { useAdminRoles } from "@/hooks/useAdminRoles";
import { useAuth } from "@/contexts/AuthContext";
import { api } from '@/lib/api';
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format } from "date-fns";

// Permission matrix definition
const PERMISSION_MODULES = [
  {
    category: "CRM",
    modules: [
      { key: "leads", label: "Leads", actions: ["view", "create", "edit", "delete", "export", "assign"] },
      { key: "deals", label: "Deals", actions: ["view", "create", "edit", "delete", "move_stage", "close"] },
      { key: "contacts", label: "Contacts", actions: ["view", "create", "edit", "delete", "import"] },
      { key: "companies", label: "Companies", actions: ["view", "create", "edit", "delete"] },
    ],
  },
  {
    category: "HRMS",
    modules: [
      { key: "employees", label: "Employees", actions: ["view", "create", "edit", "delete"] },
      { key: "attendance", label: "Attendance", actions: ["view", "mark", "approve"] },
      { key: "leave", label: "Leave", actions: ["view", "request", "approve"] },
      { key: "payroll", label: "Payroll", actions: ["view", "process"] },
    ],
  },
  {
    category: "Inventory",
    modules: [
      { key: "products", label: "Products", actions: ["view", "create", "edit", "delete"] },
      { key: "stock", label: "Stock", actions: ["view", "adjust", "transfer"] },
      { key: "vendors", label: "Vendors", actions: ["view", "create", "edit"] },
      { key: "purchase_orders", label: "Purchase Orders", actions: ["view", "create", "approve"] },
    ],
  },
  {
    category: "Collaboration",
    modules: [
      { key: "calendar", label: "Calendar", actions: ["view", "create", "edit", "delete"] },
      { key: "mail", label: "Mail", actions: ["view", "create", "edit", "delete"] },
      { key: "drive", label: "Drive", actions: ["view", "create", "edit", "delete"] },
      { key: "tasks", label: "Tasks", actions: ["view", "create", "edit", "delete"] },
      { key: "workflows", label: "Workflows", actions: ["view", "create", "edit", "delete"] },
    ],
  },
  {
    category: "System",
    modules: [
      { key: "dashboard", label: "Dashboard", actions: ["view", "customize"] },
      { key: "user_management", label: "User Management", actions: ["manage"] },
      { key: "roles_permissions", label: "Roles & Permissions", actions: ["manage"] },
      { key: "settings", label: "Settings", actions: ["manage"] },
      { key: "telephony", label: "Telephony", actions: ["view", "create", "edit", "delete"] },
    ],
  },
];

export default function PermissionsPage() {
  const { roles, permissions, isLoading, isPermissionsLoading, togglePermission, setModulePermissions, logPermissionChange } = useAdminRoles();
  const { profile } = useAuth();
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [pendingChanges, setPendingChanges] = useState<Map<string, boolean>>(new Map());
  const [saving, setSaving] = useState(false);
  const [previewRoleId, setPreviewRoleId] = useState<string | null>(null);
  const [showAuditLog, setShowAuditLog] = useState(false);

  // Set default selected role
  if (!selectedRoleId && roles.length > 0) {
    setSelectedRoleId(roles[0].id);
  }

  const selectedRole = roles.find(r => r.id === selectedRoleId);

  // Build permission lookup for selected role
  const permLookup = useMemo(() => {
    const lookup = new Set<string>();
    for (const p of permissions) {
      if (p.role_id === selectedRoleId && p.is_granted) {
        lookup.add(`${p.module}:${p.action}`);
      }
    }
    // Apply pending changes
    for (const [key, value] of pendingChanges) {
      if (value) lookup.add(key);
      else lookup.delete(key);
    }
    return lookup;
  }, [permissions, selectedRoleId, pendingChanges]);

  const hasPerm = (module: string, action: string) => permLookup.has(`${module}:${action}`);

  const handleToggle = (module: string, action: string) => {
    const key = `${module}:${action}`;
    const current = permLookup.has(key);
    setPendingChanges(prev => {
      const next = new Map(prev);
      next.set(key, !current);
      return next;
    });
  };

  const handleSelectAllModule = (moduleKey: string, actions: string[], grant: boolean) => {
    setPendingChanges(prev => {
      const next = new Map(prev);
      for (const action of actions) {
        next.set(`${moduleKey}:${action}`, grant);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (pendingChanges.size === 0) return;
    setSaving(true);
    try {
      for (const [key, isGranted] of pendingChanges) {
        const [module, action] = key.split(':');
        await togglePermission.mutateAsync({ roleId: selectedRoleId, module, action, isGranted });
        await logPermissionChange(
          isGranted ? 'grant_permission' : 'revoke_permission',
          'role_permission',
          selectedRoleId,
          { module, action, was_granted: !isGranted },
          { module, action, is_granted: isGranted },
        );
      }
      setPendingChanges(new Map());
      toast.success(`${pendingChanges.size} permission changes saved`);
    } catch {
      toast.error('Failed to save some changes');
    } finally {
      setSaving(false);
    }
  };

  // Effective permissions preview
  const effectivePermsQuery = useQuery({
    queryKey: ['effective-permissions', previewRoleId],
    queryFn: async () => {
      if (!previewRoleId) return [];
      const data = await api.get<any[]>('/roles/effective-permissions', { role_id: previewRoleId }).catch(() => []);
      return data as { module: string; action: string; is_inherited: boolean; source_role_id: string }[];
    },
    enabled: !!previewRoleId,
  });

  // Audit log
  const auditLogQuery = useQuery({
    queryKey: ['permission-audit-log', profile?.org_id],
    queryFn: async () => {
      const data = await api.get<any[]>('/roles/audit-log').catch(() => []);
      return data || [];
    },
    enabled: showAuditLog && !!profile?.org_id,
  });

  const filteredModules = PERMISSION_MODULES.map(cat => ({
    ...cat,
    modules: cat.modules.filter(m =>
      !search || m.label.toLowerCase().includes(search.toLowerCase()) || m.actions.some(a => a.includes(search.toLowerCase()))
    ),
  })).filter(cat => cat.modules.length > 0);

  if (isLoading) {
    return <div className="space-y-6"><Skeleton className="h-10 w-64" /><Skeleton className="h-96" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Permissions Control</h1>
          <p className="text-muted-foreground">Manage access rights for each role</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAuditLog(true)}>
            <History className="mr-2 h-4 w-4" />
            Audit Log
          </Button>
          <Button
            className="gradient-primary"
            onClick={handleSave}
            disabled={pendingChanges.size === 0 || saving}
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes {pendingChanges.size > 0 && `(${pendingChanges.size})`}
          </Button>
        </div>
      </div>

      {/* Role selector & search */}
      <div className="flex flex-wrap gap-4">
        <div className="w-64">
          <Select value={selectedRoleId} onValueChange={v => { setSelectedRoleId(v); setPendingChanges(new Map()); }}>
            <SelectTrigger>
              <Shield className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map(r => (
                <SelectItem key={r.id} value={r.id}>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${r.color || 'bg-primary'}`} />
                    {r.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search modules or actions..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button variant="outline" size="sm" onClick={() => setPreviewRoleId(selectedRoleId)}>
          <Eye className="mr-2 h-4 w-4" />
          Preview Effective
        </Button>
      </div>

      {/* Permission Matrix */}
      {selectedRole && (
        <Tabs defaultValue={filteredModules[0]?.category || "CRM"}>
          <TabsList className="flex flex-wrap h-auto gap-1">
            {filteredModules.map(cat => (
              <TabsTrigger key={cat.category} value={cat.category}>{cat.category}</TabsTrigger>
            ))}
          </TabsList>

          {filteredModules.map(cat => (
            <TabsContent key={cat.category} value={cat.category}>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <CardTitle>{cat.category} Module</CardTitle>
                  </div>
                  <CardDescription>
                    Manage permissions for {cat.category.toLowerCase()} features for <strong>{selectedRole.name}</strong>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Module</TableHead>
                        {/* Collect all unique actions for this category */}
                        {(() => {
                          const allActions = [...new Set(cat.modules.flatMap(m => m.actions))];
                          return allActions.map(action => (
                            <TableHead key={action} className="text-center capitalize w-[100px]">{action.replace('_', ' ')}</TableHead>
                          ));
                        })()}
                        <TableHead className="text-center w-[80px]">All</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cat.modules.map(mod => {
                        const allActions = [...new Set(cat.modules.flatMap(m => m.actions))];
                        const allChecked = mod.actions.every(a => hasPerm(mod.key, a));
                        return (
                          <TableRow key={mod.key}>
                            <TableCell className="font-medium">{mod.label}</TableCell>
                            {allActions.map(action => (
                              <TableCell key={action} className="text-center">
                                {mod.actions.includes(action) ? (
                                  <Checkbox
                                    checked={hasPerm(mod.key, action)}
                                    onCheckedChange={() => handleToggle(mod.key, action)}
                                  />
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </TableCell>
                            ))}
                            <TableCell className="text-center">
                              <Checkbox
                                checked={allChecked}
                                onCheckedChange={(checked) => handleSelectAllModule(mod.key, mod.actions, !!checked)}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Effective Permissions Preview */}
      <Dialog open={!!previewRoleId} onOpenChange={open => { if (!open) setPreviewRoleId(null); }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Effective Permissions (Including Inherited)</DialogTitle>
          </DialogHeader>
          {effectivePermsQuery.isLoading ? (
            <Skeleton className="h-48" />
          ) : (
            <div className="space-y-2">
              {(effectivePermsQuery.data || []).map((p, i) => (
                <div key={i} className="flex items-center justify-between rounded border p-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">{p.module}</Badge>
                    <span className="text-sm capitalize">{p.action.replace('_', ' ')}</span>
                  </div>
                  {p.is_inherited && (
                    <Badge variant="secondary" className="text-xs">Inherited</Badge>
                  )}
                </div>
              ))}
              {(effectivePermsQuery.data || []).length === 0 && (
                <p className="text-muted-foreground text-center py-8">No permissions assigned</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Audit Log Dialog */}
      <Dialog open={showAuditLog} onOpenChange={setShowAuditLog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Permission Audit Log</DialogTitle>
          </DialogHeader>
          {auditLogQuery.isLoading ? (
            <Skeleton className="h-48" />
          ) : (
            <div className="space-y-2">
              {(auditLogQuery.data || []).map((entry: any) => (
                <div key={entry.id} className="rounded border p-3">
                  <div className="flex items-center justify-between">
                    <Badge variant={entry.action.includes('grant') ? 'default' : 'destructive'} className="text-xs capitalize">
                      {entry.action.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(entry.created_at), 'MMM d, yyyy HH:mm')}
                    </span>
                  </div>
                  <p className="text-sm mt-1 text-muted-foreground">
                    {entry.new_value?.module}:{entry.new_value?.action}
                  </p>
                </div>
              ))}
              {(auditLogQuery.data || []).length === 0 && (
                <p className="text-muted-foreground text-center py-8">No audit entries yet</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
