import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useProjectTasks } from "@/hooks/useProjectManagement";
import { Badge } from "@/components/ui/badge";

export function ProjectGanttChart({ projectId }: { projectId: string }) {
  const { data: tasks = [] } = useProjectTasks(projectId);

  const { startDate, endDate, totalDays, weeks } = useMemo(() => {
    const now = new Date();
    const dates = tasks
      .filter((t: any) => t.start_date || t.due_date || t.created_at)
      .map((t: any) => ({
        start: new Date(t.start_date || t.created_at),
        end: new Date(t.due_date || t.start_date || t.created_at),
      }));

    const sd = dates.length > 0
      ? new Date(Math.min(...dates.map((d) => d.start.getTime()), now.getTime()))
      : new Date(now.getTime() - 7 * 86400000);
    const ed = dates.length > 0
      ? new Date(Math.max(...dates.map((d) => d.end.getTime()), now.getTime() + 30 * 86400000))
      : new Date(now.getTime() + 60 * 86400000);

    // Extend to full weeks
    sd.setDate(sd.getDate() - sd.getDay());
    ed.setDate(ed.getDate() + (6 - ed.getDay()));

    const td = Math.ceil((ed.getTime() - sd.getTime()) / 86400000) + 1;
    const wks: Date[] = [];
    for (let d = new Date(sd); d <= ed; d.setDate(d.getDate() + 7)) {
      wks.push(new Date(d));
    }

    return { startDate: sd, endDate: ed, totalDays: td, weeks: wks };
  }, [tasks]);

  const getBarPosition = (taskStart: Date, taskEnd: Date) => {
    const left = Math.max(0, (taskStart.getTime() - startDate.getTime()) / 86400000 / totalDays * 100);
    const width = Math.max(2, (taskEnd.getTime() - taskStart.getTime()) / 86400000 / totalDays * 100);
    return { left: `${left}%`, width: `${Math.min(width, 100 - left)}%` };
  };

  const statusColors: Record<string, string> = {
    todo: "bg-muted-foreground/40",
    in_progress: "bg-chart-1",
    in_review: "bg-chart-4",
    done: "bg-success",
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No tasks to display in the Gantt chart</p>
        <p className="text-xs mt-1">Add tasks in the Tasks tab first</p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex border-b border-border bg-muted/50">
        <div className="w-64 shrink-0 p-3 border-r border-border">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Task</span>
        </div>
        <div className="flex-1 relative overflow-hidden">
          <div className="flex">
            {weeks.map((week, i) => (
              <div key={i} className="flex-1 min-w-[80px] text-center border-r border-border p-1.5">
                <span className="text-[10px] text-muted-foreground">
                  {week.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rows */}
      {tasks.map((task: any) => {
        const tStart = new Date(task.start_date || task.created_at);
        const tEnd = new Date(task.due_date || new Date(tStart.getTime() + 7 * 86400000));
        const pos = getBarPosition(tStart, tEnd);

        return (
          <div key={task.id} className="flex border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors">
            <div className="w-64 shrink-0 p-3 border-r border-border flex items-center gap-2">
              <span className={cn("text-sm truncate", task.status === "done" && "line-through text-muted-foreground")}>
                {task.title}
              </span>
            </div>
            <div className="flex-1 relative h-10 flex items-center">
              {/* Grid lines */}
              {weeks.map((_, i) => (
                <div key={i} className="absolute top-0 bottom-0 border-r border-border/50" style={{ left: `${(i / weeks.length) * 100}%` }} />
              ))}
              {/* Bar */}
              <div
                className={cn("absolute h-5 rounded-full transition-all", statusColors[task.status] || "bg-muted-foreground/40")}
                style={pos}
                title={`${task.title}: ${tStart.toLocaleDateString()} - ${tEnd.toLocaleDateString()}`}
              >
                <span className="text-[9px] text-white px-2 truncate block leading-5">{task.title}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
