import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Share2, CheckCircle2, Clock, AlertTriangle, Users,
  MoreHorizontal, Plus, ChevronRight, Flag, CalendarDays,
  LayoutList, Kanban, BarChart2, Milestone, UserCircle2,
  DollarSign, FileText, ShieldAlert, Paperclip, Bell, Activity,
  Circle, Eye, ChevronDown, Pencil, Check, X, Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  useProject, useUpdateProject, useProjectTasks,
  useProjectMembers, useProjectMilestones,
} from "@/hooks/useProjectManagement";
import { ProjectKanbanBoard } from "@/components/projects/ProjectKanbanBoard";
import { ProjectGanttChart } from "@/components/projects/ProjectGanttChart";
import { ProjectMilestonesView } from "@/components/projects/ProjectMilestonesView";
import { ProjectResourceView } from "@/components/projects/ProjectResourceView";
import { ProjectTimeBudget } from "@/components/projects/ProjectTimeBudget";
import { ProjectActivityFeed } from "@/components/projects/ProjectActivityFeed";
import { ProjectRisksView } from "@/components/projects/ProjectRisksView";
import { ProjectInvoicesView } from "@/components/projects/ProjectInvoicesView";
import { ProjectNotificationsPanel } from "@/components/projects/ProjectNotificationsPanel";
import { ProjectCommentsSection } from "@/components/projects/ProjectCommentsSection";
import { ProjectShareDialog } from "@/components/projects/ProjectShareDialog";
import { SaveAsTemplateButton } from "@/components/projects/ProjectTemplatesDialog";
import { EntityFilesSection } from "@/components/crm/EntityFilesSection";
import { format, isPast, isToday } from "date-fns";
import { useCreateTask, useUpdateTask, useDeleteTask } from "@/hooks/useTasks";
import { useOrganizationProfiles } from "@/hooks/useTenantQuery";

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_OPTS = [
  { value: "active",    label: "Active",    dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { value: "on_hold",   label: "On Hold",   dot: "bg-yellow-500",  badge: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  { value: "completed", label: "Completed", dot: "bg-blue-500",    badge: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "cancelled", label: "Cancelled", dot: "bg-red-500",     badge: "bg-red-50 text-red-700 border-red-200" },
  { value: "planning",  label: "Planning",  dot: "bg-violet-500",  badge: "bg-violet-50 text-violet-700 border-violet-200" },
];

const TASK_STATUS = [
  { value: "todo",        label: "To Do",       icon: Circle,       color: "text-slate-400" },
  { value: "in_progress", label: "In Progress", icon: Activity,     color: "text-blue-500" },
  { value: "in_review",   label: "In Review",   icon: Eye,          color: "text-amber-500" },
  { value: "done",        label: "Done",        icon: CheckCircle2, color: "text-emerald-500" },
];

const PRIORITY_OPTS = [
  { value: "low",    label: "Low",    color: "text-slate-400",  dot: "bg-slate-300" },
  { value: "medium", label: "Medium", color: "text-yellow-500", dot: "bg-yellow-400" },
  { value: "high",   label: "High",   color: "text-orange-500", dot: "bg-orange-400" },
  { value: "urgent", label: "Urgent", color: "text-red-500",    dot: "bg-red-500" },
];

const PROJECT_COLORS = [
  "bg-violet-500","bg-blue-500","bg-cyan-500","bg-emerald-500",
  "bg-yellow-500","bg-orange-500","bg-rose-500","bg-pink-500",
];

type Section =
  | "overview" | "tasks" | "board" | "gantt"
  | "milestones" | "resources" | "budget" | "invoices"
  | "risks" | "files" | "notifications" | "activity";

const NAV: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: "overview",      label: "Overview",      icon: LayoutList },
  { id: "tasks",         label: "Tasks",         icon: CheckCircle2 },
  { id: "board",         label: "Board",         icon: Kanban },
  { id: "gantt",         label: "Timeline",      icon: BarChart2 },
  { id: "milestones",    label: "Milestones",    icon: Milestone },
  { id: "resources",     label: "Resources",     icon: UserCircle2 },
  { id: "budget",        label: "Time & Budget", icon: DollarSign },
  { id: "invoices",      label: "Invoices",      icon: FileText },
  { id: "risks",         label: "Risks",         icon: ShieldAlert },
  { id: "files",         label: "Files",         icon: Paperclip },
  { id: "notifications", label: "Alerts",        icon: Bell },
  { id: "activity",      label: "Activity",      icon: Activity },
];

