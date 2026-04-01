import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  UserPlus, Handshake, DollarSign, TrendingUp, CheckCircle2,
  Clock, AlertTriangle, Users, FolderKanban, BarChart3,
  ArrowUpRight, Activity, Circle, Eye, CalendarDays,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { useLeadStats, useDealStats } from "@/hooks/useCrmData";
import { useTasks, useProjects } from "@/hooks/useTasks";
import { api } from "@/lib/api";
import { formatDistanceToNow, format, isPast } from "date-fns";
import { cn } from "@/lib/utils";
import { activitiesApi } from "@/lib/api";

// ─── helpers ──────────────────────────────────────────────────────────────────
function StatTile({
  label, value, sub, icon: Icon, color, onClick,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string; onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-xl border border-border/50 bg-card p-5 text-left transition-all hover:shadow-sm hover:border-primary/20 group",
        onClick ? "cursor-pointer" : "cursor-default"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn("p-2 rounded-lg", color)}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        {onClick && <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />}
      </div>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-xs font-medium text-muted-foreground mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-muted-foreground/60 mt-0.5">{sub}</p>}
    </button>
  );
}

const TASK_STATUS_ICON: Record<string, React.ElementType> = {
  todo: Circle, in_progress: Activity, in_review: Eye, done: CheckCircle2,
};
const TASK_STATUS_COLOR: Record<string, string> = {
  todo: "text-slate-400", in_progress: "text-blue-500", in_review: "text-amber-500", done: "text-emerald-500",
};

