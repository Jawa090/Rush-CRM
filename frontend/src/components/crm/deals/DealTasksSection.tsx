import { useState } from "react";
import { CheckCircle2, Circle, Clock, ArrowRight, ListTodo } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface DealTasksSectionProps {
  dealId: string;
}

interface DealTask {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  assigned_to: string | null;
  due_date: string | null;
  sort_order: number;
}

const statusConfig: Record<string, { icon: React.ElementType; label: string; className: string }> = {
  todo: { icon: Circle, label: "To Do", className: "text-muted-foreground" },
  in_progress: { icon: Clock, label: "In Progress", className: "text-chart-1" },
  in_review: { icon: ArrowRight, label: "In Review", className: "text-chart-4" },
  done: { icon: CheckCircle2, label: "Done", className: "text-green-500" },
};

const priorityColors: Record<string, string> = {
  high: "bg-red-500/10 text-red-500",
  medium: "bg-yellow-500/10 text-yellow-600",
  low: "bg-muted text-muted-foreground",
};

export function DealTasksSection({ dealId }: DealTasksSectionProps) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["deal_tasks", dealId],
    queryFn: async () => {
      if (!profile?.org_id) return [];
      const response = await api.get<DealTask[]>(`/tasks?entityType=deal&entityId=${dealId}`);
      return response || [];
    },
    enabled: !!profile?.org_id,
  });

  const assignedUserIds = [...new Set(tasks.map((t) => t.assigned_to).filter(Boolean))] as string[];
  const { data: assignedProfiles = [] } = useQuery({
    queryKey: ["profiles_batch", assignedUserIds],
    queryFn: async () => {
      if (assignedUserIds.length === 0) return [];
      const response = await api.get<any[]>("/users");
      return response.filter((u: any) => assignedUserIds.includes(u.id)) || [];
    },
    enabled: assignedUserIds.length > 0,
  });

  const profileMap = Object.fromEntries(assignedProfiles.map((p) => [p.id, p]));

  const cycleStatus = async (taskId: string, currentStatus: string) => {
    const order = ["todo", "in_progress", "in_review", "done"];
    const nextIdx = (order.indexOf(currentStatus) + 1) % order.length;
    const nextStatus = order[nextIdx];

    try {
      await api.patch(`/tasks/${taskId}`, { status: nextStatus });
      queryClient.invalidateQueries({ queryKey: ["deal_tasks", dealId] });
    } catch {
      toast.error("Failed to update task");
    }
  };

  const completedCount = tasks.filter((t) => t.status === "done").length;

  if (isLoading) return null;
  if (tasks.length === 0) return null;

  return (
    <Collapsible defaultOpen>
      <div className="border border-border rounded-lg bg-card">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50">
          <div className="flex items-center gap-2">
            <ListTodo className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Deal Tasks
            </span>
            <Badge variant="secondary" className="text-xs">
              {completedCount}/{tasks.length}
            </Badge>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-4 pt-0 space-y-2">
            {tasks.map((task) => {
              const config = statusConfig[task.status] || statusConfig.todo;
              const StatusIcon = config.icon;
              const assignee = task.assigned_to ? profileMap[task.assigned_to] : null;

              return (
                <div
                  key={task.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors",
                    task.status === "done" && "opacity-60"
                  )}
                >
                  <button
                    onClick={() => cycleStatus(task.id, task.status)}
                    className="mt-0.5 shrink-0"
                    title={`Status: ${config.label} — click to advance`}
                  >
                    <StatusIcon className={cn("h-5 w-5 transition-colors", config.className)} />
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-medium", task.status === "done" && "line-through")}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0", priorityColors[task.priority])}>
                        {task.priority}
                      </Badge>
                      <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", config.className)}>
                        {config.label}
                      </Badge>
                    </div>
                  </div>

                  {assignee && (
                    <Avatar className="h-6 w-6 shrink-0">
                      <AvatarImage src={assignee.avatar_url || undefined} />
                      <AvatarFallback className="text-[10px]">
                        {assignee.full_name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              );
            })}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
