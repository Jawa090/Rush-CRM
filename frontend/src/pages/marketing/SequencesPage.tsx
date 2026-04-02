import { useState } from "react";
import { Plus, Zap, Search, MoreHorizontal, Trash2, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useMarketingSequences, useCreateSequence, useDeleteSequence, useUpdateSequence } from "@/hooks/useMarketingData";
import { toast } from "sonner";
import { format } from "date-fns";
import { useCustomDialog } from "@/contexts/DialogContext";

const triggerTypes = [
  { value: "manual", label: "Manual Enrollment" },
  { value: "form_submit", label: "Form Submission" },
  { value: "lifecycle_change", label: "Lifecycle Stage Change" },
  { value: "list_membership", label: "List Membership" },
  { value: "date_property", label: "Date Property" },
];

export default function SequencesPage() {
  const { data: sequences = [], isLoading } = useMarketingSequences();
  const createSequence = useCreateSequence();
  const deleteSequence = useDeleteSequence();
  const updateSequence = useUpdateSequence();
  const { confirm } = useCustomDialog();
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", trigger_type: "manual" });

  const filtered = sequences.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    
    try {
      await createSequence.mutateAsync({
        name: form.name,
        description: form.description,
        trigger_type: form.trigger_type,
        steps: []
      });
      setShowCreate(false);
      setForm({ name: "", description: "", trigger_type: "manual" });
    } catch (error) {
      // Error handled by the hook
    }
  };

  const handleDelete = async (id: string) => {
    if (await confirm('Are you sure you want to delete this sequence?', { variant: 'destructive', title: 'Delete Sequence' })) {
      await deleteSequence.mutateAsync(id);
    }
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    await updateSequence.mutateAsync({ id, is_active: !currentActive });
    toast.success(currentActive ? "Sequence paused" : "Sequence activated");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">Automation Sequences</h1>
        <Button onClick={() => setShowCreate(true)} className="gap-2">
          <Plus className="h-4 w-4" /> New Sequence
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search sequences..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading sequences...</div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Zap className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p>No sequences yet. Create drip campaigns and nurture workflows to automate engagement.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sequence</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead className="text-right">Enrolled</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{s.name}</p>
                      {s.description && <p className="text-xs text-muted-foreground truncate max-w-[250px]">{s.description}</p>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{triggerTypes.find(t => t.value === s.trigger_type)?.label || s.trigger_type}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">{s.enrollment_count || 0}</TableCell>
                  <TableCell>
                    <Badge variant={s.is_active ? "default" : "secondary"}>{s.is_active ? "Active" : "Inactive"}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{format(new Date(s.created_at), "MMM d, yyyy")}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => toggleActive(s.id, s.is_active)}>
                          {s.is_active ? <><Pause className="h-4 w-4 mr-2" /> Pause</> : <><Play className="h-4 w-4 mr-2" /> Activate</>}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(s.id)} className="text-red-600">
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

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Automation Sequence</DialogTitle>
            <DialogDescription>Build a drip campaign or nurture workflow with timed steps.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Sequence Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Welcome Drip Campaign" />
            </div>
            <div className="space-y-2">
              <Label>Trigger Type</Label>
              <Select value={form.trigger_type} onValueChange={(v) => setForm({ ...form, trigger_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {triggerTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button 
              onClick={handleCreate} 
              disabled={!form.name.trim() || createSequence.isPending}
            >
              {createSequence.isPending ? 'Creating...' : 'Create Sequence'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
