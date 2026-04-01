import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Plus, Search, Trash2, CheckCircle2, Clock, Eye, Activity,
  FolderKanban, List, LayoutGrid, FolderOpen, ChevronRight,
  AlertCircle, ArrowUpRight, Circle, ChevronDown, MoreHorizontal,
  CalendarDays, User, Flag, Hash, Inbox,
} from "lucide-react";
import { TasksKanbanBoard } from "@/components/tasks/TasksKanbanBoard";
import {
  useProjects, useTasks, useCreateProject, useCreateTask,
  useUpdateTask, useDeleteTask, useDeleteProject,
  type Task, type Project,
} from "@/hooks/useTasks";
import { useOrganizationProfiles } from "@/hooks/useTenantQuery";
import { format, isToday, isTomorrow, isPast } from "date-fns";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: "todo",        label: "To Do",       icon: Circle,       color: "text-slate-400",  bg: "bg-slate-100 text-slate-600 border-slate-200" },
  { value: "in_progress", label: "In Progress", icon: Activity,     color: "text-blue-500",   bg: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "in_review",   label: "In Review",   icon: Eye,          color: "text-amber-500",  bg: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "done",        label: "Done",        icon: CheckCircle2, color: "text-green-500",  bg: "bg-green-50 text-green-700 border-green-200" },
];

