import { Bell, Check, Clock, UserPlus, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useProjectNotifications, useMarkNotificationRead, type ProjectNotification } from "@/hooks/useProjectFeatures";
import { formatDistanceToNow } from "date-fns";

const typeIcons: Record<string, typeof Bell> = {
  assignment: UserPlus,
  deadline: Clock,
  warning: AlertTriangle,
  info: Bell,
};

export function ProjectNotificationsPanel({ projectId }: { projectId: string }) {
  const { data: notifications = [] } = useProjectNotifications(projectId);
  const markRead = useMarkNotificationRead();
  const unread = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Notifications</h3>
          {unread > 0 && <Badge variant="destructive" className="text-xs">{unread} new</Badge>}
        </div>
        {unread > 0 && (
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => notifications.filter(n => !n.is_read).forEach(n => markRead.mutate(n.id))}>
            Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Bell className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No notifications</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => {
            const Icon = typeIcons[n.type] || Bell;
            return (
              <Card key={n.id} className={cn(!n.is_read && "border-primary/30 bg-primary/5")}>
                <CardContent className="p-3 flex items-start gap-3">
                  <Icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm", !n.is_read && "font-medium")}>{n.title}</p>
                    {n.message && <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>}
                    <p className="text-[10px] text-muted-foreground mt-1">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</p>
                  </div>
                  {!n.is_read && (
                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => markRead.mutate(n.id)}>
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
