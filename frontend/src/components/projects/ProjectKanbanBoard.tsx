import { useState } from "react";
import { toast } from "sonner";
import { Plus, CheckCircle2, Circle, Clock, ArrowRight, GripVertical, Repeat, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useProjectTasks } from "@/hooks/useProjectManagement";
import { useCreateTask, useUpdateTask } from "@/hooks/useTasks";
import { useTaskDependencies, useAddTaskDependency, useRemoveTaskDependency } from "@/hooks/useProjectFeatures";
import { useAuth } from "@/contexts/AuthContext";

const columns = [
  { id: "todo", label: "To Do", icon: Circle, color: "text-muted-foreground" },
  { id: "in_progress", label: "In Progress", icon: Clock, color: "text-chart-1" },
  { id: "in_review", label: "In Review", icon: ArrowRight, color: "text-chart-4" },
  { id: "done", label: "Done", icon: CheckCircle2, color: "text-success" },
];

const recurrenceOptions = [
  { value: "", label: "None" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "monthly", label: "Monthly" },
];

export function ProjectKanbanBoard({ projectId }: { projectId: string }) {
  const { data: tasks = [] } = useProjectTasks(projectId);
  const { data: dependencies = [] } = useTaskDependencies(projectId);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const addDep = useAddTaskDependency();
  const removeDep = useRemoveTaskDependency();
  const { user } = useAuth();
  const [newTaskCol, setNewTaskCol] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskRecurrence, setNewTaskRecurrence] = useState("");
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [depTaskId, setDepTaskId] = useState<string | null>(null);

  const handleAddTask = (status: string) => {
    if (!newTaskTitle.trim()) return;
    createTask.mutate(
      { title: newTaskTitle.trim(), status, project_id: projectId, priority: "medium", recurrence_rule: newTaskRecurrence || undefined } as any,
      { onSuccess: () => { setNewTaskTitle(""); setNewTaskCol(null); setNewTaskRecurrence(""); } }
    );
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    setDragOverCol(null);
    const taskId = e.dataTransfer.getData("taskId");
    if (!taskId) return;
    const task = tasks.find((t: any) => t.id === taskId);
    if (task && (task as any).status !== status) {
      // Check dependencies - can't move to done if dependencies aren't done
      if (status === "done") {
        const deps = dependencies.filter(d => d.task_id === taskId);
        const blockers = deps.filter(d => {
          const depTask = tasks.find((t: any) => t.id === d.depends_on_task_id);
          return depTask && (depTask as any).status !== "done";
        });
        if (blockers.length > 0) {
          toast.error("Cannot complete: has unfinished dependencies");
          return;
        }
      }
      updateTask.mutate({
        id: taskId,
        status,
        ...(status === "done" ? { completed_at: new Date().toISOString() } : { completed_at: null }),
      });
    }
  };

  const getTaskDeps = (taskId: string) => dependencies.filter(d => d.task_id === taskId);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((col) => {
        const colTasks = tasks.filter((t: any) => t.status === col.id);
        const Icon = col.icon;
        return (
          <div
            key={col.id}
            className={cn(
              "flex-shrink-0 w-72 rounded-xl border bg-muted/30 transition-colors",
              dragOverCol === col.id ? "border-primary bg-primary/5" : "border-border"
            )}
            onDragOver={(e) => { e.preventDefault(); setDragOverCol(col.id); }}
            onDragLeave={() => setDragOverCol(null)}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div className="p-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className={cn("h-4 w-4", col.color)} />
                <span className="font-semibold text-sm">{col.label}</span>
                <Badge variant="secondary" className="text-xs">{colTasks.length}</Badge>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setNewTaskCol(col.id)}>
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="p-2 space-y-2 max-h-[500px] overflow-y-auto">
              {newTaskCol === col.id && (
                <div className="rounded-lg border border-primary bg-card p-2 space-y-1">
                  <Input
                    autoFocus
                    placeholder="Task title..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAddTask(col.id); if (e.key === "Escape") setNewTaskCol(null); }}
                    className="h-8 text-sm"
                  />
                  <Select value={newTaskRecurrence} onValueChange={setNewTaskRecurrence}>
                    <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="No recurrence" /></SelectTrigger>
                    <SelectContent>
                      {recurrenceOptions.map(r => <SelectItem key={r.value} value={r.value || "none"}>{r.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-1">
                    <Button size="sm" className="h-7 text-xs" onClick={() => handleAddTask(col.id)} disabled={!newTaskTitle.trim()}>Add</Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setNewTaskCol(null)}>Cancel</Button>
                  </div>
                </div>
              )}
              {colTasks.map((task: any) => {
                const taskDeps = getTaskDeps(task.id);
                const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "done";
                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    className="rounded-lg border border-border bg-card p-3 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-primary/30 transition-all group"
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical className="h-4 w-4 mt-0.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-medium leading-snug", task.status === "done" && "line-through text-muted-foreground")}>{task.title}</p>
                        {task.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>}
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          <Badge variant="outline" className={cn("text-[10px] px-1.5",
                            task.priority === "high" || task.priority === "urgent" ? "border-destructive/40 text-destructive bg-destructive/5"
                            : task.priority === "medium" ? "border-warning/40 text-warning bg-warning/5"
                            : "text-muted-foreground"
                          )}>{task.priority}</Badge>
                          {task.due_date && (
                            <span className={cn("text-[10px] flex items-center gap-0.5", isOverdue ? "text-destructive font-medium" : "text-muted-foreground")}>
                              {isOverdue ? "⚠ " : ""}{new Date(task.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                          )}
                          {task.recurrence_rule && task.recurrence_rule !== "none" && (
                            <Badge variant="outline" className="text-[10px] gap-0.5 px-1.5"><Repeat className="h-2.5 w-2.5" />{task.recurrence_rule}</Badge>
                          )}
                          {taskDeps.length > 0 && (
                            <Badge variant="outline" className="text-[10px] gap-0.5 px-1.5"><Link2 className="h-2.5 w-2.5" />{taskDeps.length}</Badge>
                          )}
                        </div>
                        {/* Dependency management */}
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-5 text-[10px] px-1 mt-1 opacity-0 group-hover:opacity-100">
                              <Link2 className="h-2.5 w-2.5 mr-0.5" /> Dependencies
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-56 p-2" align="start">
                            <Label className="text-xs">Depends on:</Label>
                            <div className="space-y-1 mt-1 max-h-[150px] overflow-y-auto">
                              {tasks.filter((t: any) => t.id !== task.id).map((t: any) => {
                                const hasDep = taskDeps.some(d => d.depends_on_task_id === t.id);
                                return (
                                  <Button
                                    key={t.id}
                                    variant={hasDep ? "secondary" : "ghost"}
                                    size="sm"
                                    className="w-full justify-start h-7 text-xs"
                                    onClick={() => {
                                      if (hasDep) {
                                        const dep = taskDeps.find(d => d.depends_on_task_id === t.id);
                                        if (dep) removeDep.mutate({ id: dep.id, project_id: projectId });
                                      } else {
                                        addDep.mutate({ task_id: task.id, depends_on_task_id: t.id, project_id: projectId });
                                      }
                                    }}
                                  >
                                    {hasDep ? "✓ " : ""}{t.title}
                                  </Button>
                                );
                              })}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                );
              })}
              {colTasks.length === 0 && newTaskCol !== col.id && (
                <p className="text-xs text-muted-foreground text-center py-6">No tasks</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
