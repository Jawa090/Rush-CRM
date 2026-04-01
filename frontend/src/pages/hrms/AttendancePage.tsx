import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Clock, MapPin, CheckCircle, Play, Square, Coffee, Search } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { format, isToday, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

interface AttendanceRecord {
  id: string; employee_id: string; employee_name: string; date: string;
  clock_in: string | null; clock_out: string | null;
  break_start: string | null; break_end: string | null;
  total_hours: number | null; overtime_hours: number;
  status: string; notes: string | null;
  location_lat: number | null; location_lng: number | null;
}

const STATUS_COLORS: Record<string, string> = {
  present:  "bg-emerald-50 text-emerald-700 border-emerald-200",
  absent:   "bg-red-50 text-red-700 border-red-200",
  late:     "bg-orange-50 text-orange-700 border-orange-200",
  on_break: "bg-yellow-50 text-yellow-700 border-yellow-200",
  half_day: "bg-blue-50 text-blue-700 border-blue-200",
};

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

type ClockType = "clock_in" | "clock_out" | "break_start" | "break_end";

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [search, setSearch] = useState("");
  const [clockDialog, setClockDialog] = useState(false);
  const [clockType, setClockType] = useState<ClockType>("clock_in");
  const [notes, setNotes] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [now, setNow] = useState(new Date());
  const qc = useQueryClient();

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (p) => setLocation({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => {}
    );
  }, []);

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["attendance", selectedDate, search],
    queryFn: () => api.get<AttendanceRecord[]>("/hrms/attendance", { params: { date: selectedDate, search } }),
    refetchInterval: 30000,
  });

  const { data: myAttendance } = useQuery({
    queryKey: ["my-attendance", format(new Date(), "yyyy-MM-dd")],
    queryFn: () => api.get<AttendanceRecord>("/hrms/attendance/my-today"),
    refetchInterval: 10000,
    enabled: isToday(parseISO(selectedDate)),
  });

  const clockMutation = useMutation({
    mutationFn: (type: string) =>
      api.post(`/hrms/attendance/${type.replace(/_/g, "-")}`, { notes, location }),
    onSuccess: (_, type) => {
      qc.invalidateQueries({ queryKey: ["attendance"] });
      qc.invalidateQueries({ queryKey: ["my-attendance"] });
      qc.invalidateQueries({ queryKey: ["hrms-stats"] });
      toast.success(`${type.replace(/_/g, " ")} recorded`);
      setClockDialog(false);
      setNotes("");
    },
    onError: (e: any) => toast.error(e.response?.data?.error || "Failed"),
  });

  const canDo = (type: ClockType) => {
    if (!myAttendance) return type === "clock_in";
    switch (type) {
      case "clock_in":    return !myAttendance.clock_in;
      case "clock_out":   return !!myAttendance.clock_in && !myAttendance.clock_out;
      case "break_start": return !!myAttendance.clock_in && !myAttendance.break_start && !myAttendance.clock_out;
      case "break_end":   return !!myAttendance.break_start && !myAttendance.break_end;
    }
  };

  const ACTIONS: { type: ClockType; label: string; icon: React.ElementType; cls: string }[] = [
    { type: "clock_in",    label: "Clock In",    icon: Play,        cls: "bg-emerald-500 hover:bg-emerald-600 text-white border-0" },
    { type: "clock_out",   label: "Clock Out",   icon: Square,      cls: "bg-red-500 hover:bg-red-600 text-white border-0" },
    { type: "break_start", label: "Start Break", icon: Coffee,      cls: "bg-orange-500 hover:bg-orange-600 text-white border-0" },
    { type: "break_end",   label: "End Break",   icon: CheckCircle, cls: "bg-blue-500 hover:bg-blue-600 text-white border-0" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Attendance</h1>
          <p className="text-sm text-muted-foreground">Track employee working hours</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold tabular-nums">{format(now, "HH:mm:ss")}</p>
          <p className="text-xs text-muted-foreground">{format(now, "EEEE, MMM d")}</p>
        </div>
      </div>

      {isToday(parseISO(selectedDate)) && (
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <p className="text-sm font-semibold mb-4">My Attendance Today</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { label: "Clock In",    value: myAttendance?.clock_in  ? format(new Date(myAttendance.clock_in),  "HH:mm") : "—" },
              { label: "Clock Out",   value: myAttendance?.clock_out ? format(new Date(myAttendance.clock_out), "HH:mm") : "—" },
              { label: "Break",       value: myAttendance?.break_start ? `${format(new Date(myAttendance.break_start), "HH:mm")}${myAttendance.break_end ? ` – ${format(new Date(myAttendance.break_end), "HH:mm")}` : " (active)"}` : "—" },
              { label: "Total Hours", value: myAttendance?.total_hours ? `${myAttendance.total_hours}h` : "0h" },
            ].map((s) => (
              <div key={s.label} className="rounded-lg bg-muted/30 px-4 py-3">
                <p className="text-[10px] text-muted-foreground mb-1">{s.label}</p>
                <p className="text-sm font-semibold tabular-nums">{s.value}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {ACTIONS.map(({ type, label, icon: Icon, cls }) => (
              <Button
                key={type}
                size="sm"
                disabled={!canDo(type) || clockMutation.isPending}
                onClick={() => { setClockType(type); setClockDialog(true); }}
                className={cn("gap-1.5 h-8 text-xs", canDo(type) ? cls : "opacity-40")}
                variant="outline"
              >
                <Icon className="h-3.5 w-3.5" /> {label}
              </Button>
            ))}
          </div>
          {myAttendance?.status && (
            <div className="mt-3">
              <Badge variant="outline" className={cn("text-xs capitalize", STATUS_COLORS[myAttendance.status] ?? "")}>
                {myAttendance.status.replace("_", " ")}
              </Badge>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input className="pl-8 h-8 text-sm" placeholder="Search employees..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Input type="date" className="h-8 text-sm w-auto" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
      </div>

      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border/40">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Records — {format(parseISO(selectedDate), "MMMM d, yyyy")}</span>
          <span className="text-xs text-muted-foreground">({(records as AttendanceRecord[]).length})</span>
        </div>
        <div className="flex items-center gap-3 px-5 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider border-b border-border/30 bg-muted/20">
          <span className="flex-1">Employee</span>
          <span className="w-16 text-center hidden sm:block">In</span>
          <span className="w-16 text-center hidden sm:block">Out</span>
          <span className="w-12 text-center hidden md:block">Hours</span>
          <span className="w-20 text-center">Status</span>
        </div>
        <div className="divide-y divide-border/40">
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3 animate-pulse">
                <div className="h-7 w-7 rounded-full bg-muted" />
                <div className="flex-1 h-4 bg-muted rounded" />
              </div>
            ))
          ) : (records as AttendanceRecord[]).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <Clock className="h-10 w-10 text-muted-foreground/20" />
              <p className="text-sm text-muted-foreground">No records for this date</p>
            </div>
          ) : (records as AttendanceRecord[]).map((r) => (
            <div key={r.id} className="flex items-center gap-3 px-5 py-2.5 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{getInitials(r.employee_name || "?")}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{r.employee_name || "Unknown"}</p>
                  {r.location_lat && <p className="text-[10px] text-muted-foreground flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />Tracked</p>}
                </div>
              </div>
              <span className="w-16 text-center text-xs text-muted-foreground hidden sm:block">{r.clock_in ? format(new Date(r.clock_in), "HH:mm") : "—"}</span>
              <span className="w-16 text-center text-xs hidden sm:block">{r.clock_out ? format(new Date(r.clock_out), "HH:mm") : <span className="text-emerald-500 text-[10px]">Active</span>}</span>
              <span className="w-12 text-center text-xs font-medium hidden md:block">{r.total_hours ? `${r.total_hours}h` : "—"}</span>
              <div className="w-20 flex justify-center">
                <Badge variant="outline" className={cn("text-[10px] capitalize", STATUS_COLORS[r.status] ?? "bg-muted text-muted-foreground")}>
                  {r.status.replace("_", " ")}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={clockDialog} onOpenChange={setClockDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{clockType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</DialogTitle>
            <DialogDescription>
              {clockType === "clock_in" && "Start your work day"}
              {clockType === "clock_out" && "End your work day"}
              {clockType === "break_start" && "Take a break"}
              {clockType === "break_end" && "Resume work"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="rounded-lg bg-muted/30 px-4 py-3 text-center">
              <p className="text-2xl font-bold tabular-nums">{format(now, "HH:mm:ss")}</p>
              <p className="text-xs text-muted-foreground">{format(now, "EEEE, MMMM d")}</p>
            </div>
            <div className="space-y-1.5">
              <Label>Notes (optional)</Label>
              <Textarea placeholder="Add notes..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
            </div>
            {location && <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />Location will be recorded</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setClockDialog(false)}>Cancel</Button>
            <Button size="sm" onClick={() => clockMutation.mutate(clockType)} disabled={clockMutation.isPending}>
              {clockMutation.isPending ? "Recording..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
