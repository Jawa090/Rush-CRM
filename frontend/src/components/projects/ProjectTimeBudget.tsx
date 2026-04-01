import { useState } from "react";
import { DollarSign, Clock, TrendingUp, AlertTriangle, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useProjectTasks, useProjectTimeEntries, useProjectMembers, useCreateTimeEntry } from "@/hooks/useProjectManagement";

interface Props {
  projectId: string;
  budget: number | null;
  currency: string;
}

export function ProjectTimeBudget({ projectId, budget, currency }: Props) {
  const { data: tasks = [] } = useProjectTasks(projectId);
  const { data: timeEntries = [] } = useProjectTimeEntries(projectId);
  const { data: members = [] } = useProjectMembers(projectId);

  const taskList = tasks as any[];
  const entryList = timeEntries as any[];
  const memberList = members as any[];
  const createTimeEntry = useCreateTimeEntry();
  const [logOpen, setLogOpen] = useState(false);
  const [logForm, setLogForm] = useState({
    hours: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
  });

  const totalHours = entryList.reduce((s: number, e: any) => s + (Number(e.hours) || 0), 0);
  const estimatedHours = taskList.reduce((s: number, t: any) => s + (t.estimated_hours || 0), 0);
  const budgetNum = Number(budget) || 0;

  const memberRates = Object.fromEntries(memberList.map((m) => [m.user_id, Number(m.hourly_rate) || 0]));
  const laborCost = entryList.reduce((s: number, e: any) => {
    const rate = memberRates[e.user_id] || 0;
    return s + rate * (Number(e.hours) || 0);
  }, 0);

  const budgetUsed = budgetNum > 0 ? Math.round((laborCost / budgetNum) * 100) : 0;
  const timeUsed = estimatedHours > 0 ? Math.round((totalHours / estimatedHours) * 100) : 0;
  const isOverBudget = budgetUsed > 100;
  const isOverTime = timeUsed > 100;

  const completedTasks = taskList.filter((t: any) => t.status === "done").length;
  const taskProgress = taskList.length > 0 ? Math.round((completedTasks / taskList.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-success" />
              <div>
                <p className="text-2xl font-bold">${budgetNum.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Budget ({currency})</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className={cn("h-8 w-8", isOverBudget ? "text-destructive" : "text-chart-1")} />
              <div>
                <p className="text-2xl font-bold">${laborCost.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Cost Spent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className={cn("h-8 w-8", isOverTime ? "text-destructive" : "text-chart-4")} />
              <div>
                <p className="text-2xl font-bold">{totalHours}h</p>
                <p className="text-xs text-muted-foreground">Hours Logged</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{estimatedHours}h</p>
                <p className="text-xs text-muted-foreground">Estimated Hours</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-border rounded-lg bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Budget Usage</span>
            {isOverBudget && (
              <Badge variant="destructive" className="text-xs gap-1">
                <AlertTriangle className="h-3 w-3" /> Over
              </Badge>
            )}
          </div>
          <Progress value={Math.min(budgetUsed, 100)} className="h-2 mb-1" />
          <p className="text-xs text-muted-foreground">{budgetUsed}% of budget used</p>
        </div>

        <div className="border border-border rounded-lg bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Time Usage</span>
            {isOverTime && (
              <Badge variant="destructive" className="text-xs gap-1">
                <AlertTriangle className="h-3 w-3" /> Over
              </Badge>
            )}
          </div>
          <Progress value={Math.min(timeUsed, 100)} className="h-2 mb-1" />
          <p className="text-xs text-muted-foreground">{totalHours}h of {estimatedHours}h estimated</p>
        </div>

        <div className="border border-border rounded-lg bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Task Completion</span>
          </div>
          <Progress value={taskProgress} className="h-2 mb-1" />
          <p className="text-xs text-muted-foreground">{completedTasks}/{taskList.length} tasks completed</p>
        </div>
      </div>

      {/* Recent Time Entries */}
      <div className="border border-border rounded-lg bg-card">
        <div className="border-b border-border px-4 py-3 flex items-center justify-between">
          <h4 className="font-semibold text-sm">Recent Time Entries</h4>
          <Button size="sm" variant="outline" className="gap-1 h-7" onClick={() => setLogOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Log Time
          </Button>
        </div>
        <div className="divide-y divide-border">
          {entryList.length === 0 ? (
            <p className="text-center py-6 text-sm text-muted-foreground">No time entries logged yet</p>
          ) : (
            entryList.slice(0, 10).map((entry: any) => (
              <div key={entry.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{entry.description || "Time entry"}</p>
                  <p className="text-xs text-muted-foreground">
                    {entry.user_name && `${entry.user_name} · `}
                    {entry.date &&
                      new Date(entry.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {Number(entry.hours || 0).toFixed(1)}h
                </Badge>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Log Time Dialog */}
      <Dialog open={logOpen} onOpenChange={setLogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Time</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Hours</Label>
                <Input
                  type="number"
                  step="0.5"
                  min="0.5"
                  placeholder="1.5"
                  value={logForm.hours}
                  onChange={(e) => setLogForm((f) => ({ ...f, hours: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={logForm.date}
                  onChange={(e) => setLogForm((f) => ({ ...f, date: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input
                placeholder="What did you work on?"
                value={logForm.description}
                onChange={(e) => setLogForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!logForm.hours || !logForm.date || createTimeEntry.isPending}
              onClick={() =>
                createTimeEntry.mutate(
                  {
                    project_id: projectId,
                    hours: Number(logForm.hours),
                    date: logForm.date,
                    description: logForm.description,
                  },
                  {
                    onSuccess: () => {
                      setLogOpen(false);
                      setLogForm({
                        hours: "",
                        date: new Date().toISOString().split("T")[0],
                        description: "",
                      });
                    },
                  }
                )
              }
            >
              {createTimeEntry.isPending ? "Saving..." : "Log Time"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
