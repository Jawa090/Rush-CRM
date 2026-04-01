import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { FolderKanban, Target, Calendar, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import rushLogo from "@/assets/rush-logo.svg";

const statusColors: Record<string, string> = {
  active: "bg-success/10 text-success",
  on_hold: "bg-warning/10 text-warning",
  completed: "bg-chart-1/10 text-chart-1",
  cancelled: "bg-destructive/10 text-destructive",
};

export default function ProjectReportPage() {
  const { token } = useParams<{ token: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ["project_report", token],
    queryFn: async () => {
      if (!token) throw new Error("No token");

      const data = await api.get<any>(`/projects/report/${token}`).catch((e) => { throw new Error(e.message || 'Invalid or expired share link'); });
      return data;
    },
    enabled: !!token,
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Loading report...</p></div>;
  if (error || !data) return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="max-w-sm"><CardContent className="p-6 text-center">
        <FolderKanban className="h-12 w-12 mx-auto mb-3 text-destructive opacity-50" />
        <p className="font-medium">Access Denied</p>
        <p className="text-sm text-muted-foreground mt-1">{(error as Error)?.message || "This report is unavailable."}</p>
      </CardContent></Card>
    </div>
  );

  const { project, milestones, tasks, permissions } = data;
  const taskStats = {
    total: tasks.length,
    done: tasks.filter((t: any) => t.status === "done").length,
    inProgress: tasks.filter((t: any) => t.status === "in_progress").length,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={rushLogo} alt="Logo" className="h-8" />
            <div>
              <h1 className="text-2xl font-bold">{project.name}</h1>
              {data.clientName && <p className="text-sm text-muted-foreground">Shared with: {data.clientName}</p>}
            </div>
          </div>
          <Badge variant="secondary" className={cn("capitalize", statusColors[project.status])}>
            {project.status?.replace(/_/g, " ")}
          </Badge>
        </div>

        {project.description && <p className="text-muted-foreground">{project.description}</p>}

        {/* Progress */}
        {permissions.view_progress !== false && (
          <Card>
            <CardHeader><CardTitle className="text-base">Project Progress</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Overall</span>
                  <span className="font-medium">{project.progress || 0}%</span>
                </div>
                <Progress value={project.progress || 0} className="h-3" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold">{taskStats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Tasks</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-chart-1">{taskStats.inProgress}</p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-success">{taskStats.done}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Milestones */}
        {permissions.view_milestones !== false && milestones.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base">Milestones</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {milestones.map((m: any) => (
                  <div key={m.id} className="flex items-center gap-3">
                    {m.status === "completed" ? (
                      <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                    ) : (
                      <Target className="h-5 w-5 text-muted-foreground shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className={cn("text-sm font-medium", m.status === "completed" && "line-through text-muted-foreground")}>{m.name}</p>
                      {m.description && <p className="text-xs text-muted-foreground">{m.description}</p>}
                    </div>
                    {m.due_date && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(m.due_date).toLocaleDateString()}
                      </span>
                    )}
                    <Badge variant="secondary" className="text-[10px] capitalize">{m.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Separator />
        <p className="text-xs text-muted-foreground text-center">
          Generated on {new Date().toLocaleDateString()} • This is a shared project report
        </p>
      </div>
    </div>
  );
}
