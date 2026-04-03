import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus, Zap, Search, MoreHorizontal, Trash2, Play, Pause, Copy, Edit,
  TrendingUp, Users, Mail, Clock, CheckCircle2, XCircle, BarChart3, Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useMarketingSequences, useCreateSequence, useDeleteSequence, useUpdateSequence, useMarketingLists } from "@/hooks/useMarketingData";
import { toast } from "sonner";
import { format } from "date-fns";
import { useCustomDialog } from "@/contexts/DialogContext";

const triggerTypes = [
  { value: "manual", label: "Manual Enrollment", icon: "👤", description: "Manually add contacts" },
  { value: "form_submit", label: "Form Submission", icon: "📝", description: "When a form is submitted" },
  { value: "list_membership", label: "List Membership", icon: "📋", description: "When added to a list" },
  { value: "lifecycle_change", label: "Lifecycle Stage", icon: "🎯", description: "When stage changes" },
  { value: "date_property", label: "Date Property", icon: "📅", description: "Based on a date field" },
  { value: "page_view", label: "Page View", icon: "👁️", description: "When page is viewed" },
];

const stepTypes = [
  { value: "email", label: "Send Email", icon: "📧", description: "Send an email to contact" },
  { value: "wait", label: "Wait Delay", icon: "⏰", description: "Wait for a period of time" },
  { value: "condition", label: "If/Then Branch", icon: "🔀", description: "Split based on condition" },
  { value: "add_to_list", label: "Add to List", icon: "➕", description: "Add contact to a list" },
  { value: "remove_from_list", label: "Remove from List", icon: "➖", description: "Remove from a list" },
  { value: "update_property", label: "Update Property", icon: "✏️", description: "Change contact property" },
  { value: "notification", label: "Internal Notification", icon: "🔔", description: "Notify team member" },
];