function getProjectColor(project: any) {
  if (project?.color) return project.color;
  const idx = (project?.id?.charCodeAt(0) ?? 0) % PROJECT_COLORS.length;
  return PROJECT_COLORS[idx];
}

function getInitials(name: string) {
  return name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: project, isLoading } = useProject(id!);
  const { data: tasks = [] } = useProjectTasks(id!);
  const { data: members = [] } = useProjectMembers(id!);
  const { data: milestones = [] } = useProjectMilestones(id!);
  const { data: orgMembers = [] } = useOrganizationProfiles();
  const updateProject = useUpdateProject();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [section, setSection] = useState<Section>("overview");
  const [shareOpen, setShareOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [nameVal, setNameVal] = useState("");
  const [descVal, setDescVal] = useState("");
  const [inlineTask, setInlineTask] = useState("");
  const [inlineStatus, setInlineStatus] = useState<string | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  if (isLoading) return (
    <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">Loading...</div>
  );
  if (!project) return (
    <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">Project not found</div>
  );

  const taskList = tasks as any[];
  const memberList = members as any[];
  const milestoneList = milestones as any[];

  const done = taskList.filter((t) => t.status === "done").length;
  const inProgress = taskList.filter((t) => t.status === "in_progress").length;
  const overdue = taskList.filter((t) => t.due_date && isPast(new Date(t.due_date)) && t.status !== "done").length;
  const progress = taskList.length > 0 ? Math.round((done / taskList.length) * 100) : 0;
  const completedMilestones = milestoneList.filter((m: any) => m.status === "completed").length;
  const statusOpt = STATUS_OPTS.find((s) => s.value === project.status);
  const color = getProjectColor(project);

  const toggleGroup = (key: string) =>
    setCollapsedGroups((prev) => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });

  const handleInlineCreate = (status: string) => {
    if (!inlineTask.trim()) { setInlineStatus(null); return; }
    createTask.mutate({ title: inlineTask, status, project_id: id, priority: "medium" } as any, {
      onSuccess: () => { setInlineTask(""); setInlineStatus(null); },
    });
  };

  const getMember = (uid: string | null) =>
    uid ? (orgMembers.find((m: any) => m.id === uid)?.full_name ?? null) : null;

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden -m-6">

      {/* ══ LEFT NAV ═════════════════════════════════════════════════════════ */}
      <aside className="w-56 shrink-0 flex flex-col border-r border-border/50 bg-[hsl(var(--sidebar))] overflow-hidden">
        {/* Back */}
        <div className="px-3 pt-4 pb-2">
          <button
            onClick={() => navigate("/tasks")}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted/60"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All Projects
          </button>
        </div>

        {/* Project identity */}
        <div className="px-4 pb-4 border-b border-border/40">
          <div className="flex items-center gap-2.5 mb-2">
            <span className={cn("h-3 w-3 rounded-sm shrink-0", color)} />
            <span className="text-sm font-semibold truncate">{project.name}</span>
          </div>
          <Select value={project.status} onValueChange={(v) => updateProject.mutate({ id: project.id, status: v })}>
            <SelectTrigger className="h-7 text-xs border-dashed w-full">
              <div className="flex items-center gap-1.5">
                <span className={cn("h-1.5 w-1.5 rounded-full", statusOpt?.dot)} />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  <div className="flex items-center gap-2">
                    <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
                    {s.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          {NAV.map(({ id: navId, label, icon: Icon }) => (
            <button
              key={navId}
              onClick={() => setSection(navId)}
              className={cn(
                "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors text-left",
                section === navId
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", section === navId ? "text-primary" : "text-muted-foreground")} />
              <span className="truncate">{label}</span>
              {navId === "tasks" && taskList.length > 0 && (
                <span className="ml-auto text-xs tabular-nums text-muted-foreground">{taskList.length}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Sidebar footer actions */}
        <div className="border-t border-border/40 px-3 py-3 space-y-1">
          <SaveAsTemplateButton projectId={id!} />
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 h-8 text-xs text-muted-foreground" onClick={() => setShareOpen(true)}>
            <Share2 className="h-3.5 w-3.5" /> Share
          </Button>
          {(project as any).deal_id && (
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2 h-8 text-xs text-muted-foreground" onClick={() => navigate(`/crm/deals/${(project as any).deal_id}`)}>
              <ChevronRight className="h-3.5 w-3.5" /> View Deal
            </Button>
          )}
        </div>
      </aside>

      {/* ══ MAIN ═════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Page header */}
        <div className="px-10 pt-8 pb-4 border-b border-border/40 shrink-0 bg-background">
          {/* Editable title */}
          {editingName ? (
            <div className="flex items-center gap-2 mb-1">
              <Input
                className="text-2xl font-bold border-0 border-b rounded-none px-0 focus-visible:ring-0 h-auto py-0"
                value={nameVal}
                onChange={(e) => setNameVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { updateProject.mutate({ id: project.id, name: nameVal }); setEditingName(false); }
                  if (e.key === "Escape") setEditingName(false);
                }}
                autoFocus
              />
              <button onClick={() => { updateProject.mutate({ id: project.id, name: nameVal }); setEditingName(false); }} className="text-emerald-500 hover:text-emerald-600"><Check className="h-4 w-4" /></button>
              <button onClick={() => setEditingName(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group/title mb-1">
              <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
              <button
                onClick={() => { setNameVal(project.name); setEditingName(true); }}
                className="opacity-0 group-hover/title:opacity-100 text-muted-foreground hover:text-foreground transition-all"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Editable description */}
          {editingDesc ? (
            <div className="flex items-start gap-2">
              <Textarea
                className="text-sm text-muted-foreground border-0 border-b rounded-none px-0 focus-visible:ring-0 resize-none min-h-[40px]"
                value={descVal}
                onChange={(e) => setDescVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setEditingDesc(false);
                }}
                autoFocus
                rows={2}
              />
              <button onClick={() => { updateProject.mutate({ id: project.id, description: descVal }); setEditingDesc(false); }} className="text-emerald-500 hover:text-emerald-600 mt-1"><Check className="h-4 w-4" /></button>
              <button onClick={() => setEditingDesc(false)} className="text-muted-foreground hover:text-foreground mt-1"><X className="h-4 w-4" /></button>
            </div>
          ) : (
            <div className="flex items-start gap-2 group/desc">
              <p
                className="text-sm text-muted-foreground cursor-text"
                onClick={() => { setDescVal(project.description ?? ""); setEditingDesc(true); }}
              >
                {project.description || <span className="italic opacity-40">Add a description...</span>}
              </p>
              <button
                onClick={() => { setDescVal(project.description ?? ""); setEditingDesc(true); }}
                className="opacity-0 group-hover/desc:opacity-100 text-muted-foreground hover:text-foreground transition-all mt-0.5"
              >
                <Pencil className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            <Badge variant="outline" className={cn("text-xs gap-1.5 capitalize", statusOpt?.badge)}>
              <span className={cn("h-1.5 w-1.5 rounded-full", statusOpt?.dot)} />
              {project.status.replace(/_/g, " ")}
            </Badge>
            {project.start_date && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" />
                {format(new Date(project.start_date), "MMM d, yyyy")}
                {project.end_date && <> → {format(new Date(project.end_date), "MMM d, yyyy")}</>}
              </span>
            )}
            {memberList.length > 0 && (
              <div className="flex items-center gap-1">
                <div className="flex -space-x-1.5">
                  {memberList.slice(0, 4).map((m: any) => (
                    <Tooltip key={m.id}>
                      <TooltipTrigger>
                        <Avatar className="h-5 w-5 border border-background">
                          <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
                            {getInitials(m.full_name ?? m.name ?? "?")}
                          </AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent>{m.full_name ?? m.name}</TooltipContent>
                    </Tooltip>
                  ))}
                </div>
                {memberList.length > 4 && (
                  <span className="text-xs text-muted-foreground">+{memberList.length - 4}</span>
                )}
              </div>
            )}
            {/* Progress pill */}
            <div className="flex items-center gap-2 ml-auto">
              <div className="w-24 hidden sm:block">
                <Progress value={progress} className="h-1.5" />
              </div>
              <span className="text-xs font-medium tabular-nums">{progress}%</span>
            </div>
          </div>
        </div>

        {/* Section content */}
        <div className="flex-1 overflow-y-auto">
          {section === "overview" && (
            <OverviewSection
              project={project}
              taskList={taskList}
              milestoneList={milestoneList}
              memberList={memberList}
              done={done}
              inProgress={inProgress}
              overdue={overdue}
              progress={progress}
              completedMilestones={completedMilestones}
              onGoToTasks={() => setSection("tasks")}
              projectId={id!}
            />
          )}
          {section === "tasks" && (
            <TasksSection
              taskList={taskList}
              collapsedGroups={collapsedGroups}
              onToggleGroup={toggleGroup}
              inlineStatus={inlineStatus}
              inlineTask={inlineTask}
              setInlineTask={setInlineTask}
              setInlineStatus={setInlineStatus}
              onInlineCreate={handleInlineCreate}
              onStatusChange={(tid, s) => updateTask.mutate({ id: tid, status: s, completed_at: s === "done" ? new Date().toISOString() : null } as any)}
              onDelete={(tid) => deleteTask.mutate(tid)}
              getMember={getMember}
            />
          )}
          {section === "board"         && <div className="p-6"><ProjectKanbanBoard projectId={id!} /></div>}
          {section === "gantt"         && <div className="p-6"><ProjectGanttChart projectId={id!} /></div>}
          {section === "milestones"    && <div className="p-6"><ProjectMilestonesView projectId={id!} /></div>}
          {section === "resources"     && <div className="p-6"><ProjectResourceView projectId={id!} /></div>}
          {section === "budget"        && <div className="p-6"><ProjectTimeBudget projectId={id!} budget={(project as any).budget} currency={(project as any).budget_currency || "USD"} /></div>}
          {section === "invoices"      && <div className="p-6"><ProjectInvoicesView projectId={id!} budget={(project as any).budget} currency={(project as any).budget_currency || "USD"} /></div>}
          {section === "risks"         && <div className="p-6"><ProjectRisksView projectId={id!} /></div>}
          {section === "files"         && <div className="p-6"><EntityFilesSection entityType="project" entityId={id!} /></div>}
          {section === "notifications" && <div className="p-6"><ProjectNotificationsPanel projectId={id!} /></div>}
          {section === "activity"      && <div className="p-6"><ProjectActivityFeed projectId={id!} /></div>}
        </div>
      </div>

      <ProjectShareDialog projectId={id!} open={shareOpen} onOpenChange={setShareOpen} />
    </div>
  );
}

// ─── Overview Section ─────────────────────────────────────────────────────────
function OverviewSection({ project, taskList, milestoneList, memberList, done, inProgress, overdue, progress, completedMilestones, onGoToTasks, projectId }: any) {
  return (
    <div className="px-10 py-6 space-y-6 max-w-4xl">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Tasks",  value: taskList.length, color: "text-foreground",    sub: "in this project" },
          { label: "In Progress",  value: inProgress,      color: "text-blue-600",      sub: "being worked on" },
          { label: "Completed",    value: done,            color: "text-emerald-600",   sub: "tasks done" },
          { label: "Overdue",      value: overdue,         color: "text-red-500",       sub: "need attention" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border/50 bg-card p-4 space-y-1">
            <p className={cn("text-2xl font-bold tabular-nums", s.color)}>{s.value}</p>
            <p className="text-xs font-medium">{s.label}</p>
            <p className="text-[10px] text-muted-foreground">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="rounded-xl border border-border/50 bg-card p-5 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Overall Progress</span>
          <span className="text-muted-foreground text-xs">{done} of {taskList.length} tasks completed</span>
        </div>
        <Progress value={progress} className="h-2" />
        {/* Segmented breakdown */}
        {taskList.length > 0 && (
          <div className="flex rounded-full overflow-hidden h-1.5 gap-px mt-1">
            {(() => {
              const byS = {
                done: taskList.filter((t: any) => t.status === "done").length,
                in_progress: taskList.filter((t: any) => t.status === "in_progress").length,
                in_review: taskList.filter((t: any) => t.status === "in_review").length,
                todo: taskList.filter((t: any) => t.status === "todo").length,
              };
              return <>
                {byS.done > 0 && <div className="bg-emerald-500" style={{ flex: byS.done }} />}
                {byS.in_progress > 0 && <div className="bg-blue-500" style={{ flex: byS.in_progress }} />}
                {byS.in_review > 0 && <div className="bg-amber-400" style={{ flex: byS.in_review }} />}
                {byS.todo > 0 && <div className="bg-slate-200" style={{ flex: byS.todo }} />}
              </>;
            })()}
          </div>
        )}
        <div className="flex items-center gap-4 text-[10px] text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />Done</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" />In Progress</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" />In Review</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-200 border" />To Do</span>
        </div>
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Milestones */}
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border/40 flex items-center justify-between">
            <p className="text-sm font-semibold">Milestones</p>
            <span className="text-xs text-muted-foreground">{completedMilestones}/{milestoneList.length}</span>
          </div>
          <div className="divide-y divide-border/40">
            {milestoneList.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">No milestones yet</p>
            ) : milestoneList.slice(0, 6).map((m: any) => (
              <div key={m.id} className="px-5 py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={cn("h-2 w-2 rounded-full shrink-0",
                    m.status === "completed" ? "bg-emerald-500" :
                    m.status === "in_progress" ? "bg-blue-500" : "bg-muted-foreground/30"
                  )} />
                  <span className={cn("text-sm truncate", m.status === "completed" && "line-through text-muted-foreground")}>
                    {m.name}
                  </span>
                </div>
                {m.due_date && (
                  <span className={cn("text-xs shrink-0", isPast(new Date(m.due_date)) && m.status !== "completed" ? "text-red-500" : "text-muted-foreground")}>
                    {format(new Date(m.due_date), "MMM d")}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent tasks */}
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border/40 flex items-center justify-between">
            <p className="text-sm font-semibold">Recent Tasks</p>
            <button className="text-xs text-primary hover:underline" onClick={onGoToTasks}>View all</button>
          </div>
          <div className="divide-y divide-border/40">
            {taskList.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-xs text-muted-foreground">No tasks yet</p>
                <button className="text-xs text-primary hover:underline mt-1" onClick={onGoToTasks}>Add tasks</button>
              </div>
            ) : taskList.slice(0, 6).map((t: any) => {
              const sOpt = TASK_STATUS.find((s) => s.value === t.status);
              const Icon = sOpt?.icon ?? Circle;
              const isOverdue = t.due_date && isPast(new Date(t.due_date)) && t.status !== "done";
              return (
                <div key={t.id} className="px-5 py-2.5 flex items-center gap-3">
                  <Icon className={cn("h-3.5 w-3.5 shrink-0", sOpt?.color)} />
                  <span className={cn("text-sm flex-1 truncate", t.status === "done" && "line-through text-muted-foreground")}>
                    {t.title}
                  </span>
                  {isOverdue && <AlertTriangle className="h-3 w-3 text-red-500 shrink-0" />}
                  {t.due_date && !isOverdue && (
                    <span className="text-xs text-muted-foreground shrink-0">{format(new Date(t.due_date), "MMM d")}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Project details */}
      {(project.start_date || project.end_date || (project as any).budget) && (
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <p className="text-sm font-semibold mb-4">Project Details</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
            {project.start_date && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Start Date</p>
                <p className="text-sm font-medium">{format(new Date(project.start_date), "MMM d, yyyy")}</p>
              </div>
            )}
            {project.end_date && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">End Date</p>
                <p className={cn("text-sm font-medium", isPast(new Date(project.end_date)) && project.status !== "completed" ? "text-red-500" : "")}>
                  {format(new Date(project.end_date), "MMM d, yyyy")}
                </p>
              </div>
            )}
            {(project as any).budget && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Budget</p>
                <p className="text-sm font-medium">${Number((project as any).budget).toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Members */}
      {memberList.length > 0 && (
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <p className="text-sm font-semibold mb-4">Team Members</p>
          <div className="flex flex-wrap gap-3">
            {memberList.map((m: any) => (
              <div key={m.id} className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                    {getInitials(m.full_name ?? m.name ?? "?")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs font-medium">{m.full_name ?? m.name}</p>
                  {m.role && <p className="text-[10px] text-muted-foreground capitalize">{m.role}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comments */}
      <ProjectCommentsSection entityType="project" entityId={projectId} />
    </div>
  );
}

// ─── Tasks Section ────────────────────────────────────────────────────────────
function TasksSection({ taskList, collapsedGroups, onToggleGroup, inlineStatus, inlineTask, setInlineTask, setInlineStatus, onInlineCreate, onStatusChange, onDelete, getMember }: any) {
  if (taskList.length === 0 && !inlineStatus) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-muted-foreground/30" />
        </div>
        <p className="text-sm text-muted-foreground">No tasks yet</p>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setInlineStatus("todo")}>
          <Plus className="h-3.5 w-3.5" /> Add first task
        </Button>
      </div>
    );
  }

  return (
    <div className="px-10 py-4 space-y-1">
      {/* Column headers */}
      <div className="flex items-center gap-3 px-3 pb-2 text-xs text-muted-foreground font-medium border-b border-border/40 mb-2">
        <span className="flex-1">Task</span>
        <span className="w-24 text-center hidden md:block">Assignee</span>
        <span className="w-20 text-center hidden sm:block">Due</span>
        <span className="w-20 text-center">Priority</span>
        <span className="w-6" />
      </div>

      {TASK_STATUS.map((group) => {
        const groupTasks = taskList.filter((t: any) => t.status === group.value);
        const isCollapsed = collapsedGroups.has(group.value);
        const Icon = group.icon;
        return (
          <div key={group.value} className="space-y-0.5">
            <button
              onClick={() => onToggleGroup(group.value)}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-muted/40 transition-colors"
            >
              <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", isCollapsed && "-rotate-90")} />
              <Icon className={cn("h-3.5 w-3.5", group.color)} />
              <span className="text-xs font-semibold text-muted-foreground">{group.label}</span>
              <span className="text-xs text-muted-foreground/50 ml-0.5">{groupTasks.length}</span>
            </button>

            {!isCollapsed && (
              <>
                {groupTasks.map((task: any) => {
                  const sOpt = TASK_STATUS.find((s) => s.value === task.status);
                  const pOpt = PRIORITY_OPTS.find((p) => p.value === task.priority);
                  const SIcon = sOpt?.icon ?? Circle;
                  const member = getMember(task.assigned_to);
                  const overdue = task.due_date && isPast(new Date(task.due_date)) && task.status !== "done";
                  return (
                    <div key={task.id} className="flex items-center gap-3 px-3 py-1.5 ml-6 rounded-md hover:bg-muted/30 transition-colors group/row">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => {
                              const idx = TASK_STATUS.findIndex((s) => s.value === task.status);
                              onStatusChange(task.id, TASK_STATUS[(idx + 1) % TASK_STATUS.length].value);
                            }}
                            className={cn("shrink-0 hover:scale-110 transition-transform", sOpt?.color)}
                          >
                            <SIcon className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Advance status</TooltipContent>
                      </Tooltip>

                      <span className={cn("flex-1 text-sm truncate", task.status === "done" && "line-through text-muted-foreground")}>
                        {task.title}
                      </span>

                      <div className="w-24 hidden md:flex justify-center">
                        {member ? (
                          <Tooltip>
                            <TooltipTrigger>
                              <Avatar className="h-5 w-5">
                                <AvatarFallback className="text-[9px] bg-primary/10 text-primary">{getInitials(member)}</AvatarFallback>
                              </Avatar>
                            </TooltipTrigger>
                            <TooltipContent>{member}</TooltipContent>
                          </Tooltip>
                        ) : <span className="text-muted-foreground/30 text-xs">—</span>}
                      </div>

                      <div className="w-20 hidden sm:flex justify-center">
                        {task.due_date ? (
                          <span className={cn("text-xs flex items-center gap-0.5", overdue ? "text-red-500 font-medium" : "text-muted-foreground")}>
                            {overdue && <AlertTriangle className="h-3 w-3" />}
                            {isToday(new Date(task.due_date)) ? "Today" : format(new Date(task.due_date), "MMM d")}
                          </span>
                        ) : <span className="text-muted-foreground/30 text-xs">—</span>}
                      </div>

                      <div className="w-20 flex justify-center">
                        <span className={cn("text-xs flex items-center gap-1", pOpt?.color)}>
                          <span className={cn("h-1.5 w-1.5 rounded-full", pOpt?.dot)} />
                          {pOpt?.label}
                        </span>
                      </div>

                      <div className="w-6 flex justify-center">
                        <button
                          onClick={() => onDelete(task.id)}
                          className="opacity-0 group-hover/row:opacity-100 text-muted-foreground/40 hover:text-destructive transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Inline add */}
                {inlineStatus === group.value ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 ml-6 rounded-md bg-muted/30">
                    <Circle className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                    <input
                      className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
                      placeholder="Task title..."
                      value={inlineTask}
                      onChange={(e) => setInlineTask(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") onInlineCreate(group.value);
                        if (e.key === "Escape") { setInlineStatus(null); setInlineTask(""); }
                      }}
                      onBlur={() => onInlineCreate(group.value)}
                      autoFocus
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => setInlineStatus(group.value)}
                    className="flex items-center gap-2 px-3 py-1 ml-6 rounded-md text-xs text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/30 transition-colors w-full"
                  >
                    <Plus className="h-3 w-3" /> Add task
                  </button>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
