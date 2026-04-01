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
import { useContact } from "@/hooks/useCrmInteractions";
import { useUpdateContact, useDeleteContact } from "@/hooks/useCrmMutations";
import { useCreateActivity } from "@/hooks/useCrmInteractions";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: contact, isLoading } = useContact(id!);
  const updateContact = useUpdateContact();
  const deleteContact = useDeleteContact();
  const createActivity = useCreateActivity();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (contact) setForm({ ...contact });
  }, [contact]);

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading contact...</div>;
  if (!contact) return <div className="p-8 text-center text-muted-foreground">Contact not found</div>;

  const handleSave = () => {
    const changes: Record<string, unknown> = {};
    Object.entries(form).forEach(([key, val]) => {
      if (val !== (contact as Record<string, unknown>)[key]) changes[key] = val;
    });
    if (Object.keys(changes).length === 0) { setEditing(false); return; }
    updateContact.mutate({ id: contact.id, ...changes }, {
       onSuccess: () => {
         setEditing(false);
         createActivity.mutate({
           entityType: 'contact', entityId: contact.id,
           activityType: 'update', title: 'Updated contact fields',
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
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></Button>
          <h1 className="text-xl font-semibold">{contact.first_name} {contact.last_name || ""}</h1>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <Button variant="outline" onClick={() => { setEditing(false); setForm({ ...contact }); }}>Cancel</Button>
              <Button onClick={handleSave} disabled={updateContact.isPending} className="gap-1"><Save className="h-4 w-4" /> Save</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setEditing(true)} className="gap-1"><Pencil className="h-4 w-4" /> Edit</Button>
              <AlertDialog>
                <AlertDialogTrigger asChild><Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader><AlertDialogTitle>Delete contact?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                  <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteContact.mutate(contact.id, { onSuccess: () => navigate(-1) })}>Delete</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-6 p-6">
        <div className="flex-1 max-w-md space-y-4">
          <Collapsible defaultOpen>
            <div className="border border-border rounded-lg bg-card">
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">About Contact</span>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-4 pt-0 space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Salutation</Label>
                    {editing ? (
                      <Select value={form.salutation as string || ""} onValueChange={(v) => set("salutation", v)}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mr">Mr.</SelectItem>
                          <SelectItem value="mrs">Mrs.</SelectItem>
                          <SelectItem value="ms">Ms.</SelectItem>
                          <SelectItem value="dr">Dr.</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : <p className="text-sm capitalize">{(form.salutation as string) || "—"}</p>}
                  </div>
                  <Field label="First Name" value={form.first_name as string} onChange={(v) => set("first_name", v)} editing={editing} />
                  <Field label="Last Name" value={form.last_name as string} onChange={(v) => set("last_name", v)} editing={editing} />
                  <Field label="Second Name" value={form.second_name as string} onChange={(v) => set("second_name", v)} editing={editing} />
                  <Field label="Position" value={form.position as string} onChange={(v) => set("position", v)} editing={editing} />
                  {editing ? (
                    <Field label="Phone" value={form.phone as string} onChange={(v) => set("phone", v)} editing={editing} />
                  ) : (
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Phone</Label>
                      {(form.phone as string) ? (
                        <ClickToCall phoneNumber={form.phone as string} entityType="contact" entityId={id} className="text-sm" />
                      ) : (
                        <p className="text-sm">—</p>
                      )}
                    </div>
                  )}
                  <Field label="Email" value={form.email as string} onChange={(v) => set("email", v)} editing={editing} />
                  <Field label="Website" value={form.website as string} onChange={(v) => set("website", v)} editing={editing} />
                  <Field label="Messenger" value={form.messenger as string} onChange={(v) => set("messenger", v)} editing={editing} />
                  <Field label="Address" value={form.address as string} onChange={(v) => set("address", v)} editing={editing} />
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>

          <Collapsible defaultOpen>
            <div className="border border-border rounded-lg bg-card">
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">More</span>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-4 pt-0 space-y-3">
                  <Field label="Contact Type" value={form.contact_type as string} onChange={(v) => set("contact_type", v)} editing={editing} />
                  <Field label="Source" value={form.source as string} onChange={(v) => set("source", v)} editing={editing} />
                  <Field label="Source Info" value={form.source_info as string} onChange={(v) => set("source_info", v)} editing={editing} />
                  {editing ? (
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Comment</Label>
                      <Textarea value={form.comment as string || ""} onChange={(e) => set("comment", e.target.value)} />
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Comment</Label>
                      <p className="text-sm whitespace-pre-wrap">{(form.comment as string) || "—"}</p>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        </div>

        <div className="flex-1 max-w-lg">
          <InteractionPanel entityType="contact" entityId={id!} />
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
