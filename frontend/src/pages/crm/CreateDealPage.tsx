import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, Loader2, ArrowLeft, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/crm/ui/PageHeader";
import { EmptyState } from "@/components/crm/ui/EmptyState";
import { EntitySearchSelect } from "@/components/crm/EntitySearchSelect";
import { useContacts, useCompanies, useCreateDeal } from "@/hooks/useCrmData";
import { useToast } from "@/components/ui/use-toast";

const dealSchema = z.object({
  title: z.string().min(2, "Deal title required"),
  value: z.string().optional(),
  stage: z.string().min(1, "Pick a stage"),
  status: z.string().optional(),
  notes: z.string().optional(),
  currency: z.string().optional(),
  // Additional fields for better deal tracking
  contactName: z.string().optional(),
  companyName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  priority: z.string().optional(),
  source: z.string().optional(),
});

type DealForm = z.infer<typeof dealSchema>;

const stageOptions = [
  { value: "qualification", label: "Qualification" },
  { value: "discovery", label: "Discovery" },
  { value: "proposal_sent", label: "Proposal Sent" },
  { value: "negotiation", label: "Negotiation" },
  { value: "close_deal", label: "Close Deal" },
];

export default function CreateDealPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createDeal = useCreateDeal();
  const { data: contacts } = useContacts();
  const { data: companies } = useCompanies();

  const [contactId, setContactId] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);

  const contactOptions = useMemo(() => {
    const data = (contacts as any)?.data || contacts || [];
    return (Array.isArray(data) ? data : []).map((c: any) => ({
      id: c.id,
      label: `${c.first_name || ""} ${c.last_name || ""}`.trim() || "(no name)",
      sublabel: c.email || c.phone,
    }));
  }, [contacts]);

  const companyOptions = useMemo(() => {
    const data = (companies as any)?.data || companies || [];
    return (Array.isArray(data) ? data : []).map((c: any) => ({
      id: c.id,
      label: c.name,
      sublabel: c.email || c.phone,
    }));
  }, [companies]);

  const form = useForm<DealForm>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      title: "",
      value: "",
      stage: "qualification",
      status: "open",
      notes: "",
      currency: "USD",
      contactName: "",
      companyName: "",
      phone: "",
      email: "",
      priority: "medium",
      source: "",
    },
  });

  const isSaving = createDeal.isPending;

  const onSubmit = (data: DealForm) => {
    const payload = {
      title: data.title,
      value: data.value ? Number(data.value) : undefined,
      stage: data.stage,
      status: data.status || data.stage,
      notes: data.notes,
      currency: data.currency,
      contact_id: contactId || undefined,
      company_id: companyId || undefined,
      // Additional fields - these will be stored in notes for now since columns don't exist
      contact_name: data.contactName,
      company_name: data.companyName,
      phone: data.phone,
      email: data.email,
      priority: data.priority,
      source: data.source,
    };

    createDeal.mutate(payload as any, {
      onSuccess: () => {
        toast({ title: "Deal created", description: data.title });
        navigate("/crm/deals");
      },
      onError: (err: any) => {
        toast({ title: "Failed to create deal", description: err?.message || "Please try again", variant: "destructive" });
      },
    });
  };

  const saveButton = (
    <Button onClick={form.handleSubmit(onSubmit)} disabled={isSaving} className="gap-2">
      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
      {isSaving ? "Saving..." : "Save deal"}
    </Button>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Deal"
        description="Spin up a new deal with the key details and linked contacts."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate(-1)} disabled={isSaving}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            {saveButton}
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-0 shadow-card">
          <CardHeader>
            <CardTitle>Deal details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Deal title *</Label>
                <Input placeholder="New build proposal" {...form.register("title")} />
              </div>
              <div className="space-y-2">
                <Label>Contact Name</Label>
                <Input placeholder="John Smith" {...form.register("contactName")} />
              </div>
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input placeholder="Acme Inc" {...form.register("companyName")} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="john@example.com" {...form.register("email")} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input placeholder="+1 555-0123" {...form.register("phone")} />
              </div>
              <div className="space-y-2">
                <Label>Value</Label>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <Input type="number" placeholder="25000" {...form.register("value")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Stage</Label>
                <Select defaultValue="qualification" onValueChange={(v) => { form.setValue("stage", v); form.setValue("status", v); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {stageOptions.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select defaultValue="medium" onValueChange={(v) => form.setValue("priority", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Source</Label>
                <Select onValueChange={(v) => form.setValue("source", v)}>
                  <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="cold_call">Cold Call</SelectItem>
                    <SelectItem value="trade_show">Trade Show</SelectItem>
                    <SelectItem value="advertisement">Advertisement</SelectItem>
                    <SelectItem value="partner">Partner</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select defaultValue="USD" onValueChange={(v) => form.setValue("currency", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea rows={4} placeholder="Scope, risks, deliverables" {...form.register("notes")} />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle>Link people</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <EntitySearchSelect
                label="Contact"
                options={contactOptions}
                value={contactId}
                onChange={setContactId}
                placeholder="Search contacts"
                addNewLabel="Create contact"
                onAddNew={() => navigate("/crm/customers/contacts/create")}
              />
              <EntitySearchSelect
                label="Company"
                options={companyOptions}
                value={companyId}
                onChange={setCompanyId}
                placeholder="Search companies"
                addNewLabel="Create company"
                onAddNew={() => navigate("/crm/customers/companies/create")}
              />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card">
            <CardContent className="pt-6">
              {saveButton}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