const PRIORITY_OPTIONS = [
  { value: "low",    label: "Low",    color: "text-slate-400",  bg: "bg-slate-50 text-slate-500 border-slate-200",    dot: "bg-slate-300" },
  { value: "medium", label: "Medium", color: "text-yellow-500", bg: "bg-yellow-50 text-yellow-700 border-yellow-200", dot: "bg-yellow-400" },
  { value: "high",   label: "High",   color: "text-orange-500", bg: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-400" },
  { value: "urgent", label: "Urgent", color: "text-red-500",    bg: "bg-red-50 text-red-700 border-red-200",          dot: "bg-red-500" },
];

const PROJECT_COLORS = [
  "bg-violet-500", "bg-blue-500", "bg-cyan-500", "bg-emerald-500",
  "bg-yellow-500", "bg-orange-500", "bg-rose-500", "bg-pink-500",
];

const PROJECT_STATUS_COLOR: Record<string, string> = {
  active: "bg-emerald-500", on_hold: "bg-yellow-500",
  completed: "bg-blue-500", cancelled: "bg-red-500", planning: "bg-violet-500",
};

type ViewMode = "list" | "board" | "overview";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getProjectColor(project: Project) {
  if (project.color) return project.color;
  const idx = project.id.charCodeAt(0) % PROJECT_COLORS.length;
  return PROJECT_COLORS[idx];
}

function formatDue(date: string) {
  const d = new Date(date);
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  return format(d, "MMM d");
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TasksPage() {
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState<string>("inbox");
  const [view, setView] = useState<ViewMode>("list");
  const [search, setSearch] = useState("");
  const [taskDialog, setTaskDialog] = useState(false);
  const [projectDialog, setProjectDialog] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const { data: projects = [], isLoading: loadingProjects } = useProjects();
  const { data: allTasks = [], isLoading: loadingTasks } = useTasks();
  const { data: members = [] } = useOrganizationProfiles();

  const createProject = useCreateProject();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const deleteProject = useDeleteProject();

  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [newTask, setNewTask] = useState({
    title: "", description: "", priority: "medium",
    project_id: "", assigned_to: "", due_date: "",
  });

  // Derive tasks for current view
  const viewTasks = allTasks.filter((t) => {
    if (selectedProject === "inbox") return !t.project_id;
    if (selectedProject === "all") return true;
    return t.project_id === selectedProject;
  });

  const filteredTasks = viewTasks.filter((t) =>
    !search || t.title.toLowerCase().includes(search.toLowerCase())
  );

  const currentProject = projects.find((p) => p.id === selectedProject) ?? null;

  const handleCreateProject = () => {
    if (!newProject.name.trim()) return;
    createProject.mutate(newProject, {
      onSuccess: () => { setProjectDialog(false); setNewProject({ name: "", description: "" }); },
    });
  };

  const handleCreateTask = () => {
    if (!newTask.title.trim()) return;
    const pid = newTask.project_id || (selectedProject !== "inbox" && selectedProject !== "all" ? selectedProject : undefined);
    createTask.mutate({
      title: newTask.title,
      description: newTask.description || undefined,
      priority: newTask.priority,
      project_id: pid,
      assigned_to: newTask.assigned_to || undefined,
      due_date: newTask.due_date || undefined,
    } as any, {
      onSuccess: () => {
        setTaskDialog(false);
        setNewTask({ title: "", description: "", priority: "medium", project_id: "", assigned_to: "", due_date: "" });
      },
    });
  };

  const toggleGroup = (key: string) =>
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const getMember = (id: string | null) =>
    id ? (members.find((m) => m.id === id)?.full_name ?? null) : null;

  const getProjectStats = (pid: string) => {
    const pt = allTasks.filter((t) => t.project_id === pid);
    const done = pt.filter((t) => t.status === "done").length;
    return { total: pt.length, done, progress: pt.length ? Math.round((done / pt.length) * 100) : 0 };
  };

  const isLoading = loadingProjects || loadingTasks;

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden -m-6">

      {/* ══ SIDEBAR ══════════════════════════════════════════════════════════ */}
      <aside className="w-60 shrink-0 flex flex-col border-r border-border/50 bg-[hsl(var(--sidebar))] overflow-hidden">

        {/* Sidebar header */}
        <div className="px-3 pt-4 pb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">Workspace</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => setProjectDialog(true)}>
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">New Project</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Fixed nav items */}
        <div className="px-2 space-y-0.5">
          <SidebarItem
            icon={<Inbox className="h-4 w-4" />}
            label="Inbox"
            count={allTasks.filter((t) => !t.project_id).length}
            active={selectedProject === "inbox"}
            onClick={() => setSelectedProject("inbox")}
          />
          <SidebarItem
            icon={<Hash className="h-4 w-4" />}
            label="All Tasks"
            count={allTasks.length}
            active={selectedProject === "all"}
            onClick={() => setSelectedProject("all")}
          />
        </div>

        <div className="px-3 mt-4 mb-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Projects</span>
        </div>

        {/* Projects list */}
        <div className="flex-1 overflow-y-auto px-2 space-y-0.5 pb-4">
          {loadingProjects ? (
            <div className="px-2 py-3 text-xs text-muted-foreground">Loading...</div>
          ) : projects.length === 0 ? (
            <button
              onClick={() => setProjectDialog(true)}
              className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-xs text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> New project
            </button>
          ) : (
            projects.map((project) => {
              const s = getProjectStats(project.id);
              const color = getProjectColor(project);
              return (
                <SidebarProjectItem
                  key={project.id}
                  project={project}
                  color={color}
                  stats={s}
                  active={selectedProject === project.id}
                  onClick={() => setSelectedProject(project.id)}
                  onOpen={() => navigate(`/projects/${project.id}`)}
                />
              );
            })
          )}
        </div>
      </aside>

      {/* ══ MAIN CONTENT ═════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col overflow-hidden bg-background">

        {/* Top toolbar */}
        <div className="flex items-center justify-between px-8 py-3 border-b border-border/50 shrink-0">
          {/* Breadcrumb / title */}
          <div className="flex items-center gap-2 min-w-0">
            {currentProject ? (
              <>
                <span className={cn("h-3 w-3 rounded-sm shrink-0", getProjectColor(currentProject))} />
                <h1 className="text-base font-semibold truncate">{currentProject.name}</h1>
                <Badge variant="outline" className="text-[10px] capitalize gap-1 ml-1 hidden sm:flex">
                  <span className={cn("h-1.5 w-1.5 rounded-full", PROJECT_STATUS_COLOR[currentProject.status] ?? "bg-slate-400")} />
                  {currentProject.status.replace(/_/g, " ")}
                </Badge>
                <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground gap-1 ml-1" onClick={() => navigate(`/projects/${currentProject.id}`)}>
                  Open <ArrowUpRight className="h-3 w-3" />
                </Button>
              </>
            ) : (
              <h1 className="text-base font-semibold">{selectedProject === "inbox" ? "Inbox" : "All Tasks"}</h1>
            )}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* View switcher */}
            <div className="flex items-center bg-muted/50 rounded-md p-0.5 gap-0.5 border border-border/40">
              {([
                { v: "list" as ViewMode,     icon: List,        tip: "List" },
                { v: "board" as ViewMode,    icon: FolderKanban, tip: "Board" },
                { v: "overview" as ViewMode, icon: LayoutGrid,  tip: "Overview" },
              ]).map(({ v, icon: Icon, tip }) => (
                <Tooltip key={v}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setView(v)}
                      className={cn(
                        "p-1.5 rounded transition-colors",
                        view === v ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{tip}</TooltipContent>
                </Tooltip>
              ))}
            </div>

            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input className="pl-8 h-8 w-40 text-sm bg-muted/40 border-border/40 focus:bg-background" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            <Button size="sm" className="h-8 gap-1.5 text-sm" onClick={() => setTaskDialog(true)}>
              <Plus className="h-3.5 w-3.5" /> New Task
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">Loading...</div>
          ) : view === "list" ? (
            <ListView
              tasks={filteredTasks}
              projects={projects}
              members={members}
              collapsedGroups={collapsedGroups}
              onToggleGroup={toggleGroup}
              onStatusChange={(id, status) => updateTask.mutate({ id, status, completed_at: status === "done" ? new Date().toISOString() : null } as any)}
              onDelete={(id) => deleteTask.mutate(id)}
              onNewTask={() => setTaskDialog(true)}
              getMember={getMember}
              selectedProject={selectedProject}
            />
          ) : view === "board" ? (
            <div className="p-6">
              <TasksKanbanBoard
                tasks={filteredTasks}
                statusOptions={STATUS_OPTIONS.map((s) => ({ ...s, color: s.bg }))}
                onStatusChange={(id, status) => updateTask.mutate({ id, status, completed_at: status === "done" ? new Date().toISOString() : null } as any)}
                onDelete={(id) => deleteTask.mutate(id)}
                getPriorityBadge={(p) => {
                  const opt = PRIORITY_OPTIONS.find((o) => o.value === p);
                  return <Badge variant="outline" className={cn("text-xs gap-1", opt?.bg)}><span className={cn("h-1.5 w-1.5 rounded-full", opt?.dot)} />{opt?.label}</Badge>;
                }}
                getMemberName={(id) => getMember(id) ?? "—"}
              />
            </div>
          ) : (
            <OverviewView
              projects={projects}
              allTasks={allTasks}
              getProjectStats={getProjectStats}
              getProjectColor={getProjectColor}
              onSelectProject={setSelectedProject}
              onOpenProject={(id) => navigate(`/projects/${id}`)}
              onNewProject={() => setProjectDialog(true)}
            />
          )}
        </div>
      </div>

      {/* ══ DIALOGS ══════════════════════════════════════════════════════════ */}
      <Dialog open={taskDialog} onOpenChange={setTaskDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>New Task</DialogTitle></DialogHeader>
          <div className="space-y-4 py-1">
            <Input
              placeholder="Task title"
              className="text-base border-0 border-b rounded-none px-0 focus-visible:ring-0 font-medium placeholder:font-normal"
              value={newTask.title}
              onChange={(e) => setNewTask((t) => ({ ...t, title: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && handleCreateTask()}
              autoFocus
            />
            <Textarea
              placeholder="Add description..."
              className="text-sm resize-none border-0 border-b rounded-none px-0 focus-visible:ring-0 min-h-[60px]"
              value={newTask.description}
              onChange={(e) => setNewTask((t) => ({ ...t, description: e.target.value }))}
              rows={2}
            />
            <div className="flex flex-wrap gap-2 pt-1">
              <Select value={newTask.priority} onValueChange={(v) => setNewTask((t) => ({ ...t, priority: v }))}>
                <SelectTrigger className="h-8 w-auto gap-1.5 text-xs border-dashed">
                  <Flag className="h-3 w-3" /><SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={newTask.project_id || "none"} onValueChange={(v) => setNewTask((t) => ({ ...t, project_id: v === "none" ? "" : v }))}>
                <SelectTrigger className="h-8 w-auto gap-1.5 text-xs border-dashed">
                  <Hash className="h-3 w-3" /><SelectValue placeholder="No project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No project</SelectItem>
                  {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={newTask.assigned_to || "none"} onValueChange={(v) => setNewTask((t) => ({ ...t, assigned_to: v === "none" ? "" : v }))}>
                <SelectTrigger className="h-8 w-auto gap-1.5 text-xs border-dashed">
                  <User className="h-3 w-3" /><SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {members.map((m) => <SelectItem key={m.id} value={m.id}>{m.full_name}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="relative">
                <CalendarDays className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
                <Input type="date" className="h-8 pl-7 text-xs border-dashed w-36" value={newTask.due_date} onChange={(e) => setNewTask((t) => ({ ...t, due_date: e.target.value }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setTaskDialog(false)}>Cancel</Button>
            <Button size="sm" onClick={handleCreateTask} disabled={!newTask.title.trim() || createTask.isPending}>
              {createTask.isPending ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={projectDialog} onOpenChange={setProjectDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>New Project</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input placeholder="Project name" value={newProject.name} onChange={(e) => setNewProject((p) => ({ ...p, name: e.target.value }))} onKeyDown={(e) => e.key === "Enter" && handleCreateProject()} autoFocus />
            </div>
            <div className="space-y-1.5">
              <Label>Description <span className="text-muted-foreground font-normal text-xs">(optional)</span></Label>
              <Textarea placeholder="What is this project about?" value={newProject.description} onChange={(e) => setNewProject((p) => ({ ...p, description: e.target.value }))} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setProjectDialog(false)}>Cancel</Button>
            <Button size="sm" onClick={handleCreateProject} disabled={!newProject.name.trim() || createProject.isPending}>
              {createProject.isPending ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Sidebar Item ─────────────────────────────────────────────────────────────
function SidebarItem({ icon, label, count, active, onClick }: {
  icon: React.ReactNode; label: string; count?: number; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors text-left",
        active ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
      )}
    >
      <span className={cn("shrink-0", active ? "text-primary" : "text-muted-foreground")}>{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      {count !== undefined && count > 0 && (
        <span className={cn("text-xs tabular-nums", active ? "text-primary" : "text-muted-foreground")}>{count}</span>
      )}
    </button>
  );
}

// ─── Sidebar Project Item ─────────────────────────────────────────────────────
function SidebarProjectItem({ project, color, stats, active, onClick, onOpen }: {
  project: Project; color: string; stats: { total: number; done: number; progress: number };
  active: boolean; onClick: () => void; onOpen: () => void;
}) {
  return (
    <div className="group relative">
      <button
        onClick={onClick}
        className={cn(
          "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors text-left pr-7",
          active ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
        )}
      >
        <span className={cn("h-2 w-2 rounded-sm shrink-0", color)} />
        <span className="flex-1 truncate">{project.name}</span>
        {stats.total > 0 && (
          <span className={cn("text-xs tabular-nums shrink-0", active ? "text-primary" : "text-muted-foreground")}>
            {stats.done}/{stats.total}
          </span>
        )}
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onOpen(); }}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-0.5 rounded text-muted-foreground hover:text-foreground transition-all"
      >
        <ArrowUpRight className="h-3 w-3" />
      </button>
    </div>
  );
}

// ─── List View ────────────────────────────────────────────────────────────────
function ListView({ tasks, projects, members, collapsedGroups, onToggleGroup, onStatusChange, onDelete, onNewTask, getMember, selectedProject }: {
  tasks: Task[]; projects: Project[]; members: any[]; collapsedGroups: Set<string>;
  onToggleGroup: (k: string) => void; onStatusChange: (id: string, s: string) => void;
  onDelete: (id: string) => void; onNewTask: () => void; getMember: (id: string | null) => string | null;
  selectedProject: string;
}) {
  const [inlineTitle, setInlineTitle] = useState("");
  const [inlineActive, setInlineActive] = useState<string | null>(null);
  const inlineRef = useRef<HTMLInputElement>(null);
  const createTask = useCreateTask();

  const handleInlineCreate = (status: string) => {
    if (!inlineTitle.trim()) { setInlineActive(null); return; }
    const pid = selectedProject !== "inbox" && selectedProject !== "all" ? selectedProject : undefined;
    createTask.mutate({ title: inlineTitle, status, project_id: pid, priority: "medium" } as any, {
      onSuccess: () => { setInlineTitle(""); setInlineActive(null); },
    });
  };

  // Group by status
  const groups = STATUS_OPTIONS.map((s) => ({
    ...s,
    tasks: tasks.filter((t) => t.status === s.value),
  }));

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-muted-foreground/30" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-muted-foreground">No tasks here</p>
          <p className="text-xs text-muted-foreground/60 mt-0.5">Create a task to get started</p>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={onNewTask}>
          <Plus className="h-3.5 w-3.5" /> New Task
        </Button>
      </div>
    );
  }

  return (
    <div className="px-8 py-4 space-y-1">
      {/* Column headers */}
      <div className="flex items-center gap-3 px-3 pb-1 text-xs text-muted-foreground font-medium border-b border-border/40 mb-2">
        <span className="flex-1">Task</span>
        <span className="w-24 text-center hidden md:block">Assignee</span>
        <span className="w-20 text-center hidden sm:block">Due</span>
        <span className="w-20 text-center">Priority</span>
        <span className="w-6" />
      </div>

      {groups.map((group) => {
        const isCollapsed = collapsedGroups.has(group.value);
        const StatusIcon = group.icon;
        return (
          <div key={group.value} className="space-y-0.5">
            {/* Group header */}
            <button
              onClick={() => onToggleGroup(group.value)}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-muted/40 transition-colors group/header"
            >
              <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", isCollapsed && "-rotate-90")} />
              <StatusIcon className={cn("h-3.5 w-3.5", group.color)} />
              <span className="text-xs font-semibold text-muted-foreground">{group.label}</span>
              <span className="text-xs text-muted-foreground/60 ml-0.5">{group.tasks.length}</span>
            </button>

            {/* Tasks */}
            {!isCollapsed && (
              <>
                {group.tasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    projects={projects}
                    getMember={getMember}
                    onStatusChange={onStatusChange}
                    onDelete={onDelete}
                    showProject={selectedProject === "all" || selectedProject === "inbox"}
                  />
                ))}

                {/* Inline add */}
                {inlineActive === group.value ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 ml-6 rounded-md bg-muted/30">
                    <Circle className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                    <input
                      ref={inlineRef}
                      className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
                      placeholder="Task title..."
                      value={inlineTitle}
                      onChange={(e) => setInlineTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleInlineCreate(group.value);
                        if (e.key === "Escape") { setInlineActive(null); setInlineTitle(""); }
                      }}
                      onBlur={() => handleInlineCreate(group.value)}
                      autoFocus
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => setInlineActive(group.value)}
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

// ─── Task Row ─────────────────────────────────────────────────────────────────
function TaskRow({ task, projects, getMember, onStatusChange, onDelete, showProject }: {
  task: Task; projects: Project[]; getMember: (id: string | null) => string | null;
  onStatusChange: (id: string, s: string) => void; onDelete: (id: string) => void;
  showProject: boolean;
}) {
  const [statusOpen, setStatusOpen] = useState(false);
  const statusOpt = STATUS_OPTIONS.find((s) => s.value === task.status);
  const priorityOpt = PRIORITY_OPTIONS.find((p) => p.value === task.priority);
  const project = projects.find((p) => p.id === task.project_id);
  const member = getMember(task.assigned_to);
  const overdue = task.due_date && isPast(new Date(task.due_date)) && task.status !== "done";
  const StatusIcon = statusOpt?.icon ?? Circle;

  return (
    <div className="flex items-center gap-3 px-3 py-1.5 ml-6 rounded-md hover:bg-muted/30 transition-colors group/row">
      {/* Status toggle */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => {
              const idx = STATUS_OPTIONS.findIndex((s) => s.value === task.status);
              const next = STATUS_OPTIONS[(idx + 1) % STATUS_OPTIONS.length];
              onStatusChange(task.id, next.value);
            }}
            className={cn("shrink-0 transition-colors", statusOpt?.color, "hover:scale-110")}
          >
            <StatusIcon className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent>Click to advance status</TooltipContent>
      </Tooltip>

      {/* Title */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span className={cn(
          "text-sm truncate",
          task.status === "done" ? "line-through text-muted-foreground" : "text-foreground"
        )}>
          {task.title}
        </span>
        {showProject && project && (
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-muted-foreground/60 shrink-0">
            <span className={cn("h-1.5 w-1.5 rounded-sm", getProjectColor(project))} />
            {project.name}
          </span>
        )}
      </div>

      {/* Assignee */}
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
        ) : (
          <span className="text-muted-foreground/30 text-xs">—</span>
        )}
      </div>

      {/* Due date */}
      <div className="w-20 hidden sm:flex justify-center">
        {task.due_date ? (
          <span className={cn(
            "text-xs flex items-center gap-0.5",
            overdue ? "text-red-500 font-medium" : "text-muted-foreground"
          )}>
            {overdue && <AlertCircle className="h-3 w-3" />}
            {formatDue(task.due_date)}
          </span>
        ) : (
          <span className="text-muted-foreground/30 text-xs">—</span>
        )}
      </div>

      {/* Priority */}
      <div className="w-20 flex justify-center">
        <span className={cn("text-xs flex items-center gap-1", priorityOpt?.color)}>
          <span className={cn("h-1.5 w-1.5 rounded-full", priorityOpt?.dot)} />
          {priorityOpt?.label}
        </span>
      </div>

      {/* Delete */}
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
}

// ─── Overview View ────────────────────────────────────────────────────────────
function OverviewView({ projects, allTasks, getProjectStats, getProjectColor, onSelectProject, onOpenProject, onNewProject }: {
  projects: Project[]; allTasks: Task[];
  getProjectStats: (id: string) => { total: number; done: number; progress: number };
  getProjectColor: (p: Project) => string;
  onSelectProject: (id: string) => void; onOpenProject: (id: string) => void; onNewProject: () => void;
}) {
  const totalDone = allTasks.filter((t) => t.status === "done").length;
  const totalOverdue = allTasks.filter((t) => t.due_date && isPast(new Date(t.due_date)) && t.status !== "done").length;
  const inProgress = allTasks.filter((t) => t.status === "in_progress").length;

  return (
    <div className="px-8 py-6 space-y-8 max-w-5xl">
      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Tasks",  value: allTasks.length, sub: "across all projects", color: "text-foreground" },
          { label: "In Progress",  value: inProgress,      sub: "being worked on",     color: "text-blue-600" },
          { label: "Completed",    value: totalDone,        sub: "tasks done",          color: "text-emerald-600" },
          { label: "Overdue",      value: totalOverdue,     sub: "need attention",      color: "text-red-500" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border/50 bg-card p-4 space-y-1">
            <p className={cn("text-2xl font-bold tabular-nums", s.color)}>{s.value}</p>
            <p className="text-xs font-medium">{s.label}</p>
            <p className="text-[10px] text-muted-foreground">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Projects */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Projects</h2>
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={onNewProject}>
            <Plus className="h-3 w-3" /> New Project
          </Button>
        </div>

        {projects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 py-16 flex flex-col items-center gap-3">
            <FolderOpen className="h-10 w-10 text-muted-foreground/20" />
            <p className="text-sm text-muted-foreground">No projects yet</p>
            <Button size="sm" variant="outline" onClick={onNewProject} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Create your first project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {projects.map((project) => {
              const s = getProjectStats(project.id);
              const color = getProjectColor(project);
              const pt = allTasks.filter((t) => t.project_id === project.id);
              const byStatus = {
                todo: pt.filter((t) => t.status === "todo").length,
                in_progress: pt.filter((t) => t.status === "in_progress").length,
                in_review: pt.filter((t) => t.status === "in_review").length,
                done: pt.filter((t) => t.status === "done").length,
              };
              const overdue = pt.filter((t) => t.due_date && isPast(new Date(t.due_date)) && t.status !== "done").length;

              return (
                <div
                  key={project.id}
                  onClick={() => onSelectProject(project.id)}
                  className="group rounded-xl border border-border/50 bg-card hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer p-5 space-y-4"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={cn("h-3 w-3 rounded-sm shrink-0", color)} />
                      <p className="font-semibold text-sm truncate">{project.name}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); onOpenProject(project.id); }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-all shrink-0"
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {project.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 -mt-2">{project.description}</p>
                  )}

                  {/* Progress */}
                  <div className="space-y-1.5">
                    <Progress value={s.progress} className="h-1.5" />
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>{s.done} of {s.total} done</span>
                      <span className="font-medium text-foreground">{s.progress}%</span>
                    </div>
                  </div>

                  {/* Status breakdown mini-bar */}
                  {s.total > 0 && (
                    <div className="flex rounded-full overflow-hidden h-1.5 gap-px">
                      {byStatus.done > 0 && <div className="bg-emerald-500" style={{ flex: byStatus.done }} />}
                      {byStatus.in_progress > 0 && <div className="bg-blue-500" style={{ flex: byStatus.in_progress }} />}
                      {byStatus.in_review > 0 && <div className="bg-amber-400" style={{ flex: byStatus.in_review }} />}
                      {byStatus.todo > 0 && <div className="bg-slate-200" style={{ flex: byStatus.todo }} />}
                    </div>
                  )}

                  {/* Footer chips */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {byStatus.in_progress > 0 && (
                      <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5 flex items-center gap-1">
                        <Activity className="h-2.5 w-2.5" />{byStatus.in_progress} active
                      </span>
                    )}
                    {overdue > 0 && (
                      <span className="text-[10px] bg-red-50 text-red-600 border border-red-200 rounded-full px-2 py-0.5 flex items-center gap-1">
                        <AlertCircle className="h-2.5 w-2.5" />{overdue} overdue
                      </span>
                    )}
                    {s.total === 0 && (
                      <span className="text-[10px] text-muted-foreground/50">No tasks yet</span>
                    )}
                    <span className="ml-auto text-[10px] text-muted-foreground capitalize">
                      {project.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
