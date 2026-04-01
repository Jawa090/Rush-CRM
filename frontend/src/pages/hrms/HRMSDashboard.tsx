import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Users, Clock, Calendar, UserCheck, UserX, AlertCircle,
  CheckCircle, Timer, Bell, Activity, ArrowUpRight, TrendingUp,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";
import { format } from "date-fns";
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

  const attendanceRate = stats?.totalEmployees
    ? Math.round(((stats.presentToday || 0) / stats.totalEmployees) * 100) : 0;

  const statTiles = [
    { label: "Total Employees", value: stats?.totalEmployees ?? 0,   sub: "active workforce",    color: "bg-blue-500",    icon: Users,     href: "/hrms/employees" },
    { label: "Present Today",   value: stats?.presentToday ?? 0,     sub: `${attendanceRate}% rate`, color: "bg-emerald-500", icon: UserCheck, href: "/hrms/attendance" },
    { label: "Absent Today",    value: stats?.absentToday ?? 0,      sub: "not checked in",      color: "bg-red-500",     icon: UserX,     href: "/hrms/attendance" },
    { label: "Late Arrivals",   value: stats?.lateToday ?? 0,        sub: "past schedule",       color: "bg-orange-500",  icon: AlertCircle, href: "/hrms/attendance" },
    { label: "Pending Leaves",  value: stats?.pendingLeaves ?? 0,    sub: "awaiting approval",   color: "bg-yellow-500",  icon: Calendar,  href: "/hrms/leave" },
    { label: "Approved Leaves", value: stats?.approvedLeaves ?? 0,   sub: "this period",         color: "bg-violet-500",  icon: CheckCircle, href: "/hrms/leave" },
    { label: "Total Hours",     value: stats?.totalHoursToday ? `${stats.totalHoursToday}h` : "0h", sub: "logged today", color: "bg-cyan-500", icon: Timer, href: "/hrms/attendance" },
    { label: "Avg Work Hours",  value: stats?.averageWorkHours ? `${stats.averageWorkHours.toFixed(1)}h` : "0h", sub: "daily average", color: "bg-slate-500", icon: TrendingUp, href: "/hrms" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">HRMS</h1>
          <p className="text-sm text-muted-foreground">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="h-8 w-32 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {statTiles.map((s) => (
          <button
            key={s.label}
            onClick={() => navigate(s.href)}
            className="col-span-1 rounded-xl border border-border/50 bg-card p-4 text-left hover:shadow-sm hover:border-primary/20 transition-all group"
          >
            <div className={cn("p-1.5 rounded-lg w-fit mb-2", s.color)}>
              <s.icon className="h-3.5 w-3.5 text-white" />
            </div>
            <p className="text-xl font-bold tabular-nums">{s.value}</p>
            <p className="text-xs font-medium text-muted-foreground leading-tight">{s.label}</p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">{s.sub}</p>
          </button>
        ))}
      </div>

      {/* Attendance rate visual */}
      <div className="rounded-xl border border-border/50 bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-semibold">Attendance Overview</p>
            <p className="text-xs text-muted-foreground">{period === "today" ? "Today" : period === "week" ? "This week" : "This month"}</p>
          </div>
          <span className="text-2xl font-bold tabular-nums">{attendanceRate}%</span>
        </div>
        <Progress value={attendanceRate} className="h-2 mb-3" />
        <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" />Present ({stats?.presentToday ?? 0})</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500" />Absent ({stats?.absentToday ?? 0})</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-orange-500" />Late ({stats?.lateToday ?? 0})</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-500" />On Leave ({stats?.approvedLeaves ?? 0})</span>
        </div>
      </div>

      {/* Two columns: attendance list + activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Today's attendance */}
        <div className="lg:col-span-2 rounded-xl border border-border/50 bg-card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Today's Attendance</span>
            </div>
            <button onClick={() => navigate("/hrms/attendance")} className="text-xs text-primary hover:underline flex items-center gap-0.5">
              Full view <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>

          {/* Column headers */}
          <div className="flex items-center gap-3 px-5 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider border-b border-border/30 bg-muted/20">
            <span className="flex-1">Employee</span>
            <span className="w-16 text-center hidden sm:block">Clock In</span>
            <span className="w-16 text-center hidden sm:block">Clock Out</span>
            <span className="w-12 text-center hidden md:block">Hours</span>
            <span className="w-20 text-center">Status</span>
          </div>

          <div className="divide-y divide-border/40">
            {(todayAttendance as AttendanceRecord[]).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <Clock className="h-8 w-8 text-muted-foreground/20" />
                <p className="text-sm text-muted-foreground">No attendance records yet</p>
              </div>
            ) : (todayAttendance as AttendanceRecord[]).slice(0, 10).map((r) => (
              <div key={r.id} className="flex items-center gap-3 px-5 py-2.5 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                      {getInitials(r.employee_name || "?")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium truncate">{r.employee_name || "Unknown"}</span>
                </div>
                <span className="w-16 text-center text-xs text-muted-foreground hidden sm:block">
                  {r.clock_in ? format(new Date(r.clock_in), "HH:mm") : "—"}
                </span>
                <span className="w-16 text-center text-xs text-muted-foreground hidden sm:block">
                  {r.clock_out ? format(new Date(r.clock_out), "HH:mm") : <span className="text-emerald-500 text-[10px]">Active</span>}
                </span>
                <span className="w-12 text-center text-xs text-muted-foreground hidden md:block">
                  {r.total_hours ? `${r.total_hours}h` : "—"}
                </span>
                <div className="w-20 flex justify-center">
                  <Badge variant="outline" className={cn("text-[10px] capitalize", STATUS_COLORS[r.status] ?? "bg-muted text-muted-foreground")}>
                    {r.status.replace("_", " ")}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border/40 flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Activity Feed</span>
          </div>
          <div className="divide-y divide-border/40">
            {(activities as RecentActivity[]).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <Activity className="h-8 w-8 text-muted-foreground/20" />
                <p className="text-sm text-muted-foreground">No recent activity</p>
              </div>
            ) : (activities as RecentActivity[]).slice(0, 12).map((a) => {
              const ai = ACTIVITY_ICONS[a.type] ?? { icon: Activity, color: "text-muted-foreground" };
              const Icon = ai.icon;
              return (
                <div key={a.id} className="flex items-start gap-3 px-5 py-3 hover:bg-muted/30 transition-colors">
                  <div className={cn("mt-0.5 shrink-0", ai.color)}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{a.employee_name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{a.message}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                      {format(new Date(a.timestamp), "HH:mm")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick nav */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Employees",       sub: "Manage staff",         icon: Users,     href: "/hrms/employees",  color: "bg-blue-500" },
          { label: "Attendance",      sub: "Clock in/out",         icon: Clock,     href: "/hrms/attendance", color: "bg-emerald-500" },
          { label: "Leave",           sub: "Requests & approvals", icon: Calendar,  href: "/hrms/leave",      color: "bg-orange-500" },
          { label: "Notifications",   sub: "Alerts & updates",     icon: Bell,      href: "/hrms/notifications", color: "bg-violet-500" },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.href)}
            className="flex items-center gap-3 rounded-xl border border-border/50 bg-card px-4 py-3.5 hover:shadow-sm hover:border-primary/20 transition-all text-left group"
          >
            <div className={cn("p-2 rounded-lg shrink-0", item.color)}>
              <item.icon className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-[10px] text-muted-foreground">{item.sub}</p>
            </div>
            <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-muted-foreground ml-auto transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
}