export default function Dashboard() {
  const navigate = useNavigate();

  // CRM
  const { data: leadStats } = useLeadStats();
  const { data: dealStats } = useDealStats();

  // Tasks & Projects
  const { data: allTasks = [] } = useTasks();
  const { data: projects = [] } = useProjects();

  // HRMS
  const { data: hrmsStats } = useQuery({
    queryKey: ["hrms-stats", "today"],
    queryFn: () => api.get<any>("/hrms/stats?period=today"),
    refetchInterval: 60000,
  });

  // Recent activity
  const { data: activities = [] } = useQuery({
    queryKey: ["activities", "recent"],
    queryFn: () => activitiesApi.getRecent(12),
    refetchInterval: 10000,
  });

  // Deals for pipeline
  const { data: dealsResp } = useQuery({
    queryKey: ["dashboard", "deals", "active"],
    queryFn: () => api.get<any>("/deals?status=open&limit=5"),
    refetchInterval: 30000,
  });
  const activeDeals = (dealsResp as any)?.data || [];

  // Derived
  const leadOverview = (leadStats as any)?.overview ?? (leadStats as any);
  const dealOverview = (dealStats as any)?.overview ?? (dealStats as any);

  const taskStats = useMemo(() => ({
    total: allTasks.length,
    done: allTasks.filter((t) => t.status === "done").length,
    inProgress: allTasks.filter((t) => t.status === "in_progress").length,
    overdue: allTasks.filter((t) => t.due_date && isPast(new Date(t.due_date)) && t.status !== "done").length,
  }), [allTasks]);

  const projectStats = useMemo(() => {
    const active = projects.filter((p) => p.status === "active").length;
    const completed = projects.filter((p) => p.status === "completed").length;
    return { total: projects.length, active, completed };
  }, [projects]);

  const recentTasks = useMemo(() =>
    allTasks
      .filter((t) => t.status !== "done")
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 6),
    [allTasks]
  );

  const topProjects = useMemo(() =>
    projects.slice(0, 4).map((p) => {
      const pt = allTasks.filter((t) => t.project_id === p.id);
      const done = pt.filter((t) => t.status === "done").length;
      return { ...p, taskCount: pt.length, done, progress: pt.length ? Math.round((done / pt.length) * 100) : 0 };
    }),
    [projects, allTasks]
  );

  const attendanceRate = hrmsStats?.totalEmployees
    ? Math.round(((hrmsStats.presentToday || 0) / hrmsStats.totalEmployees) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
        </div>
      </div>

      {/* ── Top stat tiles ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* CRM */}
        <div className="col-span-2 sm:col-span-2 lg:col-span-2">
          <StatTile label="Total Leads" value={leadOverview?.total_leads ?? "—"} sub="all time" icon={UserPlus} color="bg-blue-500" onClick={() => navigate("/crm/leads")} />
        </div>
        <div className="col-span-2 sm:col-span-2 lg:col-span-2">
          <StatTile label="Open Deals" value={dealOverview?.open_deals ?? "—"} sub={`$${Number(dealOverview?.total_open_value || 0).toLocaleString()} pipeline`} icon={Handshake} color="bg-violet-500" onClick={() => navigate("/crm/deals")} />
        </div>
        {/* Tasks */}
        <div className="col-span-2 sm:col-span-2 lg:col-span-2">
          <StatTile label="Active Tasks" value={taskStats.inProgress} sub={`${taskStats.overdue} overdue`} icon={CheckCircle2} color={taskStats.overdue > 0 ? "bg-red-500" : "bg-emerald-500"} onClick={() => navigate("/tasks")} />
        </div>
        {/* HRMS */}
        <div className="col-span-2 sm:col-span-2 lg:col-span-2">
          <StatTile label="Present Today" value={hrmsStats?.presentToday ?? "—"} sub={`${attendanceRate}% attendance`} icon={Users} color="bg-orange-500" onClick={() => navigate("/hrms")} />
        </div>
      </div>

      {/* ── Row 2: Chart + Tasks ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <SalesChart />
        </div>

        {/* Tasks panel */}
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 border-b border-border/40 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">My Tasks</span>
            </div>
            <button onClick={() => navigate("/tasks")} className="text-xs text-primary hover:underline flex items-center gap-0.5">
              View all <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-border/40">
            {recentTasks.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-xs text-muted-foreground">No pending tasks</div>
            ) : recentTasks.map((task) => {
              const Icon = TASK_STATUS_ICON[task.status] ?? Circle;
              const overdue = task.due_date && isPast(new Date(task.due_date)) && task.status !== "done";
              return (
                <div key={task.id} className="flex items-center gap-3 px-5 py-2.5 hover:bg-muted/30 transition-colors">
                  <Icon className={cn("h-3.5 w-3.5 shrink-0", TASK_STATUS_COLOR[task.status])} />
                  <span className="flex-1 text-sm truncate">{task.title}</span>
                  {task.due_date && (
                    <span className={cn("text-[10px] shrink-0", overdue ? "text-red-500 font-medium" : "text-muted-foreground")}>
                      {overdue ? "Overdue" : format(new Date(task.due_date), "MMM d")}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          {/* Mini stats footer */}
          <div className="border-t border-border/40 px-5 py-3 grid grid-cols-3 gap-2 shrink-0">
            {[
              { label: "Total", value: taskStats.total, color: "text-foreground" },
              { label: "Done", value: taskStats.done, color: "text-emerald-600" },
              { label: "Overdue", value: taskStats.overdue, color: "text-red-500" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className={cn("text-base font-bold tabular-nums", s.color)}>{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 3: Projects + Pipeline + HRMS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Projects */}
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Projects</span>
              <span className="text-xs text-muted-foreground">({projectStats.active} active)</span>
            </div>
            <button onClick={() => navigate("/tasks")} className="text-xs text-primary hover:underline flex items-center gap-0.5">
              View all <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          <div className="divide-y divide-border/40">
            {topProjects.length === 0 ? (
              <div className="flex items-center justify-center h-24 text-xs text-muted-foreground">No projects yet</div>
            ) : topProjects.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/projects/${p.id}`)}
                className="px-5 py-3 hover:bg-muted/30 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium truncate flex-1">{p.name}</span>
                  <span className="text-xs text-muted-foreground ml-2 shrink-0">{p.progress}%</span>
                </div>
                <Progress value={p.progress} className="h-1.5" />
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-muted-foreground">{p.done}/{p.taskCount} tasks</span>
                  <span className={cn("text-[10px] capitalize", p.status === "active" ? "text-emerald-600" : "text-muted-foreground")}>{p.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deal Pipeline */}
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Deal Pipeline</span>
            </div>
            <button onClick={() => navigate("/crm/deals")} className="text-xs text-primary hover:underline flex items-center gap-0.5">
              View all <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          <div className="divide-y divide-border/40">
            {activeDeals.length === 0 ? (
              <div className="flex items-center justify-center h-24 text-xs text-muted-foreground">No active deals</div>
            ) : activeDeals.map((deal: any) => (
              <div key={deal.id} className="px-5 py-3 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => navigate(`/crm/deals/${deal.id}`)}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium truncate flex-1">{deal.title}</span>
                  <span className="text-sm font-semibold ml-2 shrink-0">${Number(deal.value || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground capitalize">{deal.stage || "—"}</span>
                  <div className="flex items-center gap-1.5">
                    <Progress value={Number(deal.probability) || 0} className="h-1 w-16" />
                    <span className="text-[10px] text-muted-foreground">{deal.probability || 0}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* HRMS Quick View */}
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">People</span>
            </div>
            <button onClick={() => navigate("/hrms")} className="text-xs text-primary hover:underline flex items-center gap-0.5">
              HRMS <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          <div className="p-5 space-y-4">
            {/* Attendance ring */}
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0">
                <svg className="h-16 w-16 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15.9" fill="none"
                    stroke="hsl(142 76% 36%)" strokeWidth="3"
                    strokeDasharray={`${attendanceRate} ${100 - attendanceRate}`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">{attendanceRate}%</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Attendance Today</p>
                <p className="text-xs text-muted-foreground">{hrmsStats?.presentToday ?? 0} of {hrmsStats?.totalEmployees ?? 0} present</p>
                {(hrmsStats?.lateToday ?? 0) > 0 && (
                  <p className="text-xs text-orange-500">{hrmsStats.lateToday} late arrivals</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Total Staff", value: hrmsStats?.totalEmployees ?? "—", color: "text-foreground" },
                { label: "On Leave", value: hrmsStats?.approvedLeaves ?? "—", color: "text-blue-600" },
                { label: "Pending Leaves", value: hrmsStats?.pendingLeaves ?? "—", color: "text-orange-500" },
                { label: "Avg Hours", value: hrmsStats?.averageWorkHours ? `${hrmsStats.averageWorkHours.toFixed(1)}h` : "—", color: "text-muted-foreground" },
              ].map((s) => (
                <div key={s.label} className="rounded-lg bg-muted/30 px-3 py-2">
                  <p className={cn("text-base font-bold tabular-nums", s.color)}>{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 4: Recent Activity ── */}
      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border/40 flex items-center gap-2">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Recent Activity</span>
        </div>
        <div className="divide-y divide-border/40">
          {(activities as any[]).length === 0 ? (
            <div className="flex items-center justify-center h-16 text-xs text-muted-foreground">No activity yet</div>
          ) : (activities as any[]).slice(0, 8).map((a: any) => {
            const initials = a.user_name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2) ?? "?";
            const badge = a.entity_type || a.activity_type || "activity";
            const BADGE_COLORS: Record<string, string> = {
              lead: "bg-blue-50 text-blue-700 border-blue-200",
              deal: "bg-emerald-50 text-emerald-700 border-emerald-200",
              contact: "bg-violet-50 text-violet-700 border-violet-200",
              task: "bg-slate-50 text-slate-600 border-slate-200",
              employee: "bg-orange-50 text-orange-700 border-orange-200",
            };
            return (
              <div key={a.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors">
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">
                    <span className="font-medium">{a.user_name || "Someone"}</span>
                    <span className="text-muted-foreground"> {a.activity_type?.replace(/_/g, " ") || "performed an action"}</span>
                    {a.title && <span className="font-medium"> — {a.title}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className={cn("text-[10px] capitalize", BADGE_COLORS[badge] || "bg-muted text-muted-foreground border-border")}>
                    {badge}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {a.created_at ? formatDistanceToNow(new Date(a.created_at), { addSuffix: true }) : ""}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
