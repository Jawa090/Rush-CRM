import { useState } from "react";
import { Plus, Receipt, DollarSign, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useProjectInvoices, useCreateInvoice, useUpdateInvoice, type ProjectInvoice } from "@/hooks/useProjectFeatures";

const statusConfig: Record<string, { color: string; label: string }> = {
  draft: { color: "bg-muted text-muted-foreground", label: "Draft" },
  sent: { color: "bg-chart-1/10 text-chart-1", label: "Sent" },
  paid: { color: "bg-success/10 text-success", label: "Paid" },
  overdue: { color: "bg-destructive/10 text-destructive", label: "Overdue" },
  cancelled: { color: "bg-muted text-muted-foreground line-through", label: "Cancelled" },
};

export function ProjectInvoicesView({ projectId, budget, currency }: { projectId: string; budget?: number | null; currency?: string }) {
  const { data: invoices = [], isLoading } = useProjectInvoices(projectId);
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ invoice_number: "", amount: "", currency: currency || "USD", due_date: "", notes: "" });

  const totalInvoiced = invoices.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const totalPaid = invoices.filter(i => i.status === "paid").reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const totalOutstanding = invoices.filter(i => ["sent", "overdue"].includes(i.status)).reduce((s, i) => s + (Number(i.amount) || 0), 0);

  const handleCreate = () => {
    createInvoice.mutate(
      { project_id: projectId, invoice_number: form.invoice_number || undefined, amount: Number(form.amount), currency: form.currency, due_date: form.due_date || undefined, notes: form.notes || undefined },
      { onSuccess: () => { setDialogOpen(false); setForm({ invoice_number: "", amount: "", currency: currency || "USD", due_date: "", notes: "" }); } }
    );
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        <Card><CardContent className="pt-4 pb-3 px-4"><p className="text-xs text-muted-foreground">Budget</p><p className="text-lg font-bold">${(Number(budget) || 0).toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="pt-4 pb-3 px-4"><p className="text-xs text-muted-foreground">Total Invoiced</p><p className="text-lg font-bold">${totalInvoiced.toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="pt-4 pb-3 px-4"><p className="text-xs text-muted-foreground">Paid</p><p className="text-lg font-bold text-success">${totalPaid.toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="pt-4 pb-3 px-4"><p className="text-xs text-muted-foreground">Outstanding</p><p className="text-lg font-bold text-warning">${totalOutstanding.toLocaleString()}</p></CardContent></Card>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Invoices</h3>
        <Button size="sm" className="gap-1" onClick={() => setDialogOpen(true)}><Plus className="h-3.5 w-3.5" /> New Invoice</Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground text-center py-8">Loading...</p>
      ) : invoices.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Receipt className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No invoices yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {invoices.map(inv => {
            const st = statusConfig[inv.status] || statusConfig.draft;
            return (
              <Card key={inv.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Receipt className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{inv.invoice_number || `INV-${inv.id.slice(0, 6).toUpperCase()}`}</p>
                      <p className="text-xs text-muted-foreground">{new Date(inv.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-semibold">${Number(inv.amount).toLocaleString()}</p>
                    {inv.due_date && <span className="text-xs text-muted-foreground">Due: {new Date(inv.due_date).toLocaleDateString()}</span>}
                    <Select value={inv.status} onValueChange={(v) => updateInvoice.mutate({ id: inv.id, status: v, ...(v === "sent" ? { sent_at: new Date().toISOString() } : {}), ...(v === "paid" ? { paid_at: new Date().toISOString() } : {}) })}>
                      <SelectTrigger className="w-28 h-7 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Invoice</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Invoice #</Label><Input value={form.invoice_number} onChange={e => setForm(f => ({ ...f, invoice_number: e.target.value }))} placeholder="INV-001" /></div>
              <div><Label>Amount</Label><Input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Currency</Label><Input value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} /></div>
              <div><Label>Due Date</Label><Input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} /></div>
            </div>
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!form.amount || createInvoice.isPending}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
