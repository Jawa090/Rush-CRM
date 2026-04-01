import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, Mail, Phone, Edit, Trash2, Users, UserCheck, UserX, Building2 } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Employee {
  id: string; name: string; first_name: string; last_name: string;
  email: string; phone: string | null; department: string | null;
  position: string | null; hire_date: string; status: string;
  employee_id: string | null; salary: number | null; address: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  active:   "bg-emerald-50 text-emerald-700 border-emerald-200",
  inactive: "bg-red-50 text-red-700 border-red-200",
  on_leave: "bg-yellow-50 text-yellow-700 border-yellow-200",
};

const DEPT_COLORS = ["bg-blue-500","bg-violet-500","bg-emerald-500","bg-orange-500","bg-pink-500","bg-cyan-500","bg-rose-500","bg-amber-500"];

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function getDeptColor(dept: string) {
  let hash = 0;
  for (let i = 0; i < dept.length; i++) hash = dept.charCodeAt(i) + ((hash << 5) - hash);
  return DEPT_COLORS[Math.abs(hash) % DEPT_COLORS.length];
}

const EMPTY_FORM = { first_name: "", last_name: "", email: "", phone: "", department: "", position: "", salary: "", address: "" };

export default function EmployeesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const [dialog, setDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [deleting, setDeleting] = useState<Employee | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const qc = useQueryClient();

  const { data: resp, isLoading } = useQuery({
    queryKey: ["employees", search, statusFilter, deptFilter],
    queryFn: () => api.get("/employees", { params: { search, status: statusFilter !== "all" ? statusFilter : undefined, department: deptFilter !== "all" ? deptFilter : undefined } }),
    refetchInterval: 30000,
  });
  const employees: Employee[] = (resp as any)?.data || [];
  const departments = [...new Set(employees.map((e) => e.department).filter(Boolean))] as string[];

  const saveMutation = useMutation({
    mutationFn: (data: any) => editing ? api.put(`/employees/${editing.id}`, data) : api.post("/employees", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      toast.success(editing ? "Employee updated" : "Employee created");
      setDialog(false); setEditing(null); setForm(EMPTY_FORM);
    },
    onError: (e: any) => toast.error(e.response?.data?.error || "Failed"),
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/employees/${id}`, { status: "inactive" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["employees"] }); toast.success("Archived"); setDeleteDialog(false); setDeleting(null); },
    onError: (e: any) => toast.error(e.response?.data?.error || "Failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/employees/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["employees"] }); toast.success("Deleted"); setDeleteDialog(false); setDeleting(null); },
    onError: (e: any) => toast.error(e.response?.data?.error || "Failed"),
  });

  const openEdit = (emp: Employee) => {
    setEditing(emp);
    setForm({ first_name: emp.first_name || "", last_name: emp.last_name || "", email: emp.email || "", phone: emp.phone || "", department: emp.department || "", position: emp.position || "", salary: emp.salary?.toString() || "", address: emp.address || "" });
    setDialog(true);
  };

  const handleSave = () => {
    if (!form.first_name || !form.email) { toast.error("Name and email required"); return; }
    saveMutation.mutate({ ...form, salary: form.salary ? parseFloat(form.salary) : null });
  };

  const stats = [
    { label: "Total",       value: employees.length,                                          icon: Users,      color: "bg-blue-500" },
    { label: "Active",      value: employees.filter((e) => e.status === "active").length,     icon: UserCheck,  color: "bg-emerald-500" },
    { label: "Inactive",    value: employees.filter((e) => e.status === "inactive").length,   icon: UserX,      color: "bg-red-500" },
    { label: "Departments", value: departments.length,                                         icon: Building2,  color: "bg-violet-500" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Employees</h1>
          <p className="text-sm text-muted-foreground">Manage your organization's staff</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => { setEditing(null); setForm(EMPTY_FORM); setDialog(true); }}>
          <Plus className="h-3.5 w-3.5" /> Add Employee
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border/50 bg-card p-4">
            <div className={cn("p-1.5 rounded-lg w-fit mb-2", s.color)}>
              <s.icon className="h-3.5 w-3.5 text-white" />
            </div>
            <p className="text-2xl font-bold tabular-nums">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input className="pl-8 h-8 text-sm" placeholder="Search employees..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 w-32 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="on_leave">On Leave</SelectItem>
          </SelectContent>
        </Select>
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="h-8 w-40 text-sm"><SelectValue placeholder="All Departments" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Employee list */}
      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border/40">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Employees ({employees.length})</span>
        </div>
        <div className="flex items-center gap-3 px-5 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider border-b border-border/30 bg-muted/20">
          <span className="flex-1">Name</span>
          <span className="w-40 hidden md:block">Contact</span>
          <span className="w-28 hidden sm:block">Department</span>
          <span className="w-24 hidden lg:block">Hired</span>
          <span className="w-20 text-center">Status</span>
          <span className="w-16" />
        </div>
        <div className="divide-y divide-border/40">
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3 animate-pulse">
                <div className="h-8 w-8 rounded-full bg-muted" />
                <div className="flex-1 h-4 bg-muted rounded" />
              </div>
            ))
          ) : employees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <Users className="h-10 w-10 text-muted-foreground/20" />
              <p className="text-sm text-muted-foreground">No employees found</p>
              <Button size="sm" variant="outline" onClick={() => setDialog(true)} className="gap-1.5 mt-1">
                <Plus className="h-3.5 w-3.5" /> Add first employee
              </Button>
            </div>
          ) : employees.map((emp) => {
            const name = emp.name || `${emp.first_name} ${emp.last_name}`.trim();
            return (
              <div key={emp.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors group">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className={cn("text-[11px] text-white", emp.department ? getDeptColor(emp.department) : "bg-primary")}>
                      {getInitials(name || "?")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{name}</p>
                    {emp.position && <p className="text-[11px] text-muted-foreground truncate">{emp.position}</p>}
                  </div>
                </div>
                <div className="w-40 hidden md:block">
                  <p className="text-xs text-muted-foreground flex items-center gap-1 truncate"><Mail className="h-3 w-3 shrink-0" />{emp.email}</p>
                  {emp.phone && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Phone className="h-3 w-3 shrink-0" />{emp.phone}</p>}
                </div>
                <div className="w-28 hidden sm:block">
                  {emp.department ? (
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className={cn("h-2 w-2 rounded-full", getDeptColor(emp.department))} />
                      {emp.department}
                    </span>
                  ) : <span className="text-xs text-muted-foreground/40">—</span>}
                </div>
                <div className="w-24 hidden lg:block">
                  <p className="text-xs text-muted-foreground">{format(new Date(emp.hire_date), "MMM d, yyyy")}</p>
                </div>
                <div className="w-20 flex justify-center">
                  <Badge variant="outline" className={cn("text-[10px] capitalize", STATUS_COLORS[emp.status] ?? "bg-muted text-muted-foreground")}>
                    {emp.status.replace("_", " ")}
                  </Badge>
                </div>
                <div className="w-16 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(emp)} className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => { setDeleting(emp); setDeleteDialog(true); }} className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-muted transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create/Edit dialog */}
      <Dialog open={dialog} onOpenChange={(o) => { setDialog(o); if (!o) { setEditing(null); setForm(EMPTY_FORM); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit Employee" : "Add Employee"}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>First Name *</Label><Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} placeholder="John" /></div>
              <div className="space-y-1.5"><Label>Last Name</Label><Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} placeholder="Doe" /></div>
            </div>
            <div className="space-y-1.5"><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@company.com" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 555 0000" /></div>
              <div className="space-y-1.5"><Label>Salary</Label><Input type="number" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} placeholder="50000" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Department</Label><Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Engineering" /></div>
              <div className="space-y-1.5"><Label>Position</Label><Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="Software Engineer" /></div>
            </div>
            <div className="space-y-1.5"><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123 Main St" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDialog(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving..." : editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Employee</AlertDialogTitle>
            <AlertDialogDescription>
              What would you like to do with <strong>{deleting?.name || `${deleting?.first_name} ${deleting?.last_name}`}</strong>?
              Archive keeps all records; Delete is permanent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleting && archiveMutation.mutate(deleting.id)} className="bg-yellow-600 hover:bg-yellow-700" disabled={archiveMutation.isPending}>
              {archiveMutation.isPending ? "Archiving..." : "Archive"}
            </AlertDialogAction>
            <AlertDialogAction onClick={() => deleting && deleteMutation.mutate(deleting.id)} className="bg-red-600 hover:bg-red-700" disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
