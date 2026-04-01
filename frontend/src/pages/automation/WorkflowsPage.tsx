import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Plus, Zap, Play, Trash2, Loader2, Activity, Settings2,
  ChevronRight, ArrowDown, CheckCircle2, XCircle, Clock,
  MoreHorizontal, Copy, Power, PowerOff,
} from "lucide-react";
import {
  useWorkflows, useCreateWorkflow, useUpdateWorkflow, useDeleteWorkflow,
  useWorkflowExecutions, TRIGGER_TYPES, ACTION_TYPES,
  useAddWorkflowAction, useWorkflowActions, useTriggerWorkflow, useDeleteWorkflowAction,
} from "@/hooks/useWorkflows";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = "builder" | "history";

const TRIGGER_COLORS: Record<string, string> = {
  lead_created:       "bg-blue-500",
  lead_stage_changed: "bg-violet-500",
  deal_created:       "bg-emerald-500",
  deal_stage_changed: "bg-teal-500",
  task_completed:     "bg-orange-500",
  contact_created:    "bg-pink-500",
};

const ACTION_COLORS: Record<string, string> = {
  create_task:   "bg-blue-500",
  send_email:    "bg-violet-500",
  change_stage:  "bg-emerald-500",
  add_tag:       "bg-orange-500",
  update_field:  "bg-cyan-500",
  send_webhook:  "bg-rose-500",
};

