import { useState } from "react";
import { Plus, CheckCircle2, Circle, Clock, Target, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useProjectMilestones, useCreateMilestone, useUpdateMilestone } from "@/hooks/useProjectManagement";
import { useProjectTasks } from "@/hooks/useProjectManagement";

const statusIcons: Record<string, React.ElementType> = { pending: Circle, in_progress: Clock, completed: CheckCircle2 };
const statusColors: Record<string, string> = { pending: "text-muted-foreground", in_progress: "text-chart-1", completed: "text-success" };

export function ProjectMilestonesView({ projectId }: { projectId: string }) {
  const { data: milestones = [] } = useProjectMilestones(projectId);
  const { data: tasks = [] } = useProjectTasks(projectId);
  const createMilestone = useCreateMilestone();
  const updateMilestone = useUpdateMilestone();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleAdd = () => {
    if (!name.trim()) return;
    createMilestone.mutate(
      { project_id: projectId, name: name.trim(), due_date: dueDate || undefined, sort_order: milestones.length },
      { onSuccess: () => { setName(""); setDueDate(""); setAdding(false); } }
    );
  };

  const cycleStatus = (m: any) => {
    const order = ["pending", "in_progress", "completed"];
    const next = order[(order.indexOf(m.status) + 1) % order.length];
    updateMilestone.mutate({
      id: m.id,
      status: next,
      ...(next === "completed" ? { completed_at: new Date().toISOString() } : { completed_at: null }),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Milestones & Phases</h3>
        <Button size="sm" variant="outline" className="gap-1" onClick={() => setAdding(true)}>
          <Plus className="h-3.5 w-3.5" /> Add Milestone
        </Button>
      </div>

      {adding && (
        <div className="border border-primary rounded-lg bg-card p-4 space-y-3">
          <Input placeholder="Milestone name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} disabled={!name.trim()}>Add</Button>
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {milestones.map((m) => {
          const Icon = statusIcons[m.status] || Circle;
          const milestoneTasks = tasks.filter((t: any) => t.milestone_id === m.id);
          const completedTasks = milestoneTasks.filter((t: any) => t.status === "done");
          const progress = milestoneTasks.length > 0 ? Math.round((completedTasks.length / milestoneTasks.length) * 100) : 0;

          return (
            <div key={m.id} className="border border-border rounded-lg bg-card p-4">
              <div className="flex items-start gap-3">
                <button onClick={() => cycleStatus(m)} className="mt-0.5 shrink-0">
                  <Icon className={cn("h-5 w-5", statusColors[m.status])} />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={cn("font-medium", m.status === "completed" && "line-through text-muted-foreground")}>
                      {m.name}
                    </h4>
                    <div className="flex items-center gap-2">
                      {m.due_date && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(m.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      )}
                      <Badge variant="secondary" className={cn("text-xs capitalize", statusColors[m.status])}>
                        {m.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </div>
                  {m.description && <p className="text-xs text-muted-foreground mt-1">{m.description}</p>}
                  {milestoneTasks.length > 0 && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{completedTasks.length}/{milestoneTasks.length} tasks</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-1.5" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {milestones.length === 0 && !adding && (
          <p className="text-center py-8 text-muted-foreground text-sm">No milestones yet</p>
        )}
      </div>
    </div>
  );
}
