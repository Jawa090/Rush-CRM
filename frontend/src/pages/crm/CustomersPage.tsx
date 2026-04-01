import { useMemo, useState } from "react";
import { Plus, Mail, Phone, Building2, Loader2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { PageHeader } from "@/components/crm/ui/PageHeader";
import { DataToolbar } from "@/components/crm/ui/DataToolbar";
import { EntityColumn, EntityTable } from "@/components/crm/ui/EntityTable";
import { EmptyState } from "@/components/crm/ui/EmptyState";
import { useCreateCustomer, useCustomers } from "@/hooks/useCrmData";

const statusBadge = (status?: string) => {
  const normalized = (status || "").toLowerCase();
  if (normalized === "vip") return "bg-amber-500/10 text-amber-700 border-amber-200";
  if (normalized === "active") return "bg-emerald-500/10 text-emerald-700 border-emerald-200";
  if (normalized === "prospect") return "bg-sky-500/10 text-sky-700 border-sky-200";
  return "bg-slate-500/10 text-slate-700 border-slate-200";
};

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", status: "active", tier: "", industry: "" });
  const createCustomer = useCreateCustomer();
  const { toast } = useToast();

  const { data, isLoading, isError } = useCustomers(search ? { search } : undefined) as {
    data?: any;
    isLoading: boolean;
    isError: boolean;
  };

  const customers = useMemo(() => {
    const payload = data as any;
    if (!payload) return [] as any[];
    if (Array.isArray(payload)) return payload;
    return payload.data ?? [];
  }, [data]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return customers
      .filter((c: any) => {
        const matchesSearch = term
          ? (c.name || "").toLowerCase().includes(term) ||
            (c.industry || "").toLowerCase().includes(term) ||
            (c.email || "").toLowerCase().includes(term)
          : true;
        const matchesStatus = statusFilter === "all" || (c.status || c.tier || "").toLowerCase() === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a: any, b: any) => {
        if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
        if (sortBy === "revenue") return Number(b.total_revenue || 0) - Number(a.total_revenue || 0);
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });
  }, [customers, search, sortBy, statusFilter]);

  const columns: EntityColumn<any>[] = [
    {
      key: "name",
      header: "Customer",
      sortable: true,
      render: (customer) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {(customer.name || "?")
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">{customer.name || "Unnamed"}</p>
              <Badge variant="outline" className={statusBadge(customer.status || customer.tier)}>
                {customer.status || customer.tier || "Active"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {customer.industry || customer.contact_person || ""}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (c) => (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Mail className="h-3 w-3" />
          {c.email || "—"}
        </div>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (c) => (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Phone className="h-3 w-3" />
          {c.phone || "—"}
        </div>
      ),
    },
    {
      key: "deals_count",
      header: "Deals",
      align: "right",
      sortable: true,
      render: (c) => <span className="font-medium">{(c.deals_count ?? 0).toLocaleString()}</span>,
    },
    {
      key: "total_revenue",
      header: "Revenue",
      align: "right",
      sortable: true,
      render: (c) => <span className="font-semibold">{c.total_revenue ? `$${Number(c.total_revenue).toLocaleString()}` : "—"}</span>,
    },
  ];

  const handleCreate = () => {
    if (!form.name.trim()) {
      toast({ title: "Add a name", description: "Name is required to create a customer" });
      return;
    }
    createCustomer.mutate(form, {
      onSuccess: () => {
        toast({ title: "Customer added", description: form.name });
        setForm({ name: "", email: "", phone: "", status: "active", tier: "", industry: "" });
        setOpen(false);
      },
      onError: () => toast({ title: "Failed to add customer", variant: "destructive" }),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="Clean, live view of every customer with instant filters and actions."
        meta={[
          { label: "Total", value: customers.length, tone: "info" },
          { label: "Filtered", value: filtered.length, tone: "success" },
        ]}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary">
                <Plus className="mr-2 h-4 w-4" />
                New Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create customer</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Acme Corp"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="contact@acme.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label>Status</Label>
                    <Input
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      placeholder="Active / VIP"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Industry</Label>
                    <Input
                      value={form.industry}
                      onChange={(e) => setForm({ ...form, industry: e.target.value })}
                      placeholder="Construction"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={createCustomer.isPending}>
                  {createCustomer.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <DataToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search name, industry, email"
        filters={[
          {
            label: "Status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: "All statuses", value: "all" },
              { label: "Active", value: "active" },
              { label: "VIP", value: "vip" },
              { label: "Prospect", value: "prospect" },
              { label: "Inactive", value: "inactive" },
            ],
          },
        ]}
        quickFilters={[
          { label: "VIP", value: "vip", active: statusFilter === "vip", onToggle: setStatusFilter },
          { label: "Active", value: "active", active: statusFilter === "active", onToggle: setStatusFilter },
        ]}
        sortValue={sortBy}
        sortOptions={[
          { label: "Recent", value: "recent" },
          { label: "Name", value: "name" },
          { label: "Revenue", value: "revenue" },
        ]}
        onSortChange={setSortBy}
      />

      <Card className="border-0 shadow-card">
        <CardContent className="p-4 lg:p-6">
          {isError ? (
            <EmptyState title="Failed to load customers" description="Check your connection or try again." muted />
          ) : (
            <EntityTable
              data={filtered}
              columns={columns}
              isLoading={isLoading}
              pageSize={8}
              emptyState={
                <EmptyState
                  title="No customers yet"
                  description="Capture your first customer and start tracking revenue."
                  actionLabel="Add customer"
                  onAction={() => setOpen(true)}
                  icon={<Sparkles className="h-6 w-6" />}
                />
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
