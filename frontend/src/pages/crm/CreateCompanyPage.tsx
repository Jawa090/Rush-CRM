import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Building2, Mail, Phone, Globe, Users, Save, Sparkles, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { PageHeader } from "@/components/crm/ui/PageHeader";
import { EmptyState } from "@/components/crm/ui/EmptyState";
import { useCreateCompany } from "@/hooks/useCrmData";
import { useToast } from "@/components/ui/use-toast";

const companySchema = z.object({
  name: z.string().min(2, "Company name is required"),
  company_type: z.string().min(1),
  industry: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  address: z.string().optional(),
  annual_revenue: z.string().optional(),
  revenue_currency: z.string().min(1),
  employee_count: z.string().optional(),
  comment: z.string().optional(),
  available_to_everyone: z.boolean().default(true),
});

type CompanyForm = z.infer<typeof companySchema>;

const companyTypes = [
  { value: "client", label: "Client" },
  { value: "supplier", label: "Supplier" },
  { value: "partner", label: "Partner" },
  { value: "prospect", label: "Prospect" },
];

const industryOptions = [
  "Information Technology",
  "Finance",
  "Healthcare",
  "Manufacturing",
  "Retail",
  "Construction",
  "Education",
];

export default function CreateCompanyPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createCompany = useCreateCompany();

  const form = useForm<CompanyForm>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      company_type: "client",
      industry: "",
      phone: "",
      email: "",
      website: "",
      address: "",
      annual_revenue: "",
      revenue_currency: "usd",
      employee_count: "",
      comment: "",
      available_to_everyone: true,
    },
  });

  const isSaving = createCompany.isPending;

  const onSubmit = (data: CompanyForm) => {
    const payload = {
      name: data.name,
      company_type: data.company_type,
      industry: data.industry,
      phone: data.phone,
      email: data.email || undefined,
      website: data.website || undefined,
      address: data.address,
      annual_revenue: data.annual_revenue ? Number(data.annual_revenue) : undefined,
      revenue_currency: data.revenue_currency,
      employee_count: data.employee_count,
      comment: data.comment,
      available_to_everyone: data.available_to_everyone,
    } as Record<string, unknown>;

    createCompany.mutate(payload, {
      onSuccess: () => {
        toast({ title: "Company created", description: data.name });
        navigate("/crm/customers/companies");
      },
      onError: (err: any) => {
        toast({ title: "Failed to create company", description: err?.message || "Please try again", variant: "destructive" });
      },
    });
  };

  const saveButton = (
    <Button onClick={form.handleSubmit(onSubmit)} disabled={isSaving} className="gap-2">
      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
      {isSaving ? "Saving..." : "Save company"}
    </Button>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Company"
        description="Add an account with validated details and consistent UX."
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
            <CardTitle>Company profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Company name *</Label>
                <Input placeholder="Acme Corp" {...form.register("name")}/>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select defaultValue="client" onValueChange={(v) => form.setValue("company_type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {companyTypes.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Industry</Label>
                <Select onValueChange={(v) => form.setValue("industry", v)}>
                  <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                  <SelectContent>
                    {industryOptions.map((ind) => <SelectItem key={ind} value={ind.toLowerCase()}>{ind}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Annual revenue</Label>
                <div className="flex items-center gap-2">
                  <Input type="number" placeholder="500000" {...form.register("annual_revenue")}/>
                  <Select defaultValue="usd" onValueChange={(v) => form.setValue("revenue_currency", v)}>
                    <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">USD</SelectItem>
                      <SelectItem value="eur">EUR</SelectItem>
                      <SelectItem value="gbp">GBP</SelectItem>
                      <SelectItem value="pkr">PKR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input type="email" placeholder="info@acme.com" {...form.register("email")}/>
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
                <Label>Website</Label>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <Input placeholder="https://acme.com" {...form.register("website")}/>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Employees</Label>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <Input placeholder="e.g., 120" {...form.register("employee_count")}/>
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Address</Label>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Street, City, Country" {...form.register("address")}/>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Comment</Label>
              <Textarea rows={4} placeholder="Context, relationship history, delivery notes" {...form.register("comment")}/>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle>Sharing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="flex items-start gap-3 text-sm">
                <Checkbox
                  checked={form.watch("available_to_everyone")}
                  onCheckedChange={(v) => form.setValue("available_to_everyone", !!v)}
                />
                <div>
                  <div className="font-medium">Visible to team</div>
                  <p className="text-muted-foreground text-sm">Allow teammates to access this account.</p>
                </div>
              </label>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card">
            <CardContent className="p-6">
              <EmptyState
                title="Tip: keep it real"
                description="Use real values (email/phone/revenue) to improve reporting accuracy."
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
