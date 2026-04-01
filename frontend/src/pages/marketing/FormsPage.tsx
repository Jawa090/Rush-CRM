import { useState } from "react";
import { Plus, FileText, Search, Trash2, MoreHorizontal, Copy, Eye, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import EmbedCodeDialog from "@/components/marketing/EmbedCodeDialog";
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
import { useMarketingForms, useCreateForm, useDeleteForm, useMarketingLists } from "@/hooks/useMarketingData";
import { format } from "date-fns";
import { toast } from "sonner";

const defaultFields = [
  { name: "email", type: "email", label: "Email", required: true },
  { name: "first_name", type: "text", label: "First Name", required: true },
  { name: "last_name", type: "text", label: "Last Name", required: false },
  { name: "company", type: "text", label: "Company", required: false },
  { name: "phone", type: "tel", label: "Phone", required: false },
];

export default function FormsPage() {
  const { data: forms = [], isLoading } = useMarketingForms();
  const { data: lists = [] } = useMarketingLists();
  const createForm = useCreateForm();
  const deleteForm = useDeleteForm();
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [embedForm, setEmbedForm] = useState<{ id: string; name: string } | null>(null);
  const [form, setForm] = useState({ name: "", description: "", form_type: "inline", target_list_id: "", lifecycle_stage_on_submit: "subscriber" });

  const filtered = forms.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = () => {
    createForm.mutate({
      name: form.name,
      description: form.description || null,
      form_type: form.form_type,
      fields: defaultFields,
      target_list_id: form.target_list_id || null,
      lifecycle_stage_on_submit: form.lifecycle_stage_on_submit,
    } as any, {
      onSuccess: () => { setShowCreate(false); setForm({ name: "", description: "", form_type: "inline", target_list_id: "", lifecycle_stage_on_submit: "subscriber" }); },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">Lead Capture Forms</h1>
        <Button onClick={() => setShowCreate(true)} className="gap-2">
          <Plus className="h-4 w-4" /> New Form
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search forms..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading forms...</div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p>No forms yet. Create lead capture forms to collect and convert prospects.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Form Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Submissions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Lifecycle Stage</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((f) => (
                <TableRow key={f.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{f.name}</p>
                      {f.description && <p className="text-xs text-muted-foreground truncate max-w-[200px]">{f.description}</p>}
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{f.form_type || 'inline'}</Badge></TableCell>
                  <TableCell className="text-right font-medium">{f.submission_count || 0}</TableCell>
                  <TableCell>
                    <Badge variant={f.is_active !== false ? "default" : "secondary"}>{f.is_active !== false ? "Active" : "Inactive"}</Badge>
                  </TableCell>
                  <TableCell className="capitalize text-sm">{f.lifecycle_stage_on_submit || 'subscriber'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{format(new Date(f.created_at), "MMM d, yyyy")}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEmbedForm({ id: f.id, name: f.name })}>
                          <Code className="h-4 w-4 mr-2" /> Get Embed Code
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { navigator.clipboard.writeText(f.id); toast.success("Form ID copied"); }}>
                          <Copy className="h-4 w-4 mr-2" /> Copy Form ID
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => deleteForm.mutate(f.id)}>
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
            <DialogTitle>New Lead Capture Form</DialogTitle>
            <DialogDescription>Create a form to capture leads from your website or campaigns.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Form Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Website Contact Form" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Form Type</Label>
                <Select value={form.form_type} onValueChange={(v) => setForm({ ...form, form_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inline">Inline</SelectItem>
                    <SelectItem value="popup">Popup</SelectItem>
                    <SelectItem value="embedded">Embedded</SelectItem>
                    <SelectItem value="standalone">Standalone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Lifecycle Stage</Label>
                <Select value={form.lifecycle_stage_on_submit} onValueChange={(v) => setForm({ ...form, lifecycle_stage_on_submit: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="subscriber">Subscriber</SelectItem>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="mql">MQL</SelectItem>
                    <SelectItem value="sql">SQL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Target List (optional)</Label>
              <Select value={form.target_list_id} onValueChange={(v) => setForm({ ...form, target_list_id: v })}>
                <SelectTrigger><SelectValue placeholder="Auto-add to list..." /></SelectTrigger>
                <SelectContent>
                  {lists.map((l) => (
                    <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            </div>
            <div className="text-xs text-muted-foreground p-3 bg-muted rounded-lg">
              <p className="font-medium mb-1">Default Fields:</p>
              <p>Email (required), First Name (required), Last Name, Company, Phone</p>
              <p className="mt-1">Fields can be customized after creation.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!form.name.trim() || createForm.isPending}>
              {createForm.isPending ? "Creating..." : "Create Form"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {embedForm && (
        <EmbedCodeDialog
          open={!!embedForm}
          onOpenChange={(open) => { if (!open) setEmbedForm(null); }}
          formId={embedForm.id}
          formName={embedForm.name}
        />
      )}
    </div>
  );
}
