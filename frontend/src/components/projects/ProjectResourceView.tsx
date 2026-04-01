import { useState } from "react";
import { Plus, UserPlus, Trash2, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useProjectMembers, useAddProjectMember, useRemoveProjectMember, useProjectTasks } from "@/hooks/useProjectManagement";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { usersApi } from '@/lib/api';

const roleColors: Record<string, string> = {
  owner: "bg-chart-1/10 text-chart-1",
  manager: "bg-primary/10 text-primary",
  member: "bg-muted text-muted-foreground",
};

export function ProjectResourceView({ projectId }: { projectId: string }) {
  const { profile } = useAuth();
  const { data: members = [] } = useProjectMembers(projectId);
  const { data: tasks = [] } = useProjectTasks(projectId);
  const addMember = useAddProjectMember();
  const removeMember = useRemoveProjectMember();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [role, setRole] = useState("member");
  const [hours, setHours] = useState("");

  // Fetch org users for adding
  const { data: orgUsers = [] } = useQuery({
    queryKey: ["org_users", profile?.org_id],
    queryFn: async () => {
      if (!profile?.org_id) return [];
      const data = await usersApi.getAll().catch(() => []);
      return data || [];
    },
    enabled: !!profile?.org_id,
  });

  const memberIds = new Set(members.map((m) => m.user_id));
  const availableUsers = orgUsers.filter((u) => !memberIds.has(u.id));

  const handleAdd = () => {
    if (!selectedUser) return;
    addMember.mutate(
      { project_id: projectId, user_id: selectedUser, role, allocated_hours: hours ? Number(hours) : undefined },
      { onSuccess: () => { setDialogOpen(false); setSelectedUser(""); setRole("member"); setHours(""); } }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Team Resources</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="gap-1"><UserPlus className="h-3.5 w-3.5" /> Add Member</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Team Member</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>User</Label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger><SelectValue placeholder="Select user" /></SelectTrigger>
                  <SelectContent>
                    {availableUsers.map((u) => (
                      <SelectItem key={u.id} value={u.id}>{u.full_name} ({u.email})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Role</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Allocated Hours</Label><Input type="number" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="0" /></div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAdd} disabled={!selectedUser || addMember.isPending}>Add</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {members.map((m) => {
          const memberTasks = tasks.filter((t: any) => t.assigned_to === m.user_id);
          const completedTasks = memberTasks.filter((t: any) => t.status === "done");
          const workload = m.allocated_hours ? Math.round((memberTasks.length / Math.max(m.allocated_hours, 1)) * 100) : 0;

          return (
            <div key={m.id} className="border border-border rounded-lg bg-card p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={m.profile?.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {m.profile?.full_name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{m.profile?.full_name || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">{m.profile?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={cn("text-xs capitalize", roleColors[m.role])}>{m.role}</Badge>
                  {m.role !== "owner" && (
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeMember.mutate({ id: m.id, project_id: projectId })}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-lg font-semibold">{memberTasks.length}</p>
                  <p className="text-[10px] text-muted-foreground">Tasks</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">{completedTasks.length}</p>
                  <p className="text-[10px] text-muted-foreground">Done</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">{m.allocated_hours || 0}h</p>
                  <p className="text-[10px] text-muted-foreground">Allocated</p>
                </div>
              </div>
              {m.allocated_hours && m.allocated_hours > 0 && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Workload</span>
                    <span className="font-medium">{Math.min(workload, 100)}%</span>
                  </div>
                  <Progress value={Math.min(workload, 100)} className="h-1.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {members.length === 0 && (
        <p className="text-center py-8 text-muted-foreground text-sm">No team members yet</p>
      )}
    </div>
  );
}
