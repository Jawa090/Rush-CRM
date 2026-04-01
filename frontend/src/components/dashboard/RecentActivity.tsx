import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { activitiesApi } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const typeColors: Record<string, string> = {
  lead: "bg-chart-1/10 text-chart-1",
  deal: "bg-success/10 text-success",
  contact: "bg-chart-4/10 text-chart-4",
  company: "bg-chart-3/10 text-chart-3",
  employee: "bg-warning/10 text-warning",
  inventory: "bg-info/10 text-info",
  task: "bg-muted/60 text-foreground",
  default: "bg-muted/60 text-muted-foreground",
};

export function RecentActivity() {
  const { data, isLoading } = useQuery({
    queryKey: ["activities", "recent"],
    queryFn: () => activitiesApi.getRecent(15),
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });

  const activities = data || [];

  const rendered = useMemo(() => activities, [activities]);

  return (
    <div className="rounded-xl border border-border bg-card shadow-card animate-fade-in">
      <div className="border-b border-border px-6 py-4">
        <h3 className="font-semibold">Recent Activity</h3>
      </div>
      {isLoading ? (
        <div className="space-y-3 p-6">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : rendered.length === 0 ? (
        <div className="p-6 text-sm text-muted-foreground">No activity yet.</div>
      ) : (
        <div className="divide-y divide-border">
          {rendered.map((activity: any) => {
            const initials = activity.user_name
              ? activity.user_name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .slice(0, 2)
              : "?";
            const badge = activity.entity_type || activity.activity_type || "activity";
            const timeLabel = activity.created_at
              ? `${formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}`
              : "";

            return (
              <div key={activity.id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/50 transition-colors">
                <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                  <AvatarImage src={activity.user_avatar} />
                  <AvatarFallback className="text-xs font-medium bg-muted">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm line-clamp-2">
                    <span className="font-medium">{activity.user_name || "Someone"}</span>
                    {" "}
                    <span className="text-muted-foreground capitalize">
                      {activity.activity_type?.replace(/_/g, " ") || activity.title || "performed an action"}
                    </span>
                    {activity.title && activity.activity_type && (
                      <span className="font-medium"> — {activity.title}</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{timeLabel}</p>
                </div>
                <Badge
                  variant="secondary"
                  className={cn("capitalize", typeColors[badge] || typeColors.default)}
                >
                  {badge}
                </Badge>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
