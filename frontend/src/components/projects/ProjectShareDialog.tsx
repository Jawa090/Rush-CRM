import { useState } from "react";
import { Copy, ExternalLink, Link2, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useProjectShares, useCreateShare, useToggleShare, type ProjectShare } from "@/hooks/useProjectFeatures";

export function ProjectShareDialog({ projectId, open, onOpenChange }: { projectId: string; open: boolean; onOpenChange: (o: boolean) => void }) {
  const { data: shares = [] } = useProjectShares(projectId);
  const createShare = useCreateShare();
  const toggleShare = useToggleShare();
  const [form, setForm] = useState({ client_name: "", client_email: "" });

  const handleCreate = () => {
    createShare.mutate(
      { project_id: projectId, client_name: form.client_name || undefined, client_email: form.client_email || undefined },
      { onSuccess: () => setForm({ client_name: "", client_email: "" }) }
    );
  };

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/project-report/${token}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Share Project Report</DialogTitle></DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Client Name</Label><Input value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))} placeholder="Client name" /></div>
              <div><Label>Client Email</Label><Input value={form.client_email} onChange={e => setForm(f => ({ ...f, client_email: e.target.value }))} placeholder="email@example.com" /></div>
            </div>
            <Button size="sm" className="gap-1 w-full" onClick={handleCreate} disabled={createShare.isPending}>
              <Link2 className="h-3.5 w-3.5" /> Generate Share Link
            </Button>
          </div>

          {shares.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Active Links</Label>
              {shares.map(s => (
                <Card key={s.id}>
                  <CardContent className="p-3 flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{s.client_name || "Unnamed"}</p>
                      {s.client_email && <p className="text-xs text-muted-foreground">{s.client_email}</p>}
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant={s.is_active ? "default" : "secondary"} className="text-[10px]">
                        {s.is_active ? "Active" : "Disabled"}
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyLink(s.share_token)}>
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleShare.mutate({ id: s.id, is_active: !s.is_active, project_id: projectId })}>
                        {s.is_active ? <ToggleRight className="h-4 w-4 text-success" /> : <ToggleLeft className="h-4 w-4 text-muted-foreground" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
