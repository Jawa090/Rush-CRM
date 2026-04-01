import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Search, UserPlus, Shield, Users, UserX, Plus, Mail, Building, Loader2, Trash2, Edit, ChevronLeft, ChevronRight, Clock, UserCog, Copy, Check, RefreshCw, KeyRound } from "lucide-react";
import { useAdminUsers, AdminUser } from "@/hooks/useAdminUsers";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format } from "date-fns";

const departments = ["IT", "Sales", "Marketing", "HR", "Finance", "Operations", "Engineering", "Support"];
const PAGE_SIZE = 10;

export default function UsersPage() {
  const { users, invites, roles, isLoading, sendInvite, adminCreateUser, updateUser, updateUserRole, deleteInvite, resetPassword } = useAdminUsers();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const [page, setPage] = useState(0);

  // Invite dialog
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: "", fullName: "", role: "", department: "" });

  // Add user manually dialog
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [addUserForm, setAddUserForm] = useState({ email: "", fullName: "", role: "", department: "", phone: "" });
  const [createdUserResult, setCreatedUserResult] = useState<{ email: string; tempPassword: string } | null>(null);
  const [resetResult, setResetResult] = useState<{ email: string; fullName: string; tempPassword: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Edit dialog
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState({ full_name: "", department: "", job_title: "", phone: "", status: "" });

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = !search || u.full_name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      const matchesStatus = statusFilter === "all" || u.status === statusFilter;
      const matchesDept = deptFilter === "all" || u.department === deptFilter;
      return matchesSearch && matchesRole && matchesStatus && matchesDept;
    });
  }, [users, search, roleFilter, statusFilter, deptFilter]);

  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);
  const paginatedUsers = filteredUsers.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter(u => u.status === "active").length;
    const admins = users.filter(u => u.role === "admin" || u.role === "super_admin").length;
    const inactive = users.filter(u => u.status === "inactive").length;
    return [
      { title: "Total Users", value: total, icon: Users, color: "text-primary" },
      { title: "Active Users", value: active, icon: UserPlus, color: "text-[hsl(var(--success))]" },
      { title: "Admins", value: admins, icon: Shield, color: "text-[hsl(var(--chart-4))]" },
      { title: "Inactive", value: inactive, icon: UserX, color: "text-destructive" },
    ];
  }, [users]);

  const pendingInvites = invites.filter(i => !i.accepted_at);

  const getRoleColor = (role: string | null) => {
    switch (role) {
      case "super_admin": case "admin": return "bg-[hsl(var(--chart-4))]/10 text-[hsl(var(--chart-4))] border-[hsl(var(--chart-4))]/20";
      case "manager": return "bg-primary/10 text-primary border-primary/20";
      case "sales_rep": return "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]/20";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]/20";
      case "inactive": return "bg-destructive/10 text-destructive border-destructive/20";
      case "pending": return "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/20";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  const handleInviteSubmit = () => {
    if (!inviteForm.email || !inviteForm.role) return;
    sendInvite.mutate({ email: inviteForm.email, role: inviteForm.role, fullName: inviteForm.fullName, department: inviteForm.department });
    setInviteForm({ email: "", fullName: "", role: "", department: "" });
    setInviteOpen(false);
  };

  const handleAddUserSubmit = () => {
    if (!addUserForm.email || !addUserForm.fullName || !addUserForm.role) return;
    const role = roles.find((r: any) => r.slug === addUserForm.role);
    adminCreateUser.mutate(
      { 
        email: addUserForm.email, 
        fullName: addUserForm.fullName, 
        roleSlug: addUserForm.role, 
        roleId: role?.id,
        department: addUserForm.department, 
        phone: addUserForm.phone 
      },
      {
        onSuccess: (data) => {
          setCreatedUserResult({ email: addUserForm.email, tempPassword: data.temp_password });
          setAddUserForm({ email: "", fullName: "", role: "", department: "", phone: "" });
          setAddUserOpen(false);
        },
      }
    );
  };

  const handleCopyCredentials = () => {
    if (!createdUserResult) return;
    navigator.clipboard.writeText(`Email: ${createdUserResult.email}\nTemporary Password: ${createdUserResult.tempPassword}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResendInvite = (invite: any) => {
    sendInvite.mutate({ email: invite.email, role: invite.role, fullName: "", department: "" });
  };

  const handleEditOpen = (user: AdminUser) => {
    setEditUser(user);
    setEditForm({
      full_name: user.full_name,
      department: user.department || "",
      job_title: user.job_title || "",
      phone: user.phone || "",
      status: user.status,
    });
  };

  const handleEditSave = () => {
    if (!editUser) return;
    updateUser.mutate({ userId: editUser.id, updates: editForm });
    setEditUser(null);
  };

  const handleRoleChange = (userId: string, roleSlug: string) => {
    const role = roles.find((r: any) => r.slug === roleSlug);
    if (role) {
      updateUserRole.mutate({ userId, roleSlug, roleId: role.id });
    }
  };

  const handleStatusToggle = (user: AdminUser) => {
    const newStatus = user.status === "active" ? "inactive" : "active";
    updateUser.mutate({ userId: user.id, updates: { status: newStatus } });
  };

  const handleResetPassword = (user: AdminUser) => {
    resetPassword.mutate(user.id, {
      onSuccess: (data) => {
        setResetResult({ email: user.email, fullName: user.full_name, tempPassword: data.temp_password });
      },
    });
  };

  const handleCopyResetCredentials = () => {
    if (!resetResult) return;
    navigator.clipboard.writeText(`Email: ${resetResult.email}\nNew Temporary Password: ${resetResult.tempPassword}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-4">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">Manage system users and access</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <UserCog className="mr-2 h-4 w-4" />
                Add User Manually
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><UserCog className="h-5 w-5" /> Add User Manually</DialogTitle>
                <DialogDescription>Create a user account with a temporary password. They must change it on first login.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input placeholder="John Smith" value={addUserForm.fullName} onChange={e => setAddUserForm({ ...addUserForm, fullName: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input type="email" placeholder="john@company.com" value={addUserForm.email} onChange={e => setAddUserForm({ ...addUserForm, email: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Role *</Label>
                    <Select value={addUserForm.role} onValueChange={v => setAddUserForm({ ...addUserForm, role: v })}>
                      <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                      <SelectContent>
                        {roles.map((r: any) => <SelectItem key={r.id} value={r.slug}>{r.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Select value={addUserForm.department} onValueChange={v => setAddUserForm({ ...addUserForm, department: v })}>
                      <SelectTrigger><SelectValue placeholder="Select dept" /></SelectTrigger>
                      <SelectContent>
                        {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input placeholder="+1 (555) 000-0000" value={addUserForm.phone} onChange={e => setAddUserForm({ ...addUserForm, phone: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddUserOpen(false)}>Cancel</Button>
                <Button className="gradient-primary" onClick={handleAddUserSubmit} disabled={adminCreateUser.isPending}>
                  {adminCreateUser.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create User
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary">
                <Plus className="mr-2 h-4 w-4" />
                Invite User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Mail className="h-5 w-5" /> Invite New User</DialogTitle>
                <DialogDescription>Send an invitation email. The user will be able to join your organization.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input placeholder="John Smith" value={inviteForm.fullName} onChange={e => setInviteForm({ ...inviteForm, fullName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Email Address *</Label>
                  <Input type="email" placeholder="john@company.com" value={inviteForm.email} onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Role *</Label>
                    <Select value={inviteForm.role} onValueChange={v => setInviteForm({ ...inviteForm, role: v })}>
                      <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                      <SelectContent>
                        {roles.map((r: any) => (
                          <SelectItem key={r.id} value={r.slug}>{r.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Select value={inviteForm.department} onValueChange={v => setInviteForm({ ...inviteForm, department: v })}>
                      <SelectTrigger><SelectValue placeholder="Select dept" /></SelectTrigger>
                      <SelectContent>
                        {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
                <Button className="gradient-primary" onClick={handleInviteSubmit} disabled={sendInvite.isPending}>
                  {sendInvite.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Invitation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map(stat => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending Invites */}
      {pendingInvites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Clock className="h-5 w-5 text-[hsl(var(--warning))]" /> Pending Invitations ({pendingInvites.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingInvites.map(invite => (
                <div key={invite.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{invite.email}</p>
                    <p className="text-sm text-muted-foreground">Role: {invite.role} · Sent: {format(new Date(invite.created_at), 'MMM d, yyyy')} · Expires: {format(new Date(invite.expires_at), 'MMM d, yyyy')}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" title="Resend invitation" onClick={() => handleResendInvite(invite)} disabled={sendInvite.isPending}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Cancel invitation" onClick={() => deleteInvite.mutate(invite.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>All Users</CardTitle>
              <CardDescription>Manage user accounts and access levels</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="relative w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search users..." className="pl-9" value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} />
              </div>
              <Select value={roleFilter} onValueChange={v => { setRoleFilter(v); setPage(0); }}>
                <SelectTrigger className="w-32"><SelectValue placeholder="Role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map((r: any) => <SelectItem key={r.id} value={r.slug}>{r.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(0); }}>
                <SelectTrigger className="w-32"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Select value={deptFilter} onValueChange={v => { setDeptFilter(v); setPage(0); }}>
                <SelectTrigger className="w-36"><SelectValue placeholder="Department" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Depts</SelectItem>
                  {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    {search || roleFilter !== "all" || statusFilter !== "all" ? "No users match your filters" : "No users found"}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.full_name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getRoleColor(user.role)}>
                        {user.role_name || user.role || "—"}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.department || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(user.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEditOpen(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Shield className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Toggle User Status</AlertDialogTitle>
                              <AlertDialogDescription>
                                {user.status === "active" 
                                  ? `Deactivate ${user.full_name}? They won't be able to access the system.`
                                  : `Activate ${user.full_name}? They will regain access.`}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleStatusToggle(user)}>
                                {user.status === "active" ? "Deactivate" : "Activate"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        {user.status === "active" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" title="Reset Password">
                                <KeyRound className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Reset Password</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Generate a new temporary password for <strong>{user.full_name}</strong> ({user.email})? They will be required to change it on next login.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleResetPassword(user)} disabled={resetPassword.isPending}>
                                  {resetPassword.isPending ? "Resetting..." : "Reset Password"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filteredUsers.length)} of {filteredUsers.length}
              </p>
              <div className="flex gap-1">
                <Button variant="outline" size="icon" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={!!editUser} onOpenChange={open => { if (!open) setEditUser(null); }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user details and role assignment</DialogDescription>
          </DialogHeader>
          {editUser && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={editForm.full_name} onChange={e => setEditForm({ ...editForm, full_name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select value={editForm.department} onValueChange={v => setEditForm({ ...editForm, department: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Job Title</Label>
                  <Input value={editForm.job_title} onChange={e => setEditForm({ ...editForm, job_title: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={editUser.role || ""} onValueChange={v => handleRoleChange(editUser.id, v)}>
                  <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                  <SelectContent>
                    {roles.map((r: any) => <SelectItem key={r.id} value={r.slug}>{r.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label>Active Status</Label>
                <Switch checked={editForm.status === "active"} onCheckedChange={checked => setEditForm({ ...editForm, status: checked ? "active" : "inactive" })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>Cancel</Button>
            <Button className="gradient-primary" onClick={handleEditSave} disabled={updateUser.isPending}>
              {updateUser.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Created User Credentials Dialog */}
      <Dialog open={!!createdUserResult} onOpenChange={open => { if (!open) setCreatedUserResult(null); }}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[hsl(var(--success))]">
              <Check className="h-5 w-5" /> User Created Successfully
            </DialogTitle>
            <DialogDescription>
              Share these credentials with the user. They will be required to change their password on first login.
            </DialogDescription>
          </DialogHeader>
          {createdUserResult && (
            <div className="space-y-4 py-4">
              <div className="rounded-lg border bg-muted/50 p-4 space-y-2 font-mono text-sm">
                <p><span className="text-muted-foreground">Email:</span> {createdUserResult.email}</p>
                <p><span className="text-muted-foreground">Temporary Password:</span> {createdUserResult.tempPassword}</p>
              </div>
              <Button variant="outline" className="w-full" onClick={handleCopyCredentials}>
                {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                {copied ? "Copied!" : "Copy Credentials"}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                ⚠️ This is the only time the temporary password will be shown. Make sure to save it.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button className="gradient-primary" onClick={() => setCreatedUserResult(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Result Dialog */}
      <Dialog open={!!resetResult} onOpenChange={open => { if (!open) { setResetResult(null); setCopied(false); } }}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[hsl(var(--chart-4))]">
              <KeyRound className="h-5 w-5" /> Password Reset Successfully
            </DialogTitle>
            <DialogDescription>
              Share the new temporary password with {resetResult?.fullName}. They must change it on next login.
            </DialogDescription>
          </DialogHeader>
          {resetResult && (
            <div className="space-y-4 py-4">
              <div className="rounded-lg border bg-muted/50 p-4 space-y-2 font-mono text-sm">
                <p><span className="text-muted-foreground">Email:</span> {resetResult.email}</p>
                <p><span className="text-muted-foreground">New Temporary Password:</span> {resetResult.tempPassword}</p>
              </div>
              <Button variant="outline" className="w-full" onClick={handleCopyResetCredentials}>
                {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                {copied ? "Copied!" : "Copy Credentials"}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                ⚠️ This is the only time the temporary password will be shown. Make sure to save it.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button className="gradient-primary" onClick={() => { setResetResult(null); setCopied(false); }}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
