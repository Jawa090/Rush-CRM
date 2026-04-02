import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus, FileText, Search, Trash2, MoreHorizontal, Copy, Eye, Code, Settings,
  TrendingUp, Users, CheckCircle2, XCircle, Edit, ExternalLink, BarChart3
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

const fieldTypes = [
  { value: "text", label: "Text Input", icon: "📝" },
  { value: "email", label: "Email", icon: "📧" },
  { value: "tel", label: "Phone", icon: "📞" },
  { value: "number", label: "Number", icon: "🔢" },
  { value: "textarea", label: "Text Area", icon: "📄" },
  { value: "select", label: "Dropdown", icon: "📋" },
  { value: "checkbox", label: "Checkbox", icon: "☑️" },
  { value: "radio", label: "Radio Button", icon: "🔘" },
  { value: "date", label: "Date Picker", icon: "📅" },
  { value: "url", label: "Website URL", icon: "🔗" },
];

export default function EnhancedFormsPage() {
  const navigate = useNavigate();
  const { data: forms = [], isLoading } = useMarketingForms();
  const { data: lists = [] } = useMarketingLists();
  const createForm = useCreateForm();
  const deleteForm = useDeleteForm();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [showEmbed, setShowEmbed] = useState<{ id: string; name: string } | null>(null);
  const [showFields, setShowFields] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    form_type: "inline",
    target_list_id: "",
    lifecycle_stage_on_submit: "subscriber",
    success_message: "Thank you for your submission!",
    redirect_url: "",
  });

  const [formFields, setFormFields] = useState(defaultFields);
  const [newField, setNewField] = useState({
    name: "",
    type: "text",
    label: "",
    required: false,
  });

  const filtered = forms.filter((f: any) => {
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "active" && f.is_active !== false) ||
      (statusFilter === "inactive" && f.is_active === false);
    return matchesSearch && matchesStatus;
  });

  const handleCreate = async () => {
    if (!form.name.trim()) {
      toast.error("Form name is required");
      return;
    }

    try {
      await createForm.mutateAsync({
        name: form.name,
        description: form.description || null,
        form_type: form.form_type,
        fields: formFields,
        target_list_id: form.target_list_id || null,
        lifecycle_stage_on_submit: form.lifecycle_stage_on_submit,
        success_message: form.success_message,
        redirect_url: form.redirect_url || null,
      } as any);

      setShowCreate(false);
      setForm({
        name: "",
        description: "",
        form_type: "inline",
        target_list_id: "",
        lifecycle_stage_on_submit: "subscriber",
        success_message: "Thank you for your submission!",
        redirect_url: "",
      });
      setFormFields(defaultFields);
      toast.success("Form created successfully");
    } catch (error) {
      toast.error("Failed to create form");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this form?")) {
      try {
        await deleteForm.mutateAsync(id);
        toast.success("Form deleted successfully");
      } catch (error) {
        toast.error("Failed to delete form");
      }
    }
  };

  const addField = () => {
    if (!newField.name || !newField.label) {
      toast.error("Field name and label are required");
      return;
    }

    setFormFields([...formFields, { ...newField }]);
    setNewField({ name: "", type: "text", label: "", required: false });
    toast.success("Field added");
  };

  const removeField = (index: number) => {
    setFormFields(formFields.filter((_, i) => i !== index));
  };

  const generateEmbedCode = (formId: string) => {
    return `<div id="marketing-form-${formId}"></div>
<script src="${window.location.origin}/forms/embed.js"></script>
<script>
  MarketingForm.render('${formId}', {
    container: '#marketing-form-${formId}',
    theme: 'light'
  });
</script>`;
  };

  const activeForms = filtered.filter((f: any) => f.is_active !== false);
  const inactiveForms = filtered.filter((f: any) => f.is_active === false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lead Capture Forms</h1>
          <p className="text-sm text-muted-foreground">Create and manage forms to capture leads from your website</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-2" /> New Form
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Forms</p>
                <p className="text-2xl font-bold">{forms.length}</p>
              </div>
              <FileText className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Forms</p>
                <p className="text-2xl font-bold">{activeForms.length}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-success opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Submissions</p>
                <p className="text-2xl font-bold">
                  {forms.reduce((sum: number, f: any) => sum + (f.submission_count || 0), 0).toLocaleString()}
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
                <p className="text-sm text-muted-foreground">Avg Conversion</p>
                <p className="text-2xl font-bold">
                  {forms.length > 0 ? ((forms.reduce((sum: number, f: any) => sum + (f.submission_count || 0), 0) / forms.length) * 100).toFixed(1) : 0}%
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
            placeholder="Search forms..."
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
            <SelectItem value="all">All Forms</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Forms Table */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Forms ({forms.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({activeForms.length})</TabsTrigger>
          <TabsTrigger value="inactive">Inactive ({inactiveForms.length})</TabsTrigger>
        </TabsList>

        {["all", "active", "inactive"].map((tab) => (
          <TabsContent key={tab} value={tab}>
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading forms...</div>
            ) : filtered.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-40" />
                  <p className="text-muted-foreground mb-4">
                    {search ? "No forms found matching your search" : "No forms yet. Create your first form to start capturing leads."}
                  </p>
                  <Button onClick={() => setShowCreate(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Create Form
                  </Button>
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
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((f: any) => (
                      <TableRow key={f.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{f.name}</p>
                            {f.description && (
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {f.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {f.form_type || "inline"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-medium">{(f.submission_count || 0).toLocaleString()}</span>
                        </TableCell>
                        <TableCell>
                          {f.is_active !== false ? (
                            <Badge variant="default" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1">
                              <XCircle className="h-3 w-3" /> Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {f.lifecycle_stage_on_submit || "subscriber"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(f.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" /> Preview Form
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <BarChart3 className="h-4 w-4 mr-2" /> View Analytics
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setShowEmbed({ id: f.id, name: f.name })}
                              >
                                <Code className="h-4 w-4 mr-2" /> Get Embed Code
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" /> Edit Form
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
                                onClick={() => handleDelete(f.id)}
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

      {/* Create Form Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Form</DialogTitle>
            <DialogDescription>
              Design a lead capture form to collect information from your website visitors
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="font-semibold">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Form Name *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g., Contact Form"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Form Type</Label>
                  <Select value={form.form_type} onValueChange={(v) => setForm({ ...form, form_type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inline">Inline (Embedded)</SelectItem>
                      <SelectItem value="popup">Popup Modal</SelectItem>
                      <SelectItem value="slide-in">Slide-in</SelectItem>
                      <SelectItem value="standalone">Standalone Page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  placeholder="Internal description..."
                />
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Form Fields</h3>
                <Button variant="outline" size="sm" onClick={() => setShowFields(!showFields)}>
                  {showFields ? "Hide" : "Customize"} Fields
                </Button>
              </div>

              {showFields && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                  <div className="space-y-3">
                    {formFields.map((field, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-background rounded border">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{field.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {field.type} • {field.required ? "Required" : "Optional"}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeField(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-3 border-t">
                    <Input
                      placeholder="Field name"
                      value={newField.name}
                      onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                    />
                    <Input
                      placeholder="Label"
                      value={newField.label}
                      onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                    />
                    <Select value={newField.type} onValueChange={(v) => setNewField({ ...newField, type: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fieldTypes.map((ft) => (
                          <SelectItem key={ft.value} value={ft.value}>
                            {ft.icon} {ft.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={addField} size="sm">
                      <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <h3 className="font-semibold">Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Target List (Optional)</Label>
                  <Select value={form.target_list_id} onValueChange={(v) => setForm({ ...form, target_list_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Auto-add to list..." />
                    </SelectTrigger>
                    <SelectContent>
                      {lists.map((l: any) => (
                        <SelectItem key={l.id} value={l.id}>
                          {l.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Lifecycle Stage</Label>
                  <Select
                    value={form.lifecycle_stage_on_submit}
                    onValueChange={(v) => setForm({ ...form, lifecycle_stage_on_submit: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="subscriber">Subscriber</SelectItem>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="mql">Marketing Qualified Lead</SelectItem>
                      <SelectItem value="sql">Sales Qualified Lead</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Success Message</Label>
                <Textarea
                  value={form.success_message}
                  onChange={(e) => setForm({ ...form, success_message: e.target.value })}
                  rows={2}
                  placeholder="Thank you message..."
                />
              </div>

              <div className="space-y-2">
                <Label>Redirect URL (Optional)</Label>
                <Input
                  value={form.redirect_url}
                  onChange={(e) => setForm({ ...form, redirect_url: e.target.value })}
                  placeholder="https://example.com/thank-you"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createForm.isPending}>
              {createForm.isPending ? "Creating..." : "Create Form"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Embed Code Dialog */}
      {showEmbed && (
        <Dialog open={!!showEmbed} onOpenChange={() => setShowEmbed(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Embed Code for {showEmbed.name}</DialogTitle>
              <DialogDescription>
                Copy and paste this code into your website to display the form
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>HTML Embed Code</Label>
                <Textarea
                  value={generateEmbedCode(showEmbed.id)}
                  readOnly
                  rows={8}
                  className="font-mono text-xs"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(generateEmbedCode(showEmbed.id));
                    toast.success("Embed code copied to clipboard");
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" /> Copy Code
                </Button>
                <Button variant="outline" asChild>
                  <a href={`/forms/${showEmbed.id}/preview`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" /> Preview Form
                  </a>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
