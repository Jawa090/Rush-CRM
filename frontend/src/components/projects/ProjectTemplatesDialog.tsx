import { useState } from "react";
import { Plus, Trash2, Copy, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useProjectTemplates, useCreateTemplate, useDeleteTemplate, useApplyTemplate, type ProjectTemplate } from "@/hooks/useProjectFeatures";
import { useProjectMilestones, useProjectTasks } from "@/hooks/useProjectManagement";
import { toast } from "sonner";

export function ProjectTemplatesDialog({ open, onOpenChange, onApply }: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onApply?: (template: ProjectTemplate) => void;
}) {
  const { data: templates = [] } = useProjectTemplates();
  const createTemplate = useCreateTemplate();
  const deleteTemplate = useDeleteTemplate();
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  const handleCreate = () => {
    createTemplate.mutate(
      { name: form.name, description: form.description || undefined },
      { onSuccess: () => { setCreating(false); setForm({ name: "", description: "" }); } }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Project Templates</DialogTitle></DialogHeader>
        
        <div className="space-y-4">
          {templates.length === 0 && !creating ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No templates yet</p>
              <p className="text-xs mt-1">Create a template to reuse project structures</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {templates.map(t => (
                <Card key={t.id}>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{t.name}</p>
                      {t.description && <p className="text-xs text-muted-foreground">{t.description}</p>}
                      <div className="flex gap-1 mt-1">
                        {Array.isArray(t.default_milestones) && t.default_milestones.length > 0 && (
                          <Badge variant="outline" className="text-[10px]">{t.default_milestones.length} milestones</Badge>
                        )}
                        {Array.isArray(t.default_tasks) && t.default_tasks.length > 0 && (
                          <Badge variant="outline" className="text-[10px]">{t.default_tasks.length} tasks</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {onApply && (
                        <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => { onApply(t); onOpenChange(false); }}>
                          <Copy className="h-3 w-3" /> Use
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteTemplate.mutate(t.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {creating ? (
            <div className="space-y-3 border rounded-lg p-3">
              <div><Label>Template Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Web Design Project" /></div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleCreate} disabled={!form.name || createTemplate.isPending}>Save Template</Button>
                <Button size="sm" variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" className="w-full gap-1" onClick={() => setCreating(true)}>
              <Plus className="h-3.5 w-3.5" /> Create Template
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function SaveAsTemplateButton({ projectId }: { projectId: string }) {
  const { data: milestones = [] } = useProjectMilestones(projectId);
  const { data: tasks = [] } = useProjectTasks(projectId);
  const createTemplate = useCreateTemplate();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  const handleSave = () => {
    const mTemplates = milestones.map((m: any) => ({ name: m.name, description: m.description, sort_order: m.sort_order }));
    const tTemplates = tasks.map((t: any) => ({ title: t.title, description: t.description, status: "todo", priority: t.priority }));
    createTemplate.mutate(
      { name, default_milestones: mTemplates, default_tasks: tTemplates },
      { onSuccess: () => { setOpen(false); setName(""); toast.success("Saved as template"); } }
    );
  };

  return (
    <>
      <Button variant="outline" size="sm" className="gap-1" onClick={() => setOpen(true)}>
        <FileText className="h-3.5 w-3.5" /> Save as Template
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Save Project as Template</DialogTitle></DialogHeader>
          <div><Label>Template Name</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="Template name" /></div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!name || createTemplate.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