const EXEC_STATUS: Record<string, { color: string; icon: React.ElementType }> = {
  completed: { color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  failed:    { color: "bg-red-50 text-red-700 border-red-200",             icon: XCircle },
  running:   { color: "bg-blue-50 text-blue-700 border-blue-200",          icon: Loader2 },
  pending:   { color: "bg-yellow-50 text-yellow-700 border-yellow-200",    icon: Clock },
};

const EMPTY_WF = { name: "", description: "", trigger_type: "lead_created" };
const EMPTY_ACTION = { action_type: "create_task" };

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function WorkflowsPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("builder");
  const [createDialog, setCreateDialog] = useState(false);
  const [addActionDialog, setAddActionDialog] = useState(false);
  const [testDialog, setTestDialog] = useState(false);
  const [newWf, setNewWf] = useState(EMPTY_WF);
  const [newAction, setNewAction] = useState(EMPTY_ACTION);
  const [actionConfig, setActionConfig] = useState<Record<string, string>>({});

  const { data: workflows = [], isLoading } = useWorkflows();
  const { data: executions = [], refetch: refetchExec } = useWorkflowExecutions(selected || undefined);
  const { data: actionsData = [] } = useWorkflowActions(selected || "");
  const actions = Array.isArray(actionsData) ? actionsData : [];

  const createWf   = useCreateWorkflow();
  const updateWf   = useUpdateWorkflow();
  const deleteWf   = useDeleteWorkflow();
  const addAction  = useAddWorkflowAction();
  const delAction  = useDeleteWorkflowAction();
  const triggerWf  = useTriggerWorkflow();

  const selectedWf = workflows.find((w) => w.id === selected);

  const handleCreate = () => {
    if (!newWf.name.trim()) return;
    createWf.mutate(newWf, { onSuccess: () => { setCreateDialog(false); setNewWf(EMPTY_WF); } });
  };

  const toggleActive = (id: string, current: boolean) => {
    updateWf.mutate({ id, is_active: !current }, {
      onSuccess: () => toast.success(!current ? "Workflow activated" : "Workflow paused"),
    });
  };

  const handleAddAction = () => {
    if (!selected) return;
    addAction.mutate(
      { workflow_id: selected, action_type: newAction.action_type, action_config: actionConfig, sort_order: actions.length },
      { onSuccess: () => { setAddActionDialog(false); setActionConfig({}); setNewAction(EMPTY_ACTION); } }
    );
  };

  const handleTest = () => {
    if (!selected) return;
    triggerWf.mutate({ id: selected, entityType: "test", entityId: crypto.randomUUID() }, {
      onSuccess: () => { setTestDialog(false); setTab("history"); setTimeout(() => refetchExec(), 600); },
    });
  };

  useEffect(() => {
    const hasRunning = executions.some((e: any) => e.status === "running");
    if (hasRunning && selected) {
      const t = setInterval(() => refetchExec(), 3000);
      return () => clearInterval(t);
    }
  }, [executions, selected, refetchExec]);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden -m-6">

      {/* ── Sidebar ── */}
      <aside className="w-72 shrink-0 flex flex-col border-r border-border/50 bg-[hsl(var(--sidebar))] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/40">
          <div>
            <p className="text-sm font-semibold">Workflows</p>
            <p className="text-[11px] text-muted-foreground">{workflows.length} total</p>
          </div>
          <Button size="sm" className="h-7 gap-1 text-xs" onClick={() => setCreateDialog(true)}>
            <Plus className="h-3.5 w-3.5" /> New
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : workflows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-center px-4">
              <Zap className="h-8 w-8 text-muted-foreground/20" />
              <p className="text-sm text-muted-foreground">No workflows yet</p>
              <Button size="sm" variant="outline" className="gap-1.5 mt-1" onClick={() => setCreateDialog(true)}>
                <Plus className="h-3.5 w-3.5" /> Create first workflow
              </Button>
            </div>
          ) : workflows.map((wf) => (
            <button
              key={wf.id}
              onClick={() => setSelected(wf.id)}
              className={cn(
                "w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-colors group",
                selected === wf.id ? "bg-primary/10 text-primary" : "hover:bg-muted/60 text-foreground"
              )}
            >
              <div className={cn("mt-0.5 h-2 w-2 rounded-full shrink-0", wf.is_active ? "bg-emerald-500" : "bg-muted-foreground/30")} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{wf.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {TRIGGER_TYPES.find((t) => t.value === wf.trigger_type)?.label ?? wf.trigger_type}
                </p>
              </div>
              <Badge variant="outline" className={cn("text-[10px] shrink-0 mt-0.5", wf.is_active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "text-muted-foreground")}>
                {wf.is_active ? "On" : "Off"}
              </Badge>
            </button>
          ))}
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        {!selectedWf ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center">
              <Zap className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Select a workflow</p>
              <p className="text-xs text-muted-foreground/60 mt-0.5">or create a new one to get started</p>
            </div>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setCreateDialog(true)}>
              <Plus className="h-3.5 w-3.5" /> New Workflow
            </Button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-4 border-b border-border/40 shrink-0">
              <div className="flex items-center gap-3">
                <div className={cn("h-2.5 w-2.5 rounded-full", selectedWf.is_active ? "bg-emerald-500" : "bg-muted-foreground/30")} />
                <div>
                  <h1 className="text-base font-semibold">{selectedWf.name}</h1>
                  {selectedWf.description && <p className="text-xs text-muted-foreground">{selectedWf.description}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Tab switcher */}
                <div className="flex items-center bg-muted/50 rounded-md p-0.5 gap-0.5 border border-border/40">
                  {(["builder", "history"] as Tab[]).map((t) => (
                    <button key={t} onClick={() => setTab(t)} className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors capitalize", tab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                      {t === "builder" ? <Settings2 className="h-3.5 w-3.5" /> : <Activity className="h-3.5 w-3.5" />}{t}
                    </button>
                  ))}
                </div>
                <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={() => toggleActive(selectedWf.id, selectedWf.is_active)} disabled={updateWf.isPending}>
                  {selectedWf.is_active ? <><PowerOff className="h-3.5 w-3.5" />Pause</> : <><Power className="h-3.5 w-3.5" />Activate</>}
                </Button>
                <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={() => setTestDialog(true)} disabled={!selectedWf.is_active}>
                  <Play className="h-3.5 w-3.5" /> Test
                </Button>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => { deleteWf.mutate(selectedWf.id); setSelected(null); }}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8">
              {tab === "builder" ? (
                <BuilderView
                  workflow={selectedWf}
                  actions={actions}
                  onAddAction={() => setAddActionDialog(true)}
                  onDeleteAction={(id) => delAction.mutate(id)}
                  onToggle={() => toggleActive(selectedWf.id, selectedWf.is_active)}
                />
              ) : (
                <HistoryView executions={executions as any[]} />
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Create Workflow Dialog ── */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>New Workflow</DialogTitle><DialogDescription>Set up a trigger-based automation</DialogDescription></DialogHeader>
          <div className="space-y-3 py-1">
            <div className="space-y-1.5"><Label>Name *</Label><Input placeholder="e.g. Welcome new leads" value={newWf.name} onChange={(e) => setNewWf({ ...newWf, name: e.target.value })} autoFocus /></div>
            <div className="space-y-1.5"><Label>Description</Label><Textarea placeholder="What does this workflow do?" value={newWf.description} onChange={(e) => setNewWf({ ...newWf, description: e.target.value })} rows={2} /></div>
            <div className="space-y-1.5">
              <Label>Trigger</Label>
              <Select value={newWf.trigger_type} onValueChange={(v) => setNewWf({ ...newWf, trigger_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TRIGGER_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setCreateDialog(false)}>Cancel</Button>
            <Button size="sm" onClick={handleCreate} disabled={!newWf.name.trim() || createWf.isPending}>
              {createWf.isPending ? "Creating..." : "Create Workflow"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add Action Dialog ── */}
      <Dialog open={addActionDialog} onOpenChange={setAddActionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add Action</DialogTitle><DialogDescription>What should happen when this workflow triggers?</DialogDescription></DialogHeader>
          <div className="space-y-3 py-1">
            <div className="space-y-1.5">
              <Label>Action Type</Label>
              <Select value={newAction.action_type} onValueChange={(v) => { setNewAction({ action_type: v }); setActionConfig({}); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ACTION_TYPES.map((a) => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <ActionConfigFields type={newAction.action_type} config={actionConfig} onChange={setActionConfig} />
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setAddActionDialog(false)}>Cancel</Button>
            <Button size="sm" onClick={handleAddAction} disabled={addAction.isPending}>
              {addAction.isPending ? "Adding..." : "Add Action"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Test Dialog ── */}
      <Dialog open={testDialog} onOpenChange={setTestDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Test Workflow</DialogTitle><DialogDescription>Manually trigger "{selectedWf?.name}" to verify it works</DialogDescription></DialogHeader>
          <div className="py-2 space-y-2">
            <div className="rounded-lg bg-muted/30 p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">Trigger:</span>
                <span className="text-muted-foreground">{TRIGGER_TYPES.find((t) => t.value === selectedWf?.trigger_type)?.label}</span>
              </div>
              {actions.map((a, i) => (
                <div key={a.id} className="flex items-center gap-2 text-sm">
                  <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-[10px] flex items-center justify-center font-bold">{i + 1}</span>
                  <span className="text-muted-foreground">{ACTION_TYPES.find((at) => at.value === a.action_type)?.label}</span>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setTestDialog(false)}>Cancel</Button>
            <Button size="sm" onClick={handleTest} disabled={triggerWf.isPending}>
              {triggerWf.isPending ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />Running...</> : <><Play className="h-3.5 w-3.5 mr-1.5" />Run Test</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Builder View ─────────────────────────────────────────────────────────────
function BuilderView({ workflow, actions, onAddAction, onDeleteAction, onToggle }: {
  workflow: any; actions: any[]; onAddAction: () => void; onDeleteAction: (id: string) => void; onToggle: () => void;
}) {
  const triggerColor = TRIGGER_COLORS[workflow.trigger_type] ?? "bg-slate-500";
  const triggerLabel = TRIGGER_TYPES.find((t) => t.value === workflow.trigger_type)?.label ?? workflow.trigger_type;

  return (
    <div className="max-w-lg mx-auto space-y-0">
      {/* Status banner */}
      <div className={cn(
        "rounded-xl border px-5 py-3.5 mb-6 flex items-center justify-between",
        workflow.is_active ? "bg-emerald-50 border-emerald-200" : "bg-muted/30 border-border/50"
      )}>
        <div className="flex items-center gap-2.5">
          <div className={cn("h-2 w-2 rounded-full", workflow.is_active ? "bg-emerald-500" : "bg-muted-foreground/30")} />
          <p className="text-sm font-medium">{workflow.is_active ? "Workflow is active" : "Workflow is paused"}</p>
          <p className="text-xs text-muted-foreground">{workflow.is_active ? "Will trigger automatically" : "Won't trigger until activated"}</p>
        </div>
        <Switch checked={workflow.is_active} onCheckedChange={onToggle} />
      </div>

      {/* Trigger node */}
      <div className="relative">
        <div className="rounded-xl border-2 border-dashed border-yellow-300 bg-yellow-50 p-4 flex items-center gap-3">
          <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0", triggerColor)}>
            <Zap className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-yellow-700 mb-0.5">Trigger</p>
            <p className="text-sm font-medium">{triggerLabel}</p>
          </div>
          <Badge variant="outline" className="ml-auto text-[10px] bg-yellow-100 text-yellow-700 border-yellow-300">When</Badge>
        </div>
        {/* Connector */}
        {actions.length > 0 && (
          <div className="flex justify-center py-2">
            <div className="flex flex-col items-center gap-0.5">
              <div className="w-px h-4 bg-border" />
              <ArrowDown className="h-3 w-3 text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      {/* Action nodes */}
      {actions.map((action, i) => {
        const actionLabel = ACTION_TYPES.find((a) => a.value === action.action_type)?.label ?? action.action_type;
        const actionColor = ACTION_COLORS[action.action_type] ?? "bg-slate-500";
        const configEntries = action.action_config ? Object.entries(action.action_config).filter(([, v]) => v) : [];
        return (
          <div key={action.id} className="relative">
            <div className="rounded-xl border border-border/50 bg-card p-4 flex items-start gap-3 group hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-[10px] flex items-center justify-center font-bold">{i + 1}</span>
                </div>
                <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0", actionColor)}>
                  <Settings2 className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Action</p>
                  <p className="text-sm font-medium">{actionLabel}</p>
                  {configEntries.length > 0 && (
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                      {configEntries.map(([k, v]) => `${k}: ${v}`).join(" · ")}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => onDeleteAction(action.id)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded text-muted-foreground hover:text-destructive transition-all shrink-0"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            {i < actions.length - 1 && (
              <div className="flex justify-center py-2">
                <div className="flex flex-col items-center gap-0.5">
                  <div className="w-px h-4 bg-border" />
                  <ArrowDown className="h-3 w-3 text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Add action button */}
      <div className="flex justify-center pt-4">
        {actions.length > 0 && (
          <div className="flex flex-col items-center gap-0.5 mb-2">
            <div className="w-px h-4 bg-border" />
            <ArrowDown className="h-3 w-3 text-muted-foreground" />
          </div>
        )}
      </div>
      <button
        onClick={onAddAction}
        className="w-full rounded-xl border-2 border-dashed border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all py-4 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary"
      >
        <Plus className="h-4 w-4" /> Add Action
      </button>

      {actions.length === 0 && (
        <p className="text-center text-xs text-muted-foreground mt-3">Add at least one action to make this workflow useful</p>
      )}
    </div>
  );
}

// ─── History View ─────────────────────────────────────────────────────────────
function HistoryView({ executions }: { executions: any[] }) {
  if (executions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-2">
        <Activity className="h-8 w-8 text-muted-foreground/20" />
        <p className="text-sm text-muted-foreground">No executions yet</p>
        <p className="text-xs text-muted-foreground/60">Test the workflow or wait for it to trigger automatically</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-2">
      {executions.map((exec: any) => {
        const s = EXEC_STATUS[exec.status] ?? EXEC_STATUS.pending;
        const Icon = s.icon;
        const duration = exec.completed_at
          ? `${Math.round((new Date(exec.completed_at).getTime() - new Date(exec.started_at).getTime()) / 1000)}s`
          : null;
        return (
          <div key={exec.id} className="rounded-xl border border-border/50 bg-card p-4 flex items-center gap-4">
            <div className={cn("p-2 rounded-lg", s.color.split(" ")[0])}>
              <Icon className={cn("h-4 w-4", exec.status === "running" && "animate-spin", s.color.split(" ").slice(1).join(" "))} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn("text-[10px]", s.color)}>{exec.status}</Badge>
                {exec.steps && (
                  <span className="text-xs text-muted-foreground">
                    {exec.steps.filter((s: any) => s.status === "completed").length}/{exec.steps.length} steps
                  </span>
                )}
              </div>
              {exec.error_message && (
                <p className="text-xs text-destructive mt-1 truncate">{exec.error_message}</p>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs font-medium">{format(new Date(exec.started_at), "MMM d, HH:mm")}</p>
              {duration && <p className="text-[10px] text-muted-foreground">{duration}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Action Config Fields ─────────────────────────────────────────────────────
function ActionConfigFields({ type, config, onChange }: {
  type: string; config: Record<string, string>; onChange: (c: Record<string, string>) => void;
}) {
  const set = (k: string, v: string) => onChange({ ...config, [k]: v });

  if (type === "create_task") return (
    <div className="space-y-3">
      <div className="space-y-1.5"><Label>Task Title <span className="text-[10px] text-muted-foreground">(use {"{{title}}"} for entity name)</span></Label><Input placeholder="Follow up: {{title}}" value={config.title || ""} onChange={(e) => set("title", e.target.value)} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5"><Label>Priority</Label>
          <Select value={config.priority || "medium"} onValueChange={(v) => set("priority", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem></SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5"><Label>Due in (days)</Label><Input type="number" min={1} placeholder="3" value={config.due_days || ""} onChange={(e) => set("due_days", e.target.value)} /></div>
      </div>
    </div>
  );

  if (type === "send_email") return (
    <div className="space-y-3">
      <div className="space-y-1.5"><Label>Subject</Label><Input placeholder="Following up on {{title}}" value={config.subject || ""} onChange={(e) => set("subject", e.target.value)} /></div>
      <div className="space-y-1.5"><Label>Body</Label><Textarea placeholder="Email body..." value={config.body || ""} onChange={(e) => set("body", e.target.value)} rows={3} /></div>
    </div>
  );

  if (type === "change_stage") return (
    <div className="space-y-1.5"><Label>New Stage</Label><Input placeholder="e.g. qualified, proposal, won" value={config.stage || ""} onChange={(e) => set("stage", e.target.value)} /></div>
  );

  if (type === "add_tag") return (
    <div className="space-y-1.5"><Label>Tag</Label><Input placeholder="e.g. hot-lead" value={config.tag || ""} onChange={(e) => set("tag", e.target.value)} /></div>
  );

  if (type === "update_field") return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1.5"><Label>Field</Label><Input placeholder="e.g. priority" value={config.field || ""} onChange={(e) => set("field", e.target.value)} /></div>
      <div className="space-y-1.5"><Label>Value</Label><Input placeholder="e.g. high" value={config.value || ""} onChange={(e) => set("value", e.target.value)} /></div>
    </div>
  );

  if (type === "send_webhook") return (
    <div className="space-y-1.5"><Label>Webhook URL</Label><Input placeholder="https://hooks.example.com/..." value={config.url || ""} onChange={(e) => set("url", e.target.value)} /></div>
  );

  return null;
}
