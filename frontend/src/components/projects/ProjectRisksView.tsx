import { useState } from "react";
import { Plus, AlertTriangle, Shield, Bug, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useProjectRisks, useCreateRisk, useUpdateRisk, type ProjectRisk } from "@/hooks/useProjectFeatures";

const severityConfig: Record<string, { color: string; icon: typeof AlertTriangle }> = {
  critical: { color: "bg-destructive/10 text-destructive", icon: AlertTriangle },
  high: { color: "bg-destructive/10 text-destructive", icon: AlertTriangle },
  medium: { color: "bg-warning/10 text-warning", icon: Shield },
  low: { color: "bg-muted text-muted-foreground", icon: Bug },
};

const statusColors: Record<string, string> = {
  open: "bg-destructive/10 text-destructive",
  mitigating: "bg-warning/10 text-warning",
  resolved: "bg-success/10 text-success",
  closed: "bg-muted text-muted-foreground",
};

export function ProjectRisksView({ projectId }: { projectId: string }) {
  const { data: risks = [], isLoading } = useProjectRisks(projectId);
  const createRisk = useCreateRisk();
  const updateRisk = useUpdateRisk();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({ title: "", description: "", severity: "medium", category: "risk", mitigation_plan: "" });

  const filtered = risks.filter(r => filter === "all" || r.status === filter);
  const stats = {
    open: risks.filter(r => r.status === "open").length,
    mitigating: risks.filter(r => r.status === "mitigating").length,
    resolved: risks.filter(r => r.status === "resolved").length,
  };

  const handleCreate = () => {
    createRisk.mutate(
      { project_id: projectId, ...form },
      { onSuccess: () => { setDialogOpen(false); setForm({ title: "", description: "", severity: "medium", category: "risk", mitigation_plan: "" }); } }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold">Risks & Issues</h3>
          <Badge variant="outline">{risks.length} total</Badge>
          {stats.open > 0 && <Badge variant="destructive">{stats.open} open</Badge>}
          {stats.mitigating > 0 && <Badge className="bg-warning/10 text-warning border-warning/20">{stats.mitigating} mitigating</Badge>}
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="mitigating">Mitigating</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" className="gap-1" onClick={() => setDialogOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Add
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground text-center py-8">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Shield className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No risks or issues found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(risk => {
            const sev = severityConfig[risk.severity] || severityConfig.medium;
            const SevIcon = sev.icon;
            return (
              <Card key={risk.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <SevIcon className={cn("h-5 w-5 mt-0.5 shrink-0", sev.color.split(" ")[1])} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{risk.title}</p>
                        {risk.description && <p className="text-xs text-muted-foreground mt-1">{risk.description}</p>}
                        {risk.mitigation_plan && (
                          <p className="text-xs text-muted-foreground mt-2 border-l-2 border-primary/30 pl-2 italic">
                            Mitigation: {risk.mitigation_plan}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className={cn("text-[10px] capitalize", sev.color)}>{risk.severity}</Badge>
                          <Badge variant="outline" className="text-[10px] capitalize">{risk.category}</Badge>
                          {risk.due_date && <span className="text-[10px] text-muted-foreground">Due: {new Date(risk.due_date).toLocaleDateString()}</span>}
                        </div>
                      </div>
                    </div>
                    <Select value={risk.status} onValueChange={(v) => updateRisk.mutate({ id: risk.id, status: v, ...(v === "resolved" ? { resolved_at: new Date().toISOString() } : {}) })}>
                      <SelectTrigger className="w-28 h-7 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="mitigating">Mitigating</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Risk / Issue</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Risk title" /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Severity</Label>
                <Select value={form.severity} onValueChange={v => setForm(f => ({ ...f, severity: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="risk">Risk</SelectItem>
                    <SelectItem value="issue">Issue</SelectItem>
                    <SelectItem value="blocker">Blocker</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Mitigation Plan</Label><Textarea value={form.mitigation_plan} onChange={e => setForm(f => ({ ...f, mitigation_plan: e.target.value }))} placeholder="How to address this risk..." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!form.title || createRisk.isPending}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
