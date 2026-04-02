import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Users, Clock, Calendar, UserCheck, UserX, AlertCircle,
  CheckCircle, Timer, Bell, Activity, ArrowUpRight, TrendingUp,
  TrendingDown, Briefcase, Award, DollarSign, Target,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { cn } from "@/lib/utils";

interface HRMSStats {
  totalEmployees: number; presentToday: number; absentToday: number;
  lateToday: number; pendingLeaves: number; approvedLeaves: number;
  totalHoursToday: number; averageWorkHours: number;
}
interface RecentActivity {
  id: string; type: string; employee_name: string; message: string; timestamp: string; status?: string;
}
interface AttendanceRecord {
  id: string; employee_id: string; employee_name: string; date: string;
  clock_in: string | null; clock_out: string | null; total_hours: number | null; status: string;
}

const STATUS_COLORS: Record<string, string> = {
  present:  "bg-emerald-50 text-emerald-700 border-emerald-200",
  absent:   "bg-red-50 text-red-700 border-red-200",
  late:     "bg-orange-50 text-orange-700 border-orange-200",
  on_leave: "bg-blue-50 text-blue-700 border-blue-200",
};

const ACTIVITY_ICONS: Record<string, { icon: React.ElementType; color: string }> = {
  clock_in:      { icon: UserCheck, color: "text-emerald-500" },
  clock_out:     { icon: Clock,     color: "text-blue-500" },
  leave_request: { icon: Calendar,  color: "text-orange-500" },
  leave_approved:{ icon: CheckCircle, color: "text-emerald-500" },
  late_arrival:  { icon: AlertCircle, color: "text-red-500" },
};

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function HRMSDashboard() {
  const [period, setPeriod] = useState("today");
  const navigate = useNavigate();

  const { data: stats } = useQuery({
    queryKey: ["hrms-stats", period],
    queryFn: () => api.get<HRMSStats>(`/hrms/stats?period=${period}`),
    refetchInterval: 30000,
  });
  
  const { data: activities = [] } = useQuery({
    queryKey: ["hrms-activities"],
    queryFn: () => api.get<RecentActivity[]>("/hrms/activities"),
    refetchInterval: 60000,
  });
  
  const { data: todayAttendance = [] } = useQuery({
    queryKey: ["hrms-today-attendance"],
    queryFn: () => api.get<AttendanceRecord[]>("/hrms/attendance/today"),
    refetchInterval: 30000,
  });

  // Fetch leave analytics
  const { data: leaveAnalytics } = useQuery({
    queryKey: ["leave-analytics-dashboard"],
    queryFn: () => api.get("/leave/analytics/stats"),
  });

  const leaveStats = (leaveAnalytics as any)?.data?.stats || {};

  const attendanceRate = stats?.totalEmployees
    ? Math.round(((stats.presentToday || 0) / stats.totalEmployees) * 100) : 0;

  const productivityScore = stats?.averageWorkHours 
    ? Math.min(Math.round((stats.averageWorkHours / 8) * 100), 100) : 0;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">HRMS Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => navigate("/hrms/employees")} className="gap-2">
            <Users className="h-4 w-4" />
            Manage Employees
          </Button>
        </div>
      </div>

      {/* Key Metrics - Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Employees */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                <p className="text-3xl font-bold mt-2">{stats?.totalEmployees ?? 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Active workforce</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Rate */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Attendance Rate</p>
                <p className="text-3xl font-bold mt-2">{attendanceRate}%</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <Progress value={attendanceRate} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {stats?.presentToday ?? 0} present today
            </p>
          </CardContent>
        </Card>

        {/* Pending Leaves */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Leaves</p>
                <p className="text-3xl font-bold mt-2">{stats?.pendingLeaves ?? 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            {stats?.pendingLeaves && stats.pendingLeaves > 0 && (
              <Button 
                variant="link" 
                size="sm" 
                className="mt-2 p-0 h-auto text-xs"
                onClick={() => navigate("/hrms/leave")}
              >
                Review requests →
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Productivity Score */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Productivity</p>
                <p className="text-3xl font-bold mt-2">{productivityScore}%</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <Progress value={productivityScore} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {stats?.averageWorkHours?.toFixed(1) ?? 0}h avg daily
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: "Present", value: stats?.presentToday ?? 0, color: "bg-emerald-500", icon: UserCheck },
          { label: "Absent", value: stats?.absentToday ?? 0, color: "bg-red-500", icon: UserX },
          { label: "Late", value: stats?.lateToday ?? 0, color: "bg-orange-500", icon: AlertCircle },
          { label: "On Leave", value: stats?.approvedLeaves ?? 0, color: "bg-blue-500", icon: Calendar },
          { label: "Total Hours", value: `${stats?.totalHoursToday ?? 0}h`, color: "bg-cyan-500", icon: Timer },
          { label: "Avg Hours", value: `${stats?.averageWorkHours?.toFixed(1) ?? 0}h`, color: "bg-slate-500", icon: TrendingUp },
          { label: "Leave Requests", value: leaveStats.total_requests ?? 0, color: "bg-violet-500", icon: Briefcase },
          { label: "Approved", value: leaveStats.approved ?? 0, color: "bg-teal-500", icon: CheckCircle },
        ].map((stat) => (
          <Card key={stat.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className={cn("p-2 rounded-lg w-fit mb-2", stat.color)}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Attendance - 2 columns */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Today's Attendance</CardTitle>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/hrms/attendance")}
                className="gap-1"
              >
                View All
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Table Header */}
            <div className="flex items-center gap-3 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b bg-muted/30 rounded-t-lg">
              <span className="flex-1">Employee</span>
              <span className="w-20 text-center hidden sm:block">Clock In</span>
              <span className="w-20 text-center hidden sm:block">Clock Out</span>
              <span className="w-16 text-center hidden md:block">Hours</span>
              <span className="w-24 text-center">Status</span>
            </div>

            {/* Table Body */}
            <div className="divide-y">
              {(todayAttendance as AttendanceRecord[]).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <Clock className="h-12 w-12 text-muted-foreground/20" />
                  <p className="text-sm text-muted-foreground">No attendance records yet</p>
                </div>
              ) : (todayAttendance as AttendanceRecord[]).slice(0, 8).map((record) => (
                <div key={record.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                        {getInitials(record.employee_name || "?")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium truncate">{record.employee_name || "Unknown"}</span>
                  </div>
                  <span className="w-20 text-center text-sm text-muted-foreground hidden sm:block">
                    {record.clock_in ? format(new Date(record.clock_in), "HH:mm") : "—"}
                  </span>
                  <span className="w-20 text-center text-sm text-muted-foreground hidden sm:block">
                    {record.clock_out ? format(new Date(record.clock_out), "HH:mm") : 
                      <span className="text-emerald-600 text-xs font-medium">Active</span>}
                  </span>
                  <span className="w-16 text-center text-sm text-muted-foreground hidden md:block">
                    {record.total_hours ? `${record.total_hours}h` : "—"}
                  </span>
                  <div className="w-24 flex justify-center">
                    <Badge variant="outline" className={cn("text-xs capitalize", STATUS_COLORS[record.status] ?? "bg-muted text-muted-foreground")}>
                      {record.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed - 1 column */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Recent Activity</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(activities as RecentActivity[]).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <Activity className="h-12 w-12 text-muted-foreground/20" />
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                </div>
              ) : (activities as RecentActivity[]).slice(0, 10).map((activity) => {
                const activityInfo = ACTIVITY_ICONS[activity.type] ?? { icon: Activity, color: "text-muted-foreground" };
                const Icon = activityInfo.icon;
                return (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className={cn("mt-0.5 shrink-0 p-2 rounded-full bg-muted", activityInfo.color)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.employee_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{activity.message}</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        {format(new Date(activity.timestamp), "HH:mm")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Manage Employees", sub: "View & edit staff", icon: Users, href: "/hrms/employees", color: "bg-blue-500" },
              { label: "Attendance", sub: "Clock in/out records", icon: Clock, href: "/hrms/attendance", color: "bg-emerald-500" },
              { label: "Leave Management", sub: "Requests & approvals", icon: Calendar, href: "/hrms/leave", color: "bg-orange-500" },
              { label: "Notifications", sub: "Alerts & updates", icon: Bell, href: "/hrms/notifications", color: "bg-violet-500" },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => navigate(item.href)}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border border-border hover:shadow-lg hover:border-primary/30 transition-all group"
              >
                <div className={cn("p-4 rounded-full", item.color)}>
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.sub}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
