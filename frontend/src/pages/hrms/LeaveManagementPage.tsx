import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, Calendar, CheckCircle, XCircle, AlertCircle, Clock, CalendarDays } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";

interface LeaveRequest {
  id: string; employee_id: string; employee_name: string;
  leave_type_id: string; leave_type_name: string;
  start_date: string; end_date: string; days_requested: number;
  reason: string; status: string; created_at: string;
  approved_by: string | null; approved_at: string | null; rejection_reason: string | null;
}
interface LeaveType { id: string; name: string; days_allowed: number; description: string; }

const STATUS_COLORS: Record<string, string> = {
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  pending:  "bg-yellow-50 text-yellow-700 border-yellow-200",
};
const STATUS_ICONS: Record<string, React.ElementType> = {
  approved: CheckCircle, rejected: XCircle, pending: AlertCircle,
};

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

const EMPTY_FORM = { leave_type_id: "", start_date: "", end_date: "", reason: "" };

export default function LeaveManagementPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createDialog, setCreateDialog] = useState(false);
  const [approvalDialog, setApprovalDialog] = useState(false);
  const [selected, setSelected] = useState<LeaveRequest | null>(null);
  const [comments, setComments] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const qc = useQueryClient();

  const { data: resp, isLoading } = useQuery({
    queryKey: ["leave-requests", search, statusFilter],
    queryFn: () => api.get("/leave", { params: { search, status: statusFilter !== "all" ? statusFilter : undefined } }),
    refetchInterval: 30000,
  });
  const requests: LeaveRequest[] = (resp as any)?.data || [];

  const { data: typesResp } = useQuery({
    queryKey: ["leave-types"],
    queryFn: () => api.get("/leave/types"),
  });
  const leaveTypes: LeaveType[] = (typesResp as any)?.data || [];

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post("/leave", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leave-requests"] });
      toast.success("Leave request submitted");
      setCreateDialog(false); setForm(EMPTY_FORM);
    },
    onError: (e: any) => toast.error(e.response?.data?.error || "Failed"),
  });

  const approvalMutation = useMutation({
    mutationFn: ({ id, status, rejection_reason }: { id: string; status: string; rejection_reason?: string }) =>
      api.patch(`/leave/${id}`, { status, rejection_reason }),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ["leave-requests"] });
      toast.success(`Leave ${v.status}`);
      setApprovalDialog(false); setSelected(null); setComments("");
    },
    onError: (e: any) => toast.error(e.response?.data?.error || "Failed"),
  });

  const handleSubmit = () => {
    if (!form.leave_type_id || !form.start_date || !form.end_date || !form.reason) {
      toast.error("All fields required"); return;
    }
    if (new Date(form.end_date) < new Date(form.start_date)) {
      toast.error("End date must be after start date"); return;
    }
    createMutation.mutate({ ...form, days_requested: differenceInDays(new Date(form.end_date), new Date(form.start_date)) + 1 });
  };

  const pending  = requests.filter((r) => r.status === "pending").length;
  const approved = requests.filter((r) => r.status === "approved").length;
  const rejected = requests.filter((r) => r.status === "rejected").length;

  const stats = [
    { label: "Pending",  value: pending,          color: "bg-yellow-500",  icon: AlertCircle },
    { label: "Approved", value: approved,          color: "bg-emerald-500", icon: CheckCircle },
    { label: "Rejected", value: rejected,          color: "bg-red-500",     icon: XCircle },
    { label: "Total",    value: requests.length,   color: "bg-blue-500",    icon: CalendarDays },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Leave Management</h1>
          <p className="text-sm text-muted-foreground">Manage employee leave requests</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setCreateDialog(true)}>
          <Plus className="h-3.5 w-3.5" /> Request Leave
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
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input className="pl-8 h-8 text-sm" placeholder="Search requests..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 w-32 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Requests list */}
      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border/40">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Leave Requests ({requests.length})</span>
        </div>
        <div className="flex items-center gap-3 px-5 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider border-b border-border/30 bg-muted/20">
          <span className="flex-1">Employee</span>
          <span className="w-24 hidden sm:block">Type</span>
          <span className="w-32 hidden md:block">Dates</span>
          <span className="w-12 text-center hidden md:block">Days</span>
          <span className="w-20 text-center">Status</span>
          <span className="w-20" />
        </div>
        <div className="divide-y divide-border/40">
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3 animate-pulse">
                <div className="h-8 w-8 rounded-full bg-muted" />
                <div className="flex-1 h-4 bg-muted rounded" />
              </div>
            ))
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <Calendar className="h-10 w-10 text-muted-foreground/20" />
              <p className="text-sm text-muted-foreground">No leave requests</p>
            </div>
          ) : requests.map((r) => {
            const Icon = STATUS_ICONS[r.status] ?? Clock;
            return (
              <div key={r.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{getInitials(r.employee_name || "?")}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{r.employee_name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{r.reason}</p>
                  </div>
                </div>
                <span className="w-24 text-xs text-muted-foreground hidden sm:block truncate">{r.leave_type_name}</span>
                <span className="w-32 text-xs text-muted-foreground hidden md:block">
                  {format(new Date(r.start_date), "MMM d")} – {format(new Date(r.end_date), "MMM d, yyyy")}
                </span>
                <span className="w-12 text-center text-xs font-medium hidden md:block">{r.days_requested}d</span>
                <div className="w-20 flex justify-center">
                  <Badge variant="outline" className={cn("text-[10px] capitalize gap-1", STATUS_COLORS[r.status] ?? "")}>
                    <Icon className="h-2.5 w-2.5" />{r.status}
                  </Badge>
                </div>
                <div className="w-20 flex justify-end gap-1">
                  {r.status === "pending" && (
                    <>
                      <button
                        onClick={() => approvalMutation.mutate({ id: r.id, status: "approved" })}
                        className="p-1 rounded text-emerald-600 hover:bg-emerald-50 transition-colors"
                        title="Approve"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => { setSelected(r); setApprovalDialog(true); }}
                        className="p-1 rounded text-red-500 hover:bg-red-50 transition-colors"
                        title="Reject"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create dialog */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Request Leave</DialogTitle><DialogDescription>Submit a leave request for approval</DialogDescription></DialogHeader>
          <div className="space-y-3 py-1">
            <div className="space-y-1.5">
              <Label>Leave Type *</Label>
              <Select value={form.leave_type_id} onValueChange={(v) => setForm({ ...form, leave_type_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {leaveTypes.map((t) => <SelectItem key={t.id} value={t.id}>{t.name} ({t.days_allowed} days)</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Start Date *</Label><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>End Date *</Label><Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div>
            </div>
            {form.start_date && form.end_date && (
              <p className="text-xs text-muted-foreground">
                Duration: {differenceInDays(new Date(form.end_date), new Date(form.start_date)) + 1} days
              </p>
            )}
            <div className="space-y-1.5">
              <Label>Reason *</Label>
              <Textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Reason for leave..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setCreateDialog(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSubmit} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection dialog */}
      <Dialog open={approvalDialog} onOpenChange={setApprovalDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Reject Leave Request</DialogTitle>
            <DialogDescription>
              {selected && `${selected.employee_name} — ${selected.leave_type_name}, ${selected.days_requested} days`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1">
            {selected && (
              <div className="rounded-lg bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                {selected.reason}
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Rejection Reason (optional)</Label>
              <Textarea value={comments} onChange={(e) => setComments(e.target.value)} placeholder="Explain why..." rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setApprovalDialog(false)}>Cancel</Button>
            <Button size="sm" variant="destructive" onClick={() => selected && approvalMutation.mutate({ id: selected.id, status: "rejected", rejection_reason: comments })} disabled={approvalMutation.isPending}>
              {approvalMutation.isPending ? "Rejecting..." : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
