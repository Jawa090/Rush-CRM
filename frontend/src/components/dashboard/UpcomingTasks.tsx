import { Calendar, Clock, Users } from "lucide-react";
import { useMemo } from "react";
import { useTasks } from "@/hooks/useTasks";
import { cn } from "@/lib/utils";

const priorityColors: Record<string, string> = {
  high: "border-l-destructive",
  medium: "border-l-warning",
  low: "border-l-muted-foreground",
};

const typeIcons: Record<string, React.ReactNode> = {
  meeting: <Users className="h-4 w-4" />,
  call: <Clock className="h-4 w-4" />,
  task: <Calendar className="h-4 w-4" />,
};

function formatTime(value?: string | null) {
  if (!value) return "No due time";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export function UpcomingTasks() {
  const { data: tasks = [], isLoading, isError } = useTasks();

  const upcoming = useMemo(() => {
    if (!tasks?.length) return [] as any[];
    const now = new Date();
    return tasks
      .filter((task: any) => task.due_date || task.dueDate)
      .filter((task: any) => {
        const due = new Date(task.due_date ?? task.dueDate);
        return !Number.isNaN(due.getTime()) && due >= new Date(now.toDateString());
      })
      .sort((a: any, b: any) => {
        const aDate = new Date(a.due_date ?? a.dueDate).getTime();
        const bDate = new Date(b.due_date ?? b.dueDate).getTime();
        return aDate - bDate;
      })
      .slice(0, 5);
  }, [tasks]);

  return (
    <div className="rounded-xl border border-border bg-card shadow-card animate-fade-in">
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Today's Schedule</h3>
            <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
      </div>
      <div className="divide-y divide-border">
        {isLoading && (
          <div className="px-6 py-4 text-sm text-muted-foreground">Loading tasks…</div>
        )}
        {isError && (
          <div className="px-6 py-4 text-sm text-destructive">Could not load tasks</div>
        )}
        {!isLoading && !isError && upcoming.length === 0 && (
          <div className="px-6 py-4 text-sm text-muted-foreground">No upcoming tasks for today</div>
        )}
        {upcoming.map((task: any) => (
          <div
            key={task.id}
            className={cn(
              "flex items-center gap-4 px-6 py-3 border-l-4 hover:bg-muted/50 transition-colors",
              priorityColors[task.priority] ?? priorityColors.medium
            )}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              {typeIcons[task.type || "task"] ?? typeIcons.task}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{task.title}</p>
              <p className="text-xs text-muted-foreground">{formatTime(task.due_date ?? task.dueDate)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
