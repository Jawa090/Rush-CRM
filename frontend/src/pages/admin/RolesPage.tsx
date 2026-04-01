import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Shield, Users, Eye, Edit, Trash2, Copy, Loader2, ChevronRight } from "lucide-react";
import { useAdminRoles, Role } from "@/hooks/useAdminRoles";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function RolesPage() {
  const { roles, isLoading, createRole, updateRole, deleteRole } = useAdminRoles();
  // cloneRole: create a copy with a new name
  const cloneRole = { 
    mutate: ({ sourceRoleId, newName }: { sourceRoleId: string; newName: string }) => {
      const source = roles.find(r => r.id === sourceRoleId);
      if (!source) return;
      createRole.mutate({ name: newName, description: source.description ?? undefined, color: source.color ?? undefined });
    },
    isPending: createRole.isPending,
  };
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", description: "", parentRoleId: "", color: "bg-primary" });
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [editForm, setEditForm] = useState({ name: "", description: "", color: "" });
  const [cloneOpen, setCloneOpen] = useState<Role | null>(null);
  const [cloneName, setCloneName] = useState("");
  const [viewRole, setViewRole] = useState<Role | null>(null);

  const colorOptions = [
    { value: "bg-red-500", label: "Red" },
    { value: "bg-purple-500", label: "Purple" },
    { value: "bg-blue-500", label: "Blue" },
    { value: "bg-green-500", label: "Green" },
    { value: "bg-orange-500", label: "Orange" },
    { value: "bg-teal-500", label: "Teal" },
    { value: "bg-pink-500", label: "Pink" },
    { value: "bg-primary", label: "Primary" },
  ];

  const handleCreate = () => {
    if (!createForm.name) return;
    createRole.mutate({
      name: createForm.name,
      description: createForm.description,
      parentRoleId: createForm.parentRoleId || undefined,
      color: createForm.color,
    });
    setCreateForm({ name: "", description: "", parentRoleId: "", color: "bg-primary" });
    setCreateOpen(false);
  };

  const handleEditOpen = (role: Role) => {
    setEditRole(role);
    setEditForm({ name: role.name, description: role.description || "", color: role.color || "bg-primary" });
  };

  const handleEditSave = () => {
    if (!editRole) return;
    updateRole.mutate({ roleId: editRole.id, updates: { name: editForm.name, description: editForm.description, color: editForm.color } });
    setEditRole(null);
  };

  const handleClone = () => {
    if (!cloneOpen || !cloneName) return;
    cloneRole.mutate({ sourceRoleId: cloneOpen.id, newName: cloneName });
    setCloneOpen(null);
    setCloneName("");
  };

  const getParentName = (parentId: string | null) => {
    if (!parentId) return null;
    return roles.find(r => r.id === parentId)?.name || null;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-48" />)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Role Management</h1>
          <p className="text-muted-foreground">Define and assign user roles with hierarchy</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary">
              <Plus className="mr-2 h-4 w-4" />
              Create Role
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
              <DialogDescription>Define a new role for your organization</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Role Name *</Label>
                <Input placeholder="e.g. Team Lead" value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Brief description of this role..." value={createForm.description} onChange={e => setCreateForm({ ...createForm, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Parent Role (Inherits permissions)</Label>
                  <Select value={createForm.parentRoleId} onValueChange={v => setCreateForm({ ...createForm, parentRoleId: v })}>
                    <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {roles.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <Select value={createForm.color} onValueChange={v => setCreateForm({ ...createForm, color: v })}>
                    <SelectTrigger>
                      <div className="flex items-center gap-2">
                        <div className={`h-3 w-3 rounded-full ${createForm.color}`} />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map(c => (
                        <SelectItem key={c.value} value={c.value}>
                          <div className="flex items-center gap-2">
                            <div className={`h-3 w-3 rounded-full ${c.value}`} />
                            {c.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button className="gradient-primary" onClick={handleCreate} disabled={createRole.isPending}>
                {createRole.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Role
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {roles.map(role => (
          <Card key={role.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${role.color || 'bg-primary'}`}>
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{role.name}</CardTitle>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <Users className="h-3 w-3" />
                      <span>{role.user_count || 0} users</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  {role.is_system && (
                    <Badge variant="secondary" className="text-xs mr-1">System</Badge>
                  )}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewRole(role)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>View details</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditOpen(role)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit role</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setCloneOpen(role); setCloneName(`${role.name} (Copy)`); }}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Clone role</TooltipContent>
                  </Tooltip>
                  {!role.is_system && (role.user_count || 0) === 0 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Role</AlertDialogTitle>
                          <AlertDialogDescription>Are you sure you want to delete "{role.name}"? This cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteRole.mutate(role.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{role.description || "No description"}</p>
              {role.parent_role_id && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ChevronRight className="h-3 w-3" />
                  <span>Inherits from: {getParentName(role.parent_role_id)}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Role Dialog */}
      <Dialog open={!!editRole} onOpenChange={open => { if (!open) setEditRole(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <Select value={editForm.color} onValueChange={v => setEditForm({ ...editForm, color: v })}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${editForm.color}`} />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map(c => (
                    <SelectItem key={c.value} value={c.value}>
                      <div className="flex items-center gap-2">
                        <div className={`h-3 w-3 rounded-full ${c.value}`} />
                        {c.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRole(null)}>Cancel</Button>
            <Button className="gradient-primary" onClick={handleEditSave} disabled={updateRole.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clone Dialog */}
      <Dialog open={!!cloneOpen} onOpenChange={open => { if (!open) setCloneOpen(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clone Role</DialogTitle>
            <DialogDescription>Create a copy of "{cloneOpen?.name}" with all its permissions</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <Label>New Role Name</Label>
            <Input value={cloneName} onChange={e => setCloneName(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCloneOpen(null)}>Cancel</Button>
            <Button className="gradient-primary" onClick={handleClone} disabled={cloneRole.isPending}>
              {cloneRole.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Clone
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Role Dialog */}
      <Dialog open={!!viewRole} onOpenChange={open => { if (!open) setViewRole(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className={`p-1.5 rounded ${viewRole?.color || 'bg-primary'}`}>
                <Shield className="h-4 w-4 text-white" />
              </div>
              {viewRole?.name}
            </DialogTitle>
          </DialogHeader>
          {viewRole && (
            <div className="space-y-3 py-4">
              <div><span className="text-sm font-medium">Slug:</span> <span className="text-sm text-muted-foreground">{viewRole.slug}</span></div>
              <div><span className="text-sm font-medium">Description:</span> <span className="text-sm text-muted-foreground">{viewRole.description || "—"}</span></div>
              <div><span className="text-sm font-medium">Users:</span> <span className="text-sm text-muted-foreground">{viewRole.user_count || 0}</span></div>
              <div><span className="text-sm font-medium">System Role:</span> <span className="text-sm text-muted-foreground">{viewRole.is_system ? "Yes" : "No"}</span></div>
              <div><span className="text-sm font-medium">Parent:</span> <span className="text-sm text-muted-foreground">{getParentName(viewRole.parent_role_id) || "None"}</span></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
