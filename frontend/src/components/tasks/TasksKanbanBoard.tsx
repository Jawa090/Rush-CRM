import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GripVertical, Clock, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Task } from "@/hooks/useTasks";

interface StatusOption {
  value: string;
  label: string;
  color: string;
}

interface TasksKanbanBoardProps {
  tasks: Task[];
  statusOptions: StatusOption[];
  onStatusChange: (taskId: string, status: string) => void;
  onDelete: (taskId: string) => void;
  getPriorityBadge: (priority: string) => React.ReactNode;
  getMemberName: (id: string | null) => string;
}

export function TasksKanbanBoard({
  tasks,
  statusOptions,
  onStatusChange,
  onDelete,
  getPriorityBadge,
  getMemberName,
}: TasksKanbanBoardProps) {
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => setDragOverColumn(null);

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData("taskId");
    if (!taskId) return;
    const task = tasks.find((t) => t.id === taskId);
    if (task && task.status !== newStatus) {
      onStatusChange(taskId, newStatus);
    }
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      {statusOptions.map((statusOpt) => {
        const columnTasks = tasks.filter((t) => t.status === statusOpt.value);
        return (
          <div
            key={statusOpt.value}
            className={cn(
              "space-y-3 rounded-xl p-3 border transition-colors min-h-[200px]",
              dragOverColumn === statusOpt.value
                ? "border-primary bg-primary/5"
                : "border-transparent bg-muted/30"
            )}
            onDragOver={(e) => handleDragOver(e, statusOpt.value)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, statusOpt.value)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn("h-3 w-3 rounded-full", statusOpt.color.split(" ")[0])} />
                <h3 className="text-sm font-semibold text-foreground">{statusOpt.label}</h3>
              </div>
              <Badge variant="secondary" className="text-xs">{columnTasks.length}</Badge>
            </div>
            <div className="space-y-2">
              {columnTasks.map((task) => (
                <Card
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group"
                >
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 shrink-0" />
                      <p className="text-sm font-medium text-foreground line-clamp-2 flex-1">{task.title}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        onClick={() => onDelete(task.id)}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      {getPriorityBadge(task.priority)}
                      <span className="text-xs text-muted-foreground">{getMemberName(task.assigned_to)}</span>
                    </div>
                    {task.due_date && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(new Date(task.due_date), "MMM d")}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
