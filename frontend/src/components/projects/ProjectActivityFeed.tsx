import { useQuery } from "@tanstack/react-query";
import { activitiesApi, usersApi } from '@/lib/api';
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const typeColors: Record<string, string> = {
  automation: "bg-chart-1/10 text-chart-1",
  update: "bg-primary/10 text-primary",
  stage_change: "bg-warning/10 text-warning",
  comment: "bg-chart-4/10 text-chart-4",
};

export function ProjectActivityFeed({ projectId }: { projectId: string }) {
  const { profile } = useAuth();

  const { data: activities = [] } = useQuery({
    queryKey: ["project_activities", projectId],
    queryFn: async () => {
      if (!profile?.org_id) return [];
      const data = await activitiesApi.getByEntity('project', projectId).catch(() => []);
      return data || [];
    },
    enabled: !!profile?.org_id,
  });

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Activity Feed</h3>
      <div className="space-y-3">
        {activities.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground text-sm">No activity yet</p>
        ) : (
          activities.map((a: any) => (
            <div key={a.id} className="flex items-start gap-3 p-3 border border-border rounded-lg bg-card">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={a.profile?.avatar_url || undefined} />
                <AvatarFallback className="text-[10px]">
                  {a.profile?.full_name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2) || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{a.profile?.full_name || "System"}</span>
                  <Badge variant="secondary" className={cn("text-[10px] capitalize", typeColors[a.activity_type])}>
                    {a.activity_type.replace(/_/g, " ")}
                  </Badge>
                </div>
                <p className="text-sm">{a.title}</p>
                {a.description && <p className="text-xs text-muted-foreground mt-0.5">{a.description}</p>}
                <p className="text-[10px] text-muted-foreground mt-1">
                  {new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
