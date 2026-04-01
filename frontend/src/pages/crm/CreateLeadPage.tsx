import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/crm/ui/PageHeader";
import { useCreateLead } from "@/hooks/useCrmData";
import { useToast } from "@/components/ui/use-toast";

const leadSchema = z.object({
  title: z.string().min(2, "Name is required"),
  value: z.string().optional(),
  stage: z.string().min(1, "Pick a stage"),
  status: z.string().optional(),
  source: z.string().optional(),
  notes: z.string().optional(),
  // Marketing fields
  designation: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  address: z.string().optional(),
  companyName: z.string().optional(),
  companyPhone: z.string().optional(),
  companyEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  companySize: z.string().optional(),
  agentName: z.string().optional(),
  decisionMaker: z.string().optional(),
  serviceInterested: z.string().optional(),
  interactionNotes: z.string().optional(),
  firstMessage: z.string().optional(),
});

type LeadForm = z.infer<typeof leadSchema>;

const stageOptions = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "proposal_sent", label: "Proposal Sent" },
  { value: "close_deal", label: "Close Deal" },
];

const sourceOptions = [
  { value: "website", label: "Website" },
  { value: "referral", label: "Referral" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "email", label: "Email" },
  { value: "call", label: "Cold Call" },
  { value: "event", label: "Event/Trade Show" },
  { value: "advertisement", label: "Advertisement" },
  { value: "partner", label: "Partner" },
  { value: "other", label: "Other" },
];

const companySizeOptions = [
  { value: "1-10", label: "1-10 employees" },
  { value: "11-50", label: "11-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "201-500", label: "201-500 employees" },
  { value: "501-1000", label: "501-1000 employees" },
  { value: "1000+", label: "1000+ employees" },
];

const serviceOptions = [
  { value: "cost_estimation", label: "Cost Estimation" },
  { value: "design", label: "Design Services" },
  { value: "construction", label: "Construction" },
  { value: "project_management", label: "Project Management" },
  { value: "consulting", label: "Consulting" },
  { value: "other", label: "Other Services" },
];

export default function CreateLeadPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createLead = useCreateLead();

  const form = useForm<LeadForm>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      title: "",
      value: "",
      stage: "new",
      status: "new",
      source: "website",
      notes: "",
      designation: "",
      phone: "",
      email: "",
      website: "",
      address: "",
      companyName: "",
      companyPhone: "",
      companyEmail: "",
      companySize: "",
      agentName: "",
      decisionMaker: "",
      serviceInterested: "",
      interactionNotes: "",
      firstMessage: "",
    },
  });

  const isSaving = createLead.isPending;

  const onSubmit = (data: LeadForm) => {
    const payload = {
      title: data.title,
      value: data.value ? Number(data.value) : undefined,
      stage: data.stage,
      status: data.status || data.stage,
      source: data.source,
      notes: data.notes,
      // Marketing fields
      designation: data.designation,
      phone: data.phone,
      email: data.email,
      website: data.website,
      address: data.address,
      company_name: data.companyName,
      company_phone: data.companyPhone,
      company_email: data.companyEmail,
      company_size: data.companySize,
      agent_name: data.agentName,
      decision_maker: data.decisionMaker,
      service_interested: data.serviceInterested,
      interaction_notes: data.interactionNotes,
      first_message: data.firstMessage,
      last_touch: new Date().toISOString(), // Set current time as last touch
    } as Record<string, unknown>;

    createLead.mutate(payload, {
      onSuccess: () => {
        toast({ title: "Lead created", description: data.title });
        navigate("/crm/leads");
      },
      onError: (err: any) => {
        toast({ title: "Failed to create lead", description: err?.message || "Please try again", variant: "destructive" });
      },
    });
  };

  const saveButton = (
    <Button onClick={form.handleSubmit(onSubmit)} disabled={isSaving} className="gap-2">
      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
      {isSaving ? "Saving..." : "Save lead"}
    </Button>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Lead"
        description="Capture a comprehensive lead with all marketing details and contact information."
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
            <CardTitle>Lead details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Contact Information
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input placeholder="John Smith" {...form.register("title")} />
                </div>
                <div className="space-y-2">
                  <Label>Job Title / Designation</Label>
                  <Input placeholder="Marketing Manager" {...form.register("designation")} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="john@example.com" {...form.register("email")} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input placeholder="+1 555-0123" {...form.register("phone")} />
                </div>
              </div>
            </div>

            {/* Company Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Company Information
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input placeholder="Acme Inc" {...form.register("companyName")} />
                </div>
                <div className="space-y-2">
                  <Label>Company Size</Label>
                  <Select onValueChange={(v) => form.setValue("companySize", v)}>
                    <SelectTrigger><SelectValue placeholder="Select company size" /></SelectTrigger>
                    <SelectContent>
                      {companySizeOptions.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Company Phone</Label>
                  <Input placeholder="+1 555-0123" {...form.register("companyPhone")} />
                </div>
                <div className="space-y-2">
                  <Label>Company Email</Label>
                  <Input type="email" placeholder="info@company.com" {...form.register("companyEmail")} />
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input placeholder="https://example.com" {...form.register("website")} />
                </div>
                <div className="space-y-2">
                  <Label>Business Address</Label>
                  <Input placeholder="123 Main St, City, State" {...form.register("address")} />
                </div>
              </div>
            </div>

            {/* Lead Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Lead Details
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Estimated Value</Label>
                  <Input type="number" placeholder="5000" {...form.register("value")} />
                </div>
                <div className="space-y-2">
                  <Label>Stage</Label>
                  <Select defaultValue="new" onValueChange={(v) => { form.setValue("stage", v); form.setValue("status", v); }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {stageOptions.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Source</Label>
                  <Select defaultValue="website" onValueChange={(v) => form.setValue("source", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {sourceOptions.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Service Interested</Label>
                  <Select onValueChange={(v) => form.setValue("serviceInterested", v)}>
                    <SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger>
                    <SelectContent>
                      {serviceOptions.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Decision Maker</Label>
                  <Input placeholder="CEO, Manager, etc." {...form.register("decisionMaker")} />
                </div>
                <div className="space-y-2">
                  <Label>Assigned Agent</Label>
                  <Input placeholder="Sales Agent Name" {...form.register("agentName")} />
                </div>
              </div>
            </div>

            {/* Messages & Notes */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Messages & Notes
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>First Message</Label>
                  <Textarea rows={3} placeholder="Initial message or inquiry from the lead..." {...form.register("firstMessage")} />
                </div>
                <div className="space-y-2">
                  <Label>Interaction Notes</Label>
                  <Textarea rows={3} placeholder="Notes about interactions with this lead..." {...form.register("interactionNotes")} />
                </div>
                <div className="space-y-2">
                  <Label>Additional Notes</Label>
                  <Textarea rows={4} placeholder="Add context, next steps, or qualification info" {...form.register("notes")} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
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
