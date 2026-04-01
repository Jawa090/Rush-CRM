import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Mail, Phone, Building2, Save, Sparkles, MapPin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { PageHeader } from "@/components/crm/ui/PageHeader";
import { EmptyState } from "@/components/crm/ui/EmptyState";
import { useCreateContact } from "@/hooks/useCrmData";
import { useToast } from "@/components/ui/use-toast";

const contactSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().optional(),
  title: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  company_name: z.string().optional(),
  source: z.string().min(1, "Pick a source"),
  contact_type: z.string().min(1),
  address: z.string().optional(),
  messenger: z.string().optional(),
  notes: z.string().optional(),
  available_to_everyone: z.boolean().default(true),
  included_in_export: z.boolean().default(true),
});

const sourceOptions = [
  { value: "web", label: "Web" },
  { value: "referral", label: "Referral" },
  { value: "email", label: "Email" },
  { value: "call", label: "Call" },
  { value: "event", label: "Event" },
];

const typeOptions = [
  { value: "client", label: "Client" },
  { value: "partner", label: "Partner" },
  { value: "vendor", label: "Vendor" },
  { value: "prospect", label: "Prospect" },
];

type ContactForm = z.infer<typeof contactSchema>;

export default function CreateContactPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createContact = useCreateContact();

  const form = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      title: "",
      email: "",
      phone: "",
      company_name: "",
      source: "web",
      contact_type: "client",
      address: "",
      messenger: "",
      notes: "",
      available_to_everyone: true,
      included_in_export: true,
    },
  });

  const isSaving = createContact.isPending;

  const onSubmit = (data: ContactForm) => {
    const payload = {
      first_name: data.first_name,
      last_name: data.last_name,
      title: data.title,
      email: data.email || undefined,
      phone: data.phone || undefined,
      company_name: data.company_name,
      source: data.source,
      contact_type: data.contact_type,
      address: data.address,
      messenger: data.messenger,
      notes: data.notes,
      available_to_everyone: data.available_to_everyone,
      included_in_export: data.included_in_export,
    } as Record<string, unknown>;

    createContact.mutate(payload, {
      onSuccess: () => {
        toast({ title: "Contact created", description: `${data.first_name} ${data.last_name || ""}`.trim() });
        navigate("/crm/customers/contacts");
      },
      onError: (err: any) => {
        toast({ title: "Failed to create contact", description: err?.message || "Please try again", variant: "destructive" });
      },
    });
  };

  const saveButton = (
    <Button onClick={form.handleSubmit(onSubmit)} disabled={isSaving} className="gap-2">
      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
      {isSaving ? "Saving..." : "Save contact"}
    </Button>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Contact"
        description="Add a new contact with clean, validated inputs."
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
            <CardTitle>Contact details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>First name *</Label>
                <Input placeholder="Amir" {...form.register("first_name")}/>
              </div>
              <div className="space-y-2">
                <Label>Last name</Label>
                <Input placeholder="Khan" {...form.register("last_name")}/>
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input placeholder="Head of Procurement" {...form.register("title")}/>
              </div>
              <div className="space-y-2">
                <Label>Company</Label>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Acme Corp" {...form.register("company_name")}/>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input type="email" placeholder="name@company.com" {...form.register("email")}/>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <Input placeholder="(555) 123-4567" {...form.register("phone")}/>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Source</Label>
                <Select defaultValue="web" onValueChange={(v) => form.setValue("source", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {sourceOptions.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select defaultValue="client" onValueChange={(v) => form.setValue("contact_type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Address</Label>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Street, City, Country" {...form.register("address")}/>
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Messenger / handle</Label>
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                  <Input placeholder="@username (WhatsApp / Telegram / etc.)" {...form.register("messenger")}/>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea rows={4} placeholder="Context, next steps, preferences" {...form.register("notes")}/>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="flex items-start gap-3 text-sm">
                <Checkbox
                  checked={form.watch("available_to_everyone")}
                  onCheckedChange={(v) => form.setValue("available_to_everyone", !!v)}
                />
                <div>
                  <div className="font-medium">Share with team</div>
                  <p className="text-muted-foreground text-sm">Visible to everyone.</p>
                </div>
              </label>
              <label className="flex items-start gap-3 text-sm">
                <Checkbox
                  checked={form.watch("included_in_export")}
                  onCheckedChange={(v) => form.setValue("included_in_export", !!v)}
                />
                <div>
                  <div className="font-medium">Include in exports</div>
                  <p className="text-muted-foreground text-sm">Show in CSV/Excel exports.</p>
                </div>
              </label>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card">
            <CardContent className="p-6">
              <EmptyState
                title="Tip: stay concise"
                description="Capture essentials now; you can enrich the profile after creation."
                icon={<Sparkles className="h-5 w-5" />}
                muted
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
