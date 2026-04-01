import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  CheckCircle,
  Clock,
  AlertTriangle,
  Calendar,
  Users,
  Settings,
  Trash2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  notification_type: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  employee_name?: string;
  priority?: string;
}

interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  attendance: number;
  leave: number;
  system: number;
}

export default function NotificationsPage() {
  const [filter, setFilter] = useState("all");
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notificationsResponse, isLoading } = useQuery({
    queryKey: ["hrms-notifications", filter],
    queryFn: () => api.get("/hrms/notifications", { params: { filter } }),
    refetchInterval: 30000,
  });

  const notifications = (notificationsResponse as any)?.data || [];

  // Fetch notification statistics
  const { data: stats } = useQuery({
    queryKey: ["hrms-notifications-stats"],
    queryFn: () => api.get<NotificationStats>("/hrms/notifications/stats"),
    refetchInterval: 30000,
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/hrms/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hrms-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["hrms-notifications-stats"] });
      toast.success("Notification marked as read");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to mark notification as read");
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => api.patch("/hrms/notifications/read-all"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hrms-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["hrms-notifications-stats"] });
      toast.success("All notifications marked as read");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to mark all notifications as read");
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/hrms/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hrms-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["hrms-notifications-stats"] });
      toast.success("Notification deleted");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to delete notification");
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "attendance":
      case "clock_in":
      case "clock_out":
        return <Clock className="h-5 w-5 text-blue-600" />;
      case "leave":
        return <Calendar className="h-5 w-5 text-green-600" />;
      case "employee":
        return <Users className="h-5 w-5 text-purple-600" />;
      case "system":
        return <Settings className="h-5 w-5 text-gray-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string, isRead: boolean) => {
    const baseColor = isRead ? "bg-gray-50 dark:bg-gray-800" : "bg-blue-50 dark:bg-blue-950";
    return baseColor;
  };

  const handleMarkAsRead = (notification: Notification) => {
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id);
    }
  };

  const handleDeleteNotification = (id: string) => {
    deleteNotificationMutation.mutate(id);
  };

  const filteredNotifications = filter === "unread" 
    ? (notifications as Notification[]).filter(n => !n.is_read)
    : notifications;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Stay updated with HRMS activities and important announcements
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("unread")}
          >
            Unread ({stats?.unread || 0})
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Total Notifications
            </CardTitle>
            <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {stats?.total || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
              Unread
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
              {stats?.unread || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
              Read
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {stats?.read || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Recent Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (filteredNotifications as Notification[]).length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Bell className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No notifications</h3>
              <p>You're all caught up! No new notifications to show.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(filteredNotifications as Notification[]).map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-lg border transition-colors cursor-pointer hover:shadow-sm",
                    getNotificationColor(notification.notification_type, notification.is_read)
                  )}
                  onClick={() => handleMarkAsRead(notification)}
                >
                  <div className="mt-1">
                    {getNotificationIcon(notification.notification_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {notification.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        {!notification.is_read && (
                          <Badge variant="secondary" className="text-xs">
                            New
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          {format(new Date(notification.created_at), "MMM d, HH:mm")}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNotification(notification.id);
                          }}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {notification.message}
                    </p>
                    {notification.employee_name && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Employee: {notification.employee_name}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="justify-start">
              <Bell className="h-4 w-4 mr-2" />
              Configure Notifications
            </Button>
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {markAllAsReadMutation.isPending ? "Marking..." : "Mark All as Read"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}