export default function EnhancedSequencesPage() {
  const navigate = useNavigate();
  const { data: sequences = [], isLoading } = useMarketingSequences();
  const { data: lists = [] } = useMarketingLists();
  const createSequence = useCreateSequence();
  const deleteSequence = useDeleteSequence();
  const updateSequence = useUpdateSequence();
  const { confirm } = useCustomDialog();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    trigger_type: "manual",
  });

  const [sequenceSteps, setSequenceSteps] = useState<any[]>([]);
  const [newStep, setNewStep] = useState({
    type: "email",
    delay_value: 1,
    delay_unit: "days",
    email_subject: "",
    email_content: "",
  });

  const filtered = sequences.filter((s: any) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "active" && s.is_active) ||
      (statusFilter === "inactive" && !s.is_active);
    return matchesSearch && matchesStatus;
  });

  const handleCreate = async () => {
    if (!form.name.trim()) {
      toast.error("Sequence name is required");
      return;
    }

    try {
      await createSequence.mutateAsync({
        name: form.name,
        description: form.description,
        trigger_type: form.trigger_type,
        steps: sequenceSteps,
      });

      setShowCreate(false);
      setForm({ name: "", description: "", trigger_type: "manual" });
      setSequenceSteps([]);
      toast.success("Sequence created successfully");
    } catch (error) {
      toast.error("Failed to create sequence");
    }
  };

  const handleDelete = async (id: string) => {
    if (await confirm("Are you sure you want to delete this sequence?", {
      variant: "destructive",
      title: "Delete Sequence"
    })) {
      try {
        await deleteSequence.mutateAsync(id);
        toast.success("Sequence deleted");
      } catch (error) {
        toast.error("Failed to delete sequence");
      }
    }
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    try {
      await updateSequence.mutateAsync({ id, is_active: !currentActive });
      toast.success(currentActive ? "Sequence paused" : "Sequence activated");
    } catch (error) {
      toast.error("Failed to update sequence");
    }
  };

  const addStep = () => {
    const step: any = {
      type: newStep.type,
      order: sequenceSteps.length + 1,
    };

    if (newStep.type === "email") {
      step.email_subject = newStep.email_subject;
      step.email_content = newStep.email_content;
    } else if (newStep.type === "wait") {
      step.delay_value = newStep.delay_value;
      step.delay_unit = newStep.delay_unit;
    }

    setSequenceSteps([...sequenceSteps, step]);
    setNewStep({
      type: "email",
      delay_value: 1,
      delay_unit: "days",
      email_subject: "",
      email_content: "",
    });
    toast.success("Step added");
  };

  const removeStep = (index: number) => {
    setSequenceSteps(sequenceSteps.filter((_, i) => i !== index));
  };

  const activeSequences = filtered.filter((s: any) => s.is_active);
  const inactiveSequences = filtered.filter((s: any) => !s.is_active);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Automation Sequences</h1>
          <p className="text-sm text-muted-foreground">Create automated workflows to nurture leads and engage contacts</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-2" /> New Sequence
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sequences</p>
                <p className="text-2xl font-bold">{sequences.length}</p>
              </div>
              <Zap className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Sequences</p>
                <p className="text-2xl font-bold">{activeSequences.length}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-success opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Enrolled</p>
                <p className="text-2xl font-bold">
                  {sequences.reduce((sum: number, s: any) => sum + (s.enrollment_count || 0), 0).toLocaleString()}
                </p>
              </div>
              <Users className="h-8 w-8 text-chart-2 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">
                  {sequences.length > 0 ? ((activeSequences.length / sequences.length) * 100).toFixed(0) : 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-chart-3 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sequences..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sequences Table */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Sequences ({sequences.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({activeSequences.length})</TabsTrigger>
          <TabsTrigger value="inactive">Inactive ({inactiveSequences.length})</TabsTrigger>
        </TabsList>

        {["all", "active", "inactive"].map((tab) => (
          <TabsContent key={tab} value={tab}>
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading sequences...</div>
            ) : filtered.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Zap className="h-12 w-12 mx-auto mb-4 opacity-40" />
                  <p className="text-muted-foreground mb-4">
                    {search ? "No sequences found matching your search" : "No sequences yet. Create automated workflows to nurture your leads."}
                  </p>
                  <Button onClick={() => setShowCreate(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Create Sequence
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sequence Name</TableHead>
                      <TableHead>Trigger</TableHead>
                      <TableHead className="text-right">Enrolled</TableHead>
                      <TableHead className="text-right">Steps</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((s: any) => (
                      <TableRow key={s.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{s.name}</p>
                            {s.description && (
                              <p className="text-xs text-muted-foreground truncate max-w-[250px]">
                                {s.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {triggerTypes.find((t) => t.value === s.trigger_type)?.label || s.trigger_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-medium">{(s.enrollment_count || 0).toLocaleString()}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary">{(s.steps?.length || 0)} steps</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {s.is_active ? (
                              <Badge variant="default" className="gap-1">
                                <CheckCircle2 className="h-3 w-3" /> Active
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="gap-1">
                                <XCircle className="h-3 w-3" /> Inactive
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(s.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => toggleActive(s.id, s.is_active)}>
                                {s.is_active ? (
                                  <>
                                    <Pause className="h-4 w-4 mr-2" /> Pause Sequence
                                  </>
                                ) : (
                                  <>
                                    <Play className="h-4 w-4 mr-2" /> Activate Sequence
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <BarChart3 className="h-4 w-4 mr-2" /> View Analytics
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Users className="h-4 w-4 mr-2" /> View Enrollments
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" /> Edit Sequence
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="h-4 w-4 mr-2" /> Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Settings className="h-4 w-4 mr-2" /> Settings
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDelete(s.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Create Sequence Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Automation Sequence</DialogTitle>
            <DialogDescription>
              Build a multi-step workflow to automatically engage and nurture your contacts
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="font-semibold">Basic Information</h3>
              <div className="space-y-2">
                <Label>Sequence Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Welcome Drip Campaign"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  placeholder="Describe the purpose of this sequence..."
                />
              </div>

              <div className="space-y-2">
                <Label>Enrollment Trigger</Label>
                <Select value={form.trigger_type} onValueChange={(v) => setForm({ ...form, trigger_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {triggerTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        <div className="flex items-center gap-2">
                          <span>{t.icon}</span>
                          <div>
                            <p className="font-medium">{t.label}</p>
                            <p className="text-xs text-muted-foreground">{t.description}</p>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Sequence Steps */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Sequence Steps</h3>
                <Button variant="outline" size="sm" onClick={() => setShowSteps(!showSteps)}>
                  {showSteps ? "Hide" : "Add"} Steps
                </Button>
              </div>

              {sequenceSteps.length > 0 && (
                <div className="space-y-2">
                  {sequenceSteps.map((step, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium capitalize">{step.type.replace("_", " ")}</p>
                        <p className="text-xs text-muted-foreground">
                          {step.type === "email" && `Subject: ${step.email_subject || "Untitled"}`}
                          {step.type === "wait" && `Wait ${step.delay_value} ${step.delay_unit}`}
                          {step.type === "condition" && "If/Then branch"}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeStep(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {showSteps && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                  <div className="space-y-2">
                    <Label>Step Type</Label>
                    <Select value={newStep.type} onValueChange={(v) => setNewStep({ ...newStep, type: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {stepTypes.map((st) => (
                          <SelectItem key={st.value} value={st.value}>
                            <div className="flex items-center gap-2">
                              <span>{st.icon}</span>
                              <div>
                                <p className="font-medium">{st.label}</p>
                                <p className="text-xs text-muted-foreground">{st.description}</p>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {newStep.type === "email" && (
                    <>
                      <div className="space-y-2">
                        <Label>Email Subject</Label>
                        <Input
                          value={newStep.email_subject}
                          onChange={(e) => setNewStep({ ...newStep, email_subject: e.target.value })}
                          placeholder="Email subject line..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email Content</Label>
                        <Textarea
                          value={newStep.email_content}
                          onChange={(e) => setNewStep({ ...newStep, email_content: e.target.value })}
                          rows={4}
                          placeholder="Email body..."
                        />
                      </div>
                    </>
                  )}

                  {newStep.type === "wait" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Wait Duration</Label>
                        <Input
                          type="number"
                          min="1"
                          value={newStep.delay_value}
                          onChange={(e) => setNewStep({ ...newStep, delay_value: parseInt(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Time Unit</Label>
                        <Select value={newStep.delay_unit} onValueChange={(v) => setNewStep({ ...newStep, delay_unit: v })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="minutes">Minutes</SelectItem>
                            <SelectItem value="hours">Hours</SelectItem>
                            <SelectItem value="days">Days</SelectItem>
                            <SelectItem value="weeks">Weeks</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  <Button onClick={addStep} className="w-full">
                    <Plus className="h-4 w-4 mr-2" /> Add Step
                  </Button>
                </div>
              )}

              {sequenceSteps.length === 0 && !showSteps && (
                <div className="p-8 border-2 border-dashed rounded-lg text-center">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-40" />
                  <p className="text-sm text-muted-foreground mb-3">
                    No steps added yet. Click "Add Steps" to build your workflow.
                  </p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createSequence.isPending}>
              {createSequence.isPending ? "Creating..." : "Create Sequence"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
