import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ClickToCall } from "@/components/telephony/ClickToCall";
import { ArrowLeft, Pencil, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { InteractionPanel } from "@/components/crm/InteractionPanel";
import { useCompany } from "@/hooks/useCrmInteractions";
import { useUpdateCompany, useDeleteCompany } from "@/hooks/useCrmMutations";
import { useCreateActivity } from "@/hooks/useCrmInteractions";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: company, isLoading } = useCompany(id!);
  const updateCompany = useUpdateCompany();
  const deleteCompany = useDeleteCompany();
  const createActivity = useCreateActivity();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (company) setForm({ ...company });
  }, [company]);

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading company...</div>;
  if (!company) return <div className="p-8 text-center text-muted-foreground">Company not found</div>;

  const handleSave = () => {
    const changes: Record<string, unknown> = {};
    Object.entries(form).forEach(([key, val]) => {
      if (val !== (company as Record<string, unknown>)[key]) changes[key] = val;
    });
    if (Object.keys(changes).length === 0) { setEditing(false); return; }
    updateCompany.mutate({ id: company.id, ...changes }, {
      onSuccess: () => {
        setEditing(false);
        createActivity.mutate({
          entity_type: 'company', entity_id: company.id,
          activity_type: 'update', title: 'Updated company fields',
          description: `Changed: ${Object.keys(changes).join(', ')}`,
        });
      }
    });
  };

  const set = (key: string, val: unknown) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-between px-6 py-4 border-b bg-card">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/crm/customers/companies")}><ArrowLeft className="h-5 w-5" /></Button>
          <h1 className="text-xl font-semibold">{company.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <Button variant="outline" onClick={() => { setEditing(false); setForm({ ...company }); }}>Cancel</Button>
              <Button onClick={handleSave} disabled={updateCompany.isPending} className="gap-1"><Save className="h-4 w-4" /> Save</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setEditing(true)} className="gap-1"><Pencil className="h-4 w-4" /> Edit</Button>
              <AlertDialog>
                <AlertDialogTrigger asChild><Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader><AlertDialogTitle>Delete company?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                  <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteCompany.mutate(company.id, { onSuccess: () => navigate("/crm/customers/companies") })}>Delete</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-6 p-6">
        <div className="flex-1 max-w-lg space-y-4">
          <Collapsible defaultOpen>
            <div className="border border-border rounded-lg bg-card">
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">About Company</span>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-4 pt-0 space-y-3">
                  <Field label="Company Name" value={form.name as string} onChange={(v) => set("name", v)} editing={editing} />
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Company Type</Label>
                    {editing ? (
                      <Select value={form.company_type as string || ""} onValueChange={(v) => set("company_type", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="client">Client</SelectItem>
                          <SelectItem value="supplier">Supplier</SelectItem>
                          <SelectItem value="partner">Partner</SelectItem>
                          <SelectItem value="prospect">Prospect</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : <p className="text-sm capitalize">{(form.company_type as string) || "—"}</p>}
                  </div>
                  <Field label="Industry" value={form.industry as string} onChange={(v) => set("industry", v)} editing={editing} />
                  <Field label="Revenue" value={form.revenue as string} onChange={(v) => set("revenue", v)} editing={editing} />
                  {editing ? (
                    <Field label="Phone" value={form.phone as string} onChange={(v) => set("phone", v)} editing={editing} />
                  ) : (
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Phone</Label>
                      {(form.phone as string) ? (
                        <ClickToCall phoneNumber={form.phone as string} entityType="company" entityId={id} className="text-sm" />
                      ) : (
                        <p className="text-sm">—</p>
                      )}
                    </div>
                  )}
                  <Field label="Email" value={form.email as string} onChange={(v) => set("email", v)} editing={editing} />
                  <Field label="Website" value={form.website as string} onChange={(v) => set("website", v)} editing={editing} />
                  <Field label="Messenger" value={form.messenger as string} onChange={(v) => set("messenger", v)} editing={editing} />
                  <Field label="Address" value={form.address as string} onChange={(v) => set("address", v)} editing={editing} />
                  <Field label="Employee Count" value={form.employee_count as string} onChange={(v) => set("employee_count", v)} editing={editing} />
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>

          <Collapsible defaultOpen>
            <div className="border border-border rounded-lg bg-card">
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notes</span>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-4 pt-0">
                  {editing ? (
                    <Textarea value={form.comment as string || ""} onChange={(e) => set("comment", e.target.value)} className="min-h-[80px]" />
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{(form.comment as string) || "No notes"}</p>
                  )}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        </div>

        <div className="flex-1 max-w-lg">
          <InteractionPanel entityType="company" entityId={id!} />
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, editing }: {
  label: string; value: string | undefined | null; onChange: (v: string) => void; editing: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {editing ? <Input value={value || ""} onChange={(e) => onChange(e.target.value)} /> : <p className="text-sm">{value || "—"}</p>}
    </div>
  );
}
