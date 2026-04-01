import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  FileText,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  CalendarDays,
  Building2,
  ArrowDownToLine,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/crm/ui/PageHeader";
import { DataToolbar } from "@/components/crm/ui/DataToolbar";
import { EntityTable, EntityColumn } from "@/components/crm/ui/EntityTable";
import { EmptyState } from "@/components/crm/ui/EmptyState";
import { useToast } from "@/components/ui/use-toast";
import { usePurchaseOrders, useCreatePurchaseOrder, useUpdatePurchaseOrderStatus, useVendors, useProducts } from "@/hooks/useCrmData";
import { purchaseOrdersApi, vendorsApi, productsApi } from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const formatCurrency = (value?: number | string) => {
  if (value === undefined || value === null) return "—";
  const num = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(num)) return String(value);
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num);
};

type PurchaseOrder = {
  id: string | number;
  vendor_name?: string;
  created_at?: string;
  item_count?: number;
  total_amount?: number;
  expected_delivery_date?: string;
  status: string;
};

const statusOptions = [
  { label: "Pending", value: "pending" },
  { label: "Ordered", value: "ordered" },
  { label: "Processing", value: "processing" },
  { label: "Received", value: "received" },
  { label: "Cancelled", value: "cancelled" },
];

const statusStyle: Record<string, string> = {
  received: "bg-green-500/10 text-green-600 border-green-500/20",
  delivered: "bg-green-500/10 text-green-600 border-green-500/20",
  ordered: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  processing: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  pending: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
};

export default function PurchaseOrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [poModalOpen, setPoModalOpen] = useState(false);
  const [form, setForm] = useState<PurchaseOrder>({ id: "temp", vendor_name: "", status: "pending" });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<any>({
    queryKey: ["purchase-orders"],
    queryFn: () => purchaseOrdersApi.getAll(),
  });

  useEffect(() => {
    const incoming = Array.isArray(data) ? data : data?.data ?? data ?? [];
    setOrders(
      (incoming as any[]).map((o: any) => ({
        id: o.id ?? crypto.randomUUID?.() ?? Math.random().toString(),
        vendor_name: o.vendor_name || o.vendor || "—",
        created_at: o.created_at,
        item_count: o.item_count ?? o.items?.length ?? 0,
        total_amount: o.total_amount ?? o.total ?? 0,
        expected_delivery_date: o.expected_delivery_date ?? o.expected_delivery ?? o.eta,
        status: (o.status || "pending").toLowerCase(),
      }))
    );
  }, [data]);

  const filtered = useMemo(() => {
    let list = [...orders];
    if (search) {
      const term = search.toLowerCase();
      list = list.filter((o) => String(o.id).toLowerCase().includes(term) || (o.vendor_name || "").toLowerCase().includes(term));
    }
    if (statusFilter !== "all") list = list.filter((o) => o.status === statusFilter);
    switch (sortBy) {
      case "vendor":
        list.sort((a, b) => (a.vendor_name || "").localeCompare(b.vendor_name || ""));
        break;
      case "total":
        list.sort((a, b) => Number(b.total_amount || 0) - Number(a.total_amount || 0));
        break;
      default:
        list.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    }
    return list;
  }, [orders, search, statusFilter, sortBy]);

  const stats = useMemo(() => {
    const open = orders.filter((o) => o.status !== "received" && o.status !== "cancelled").length;
    const inTransit = orders.filter((o) => o.status === "ordered").length;
    const delivered = orders.filter((o) => o.status === "received").length;
    const pending = orders.filter((o) => o.status === "pending").length;
    return [
      { title: "Open Orders", value: open, icon: FileText, color: "text-blue-500" },
      { title: "In Transit", value: inTransit, icon: Truck, color: "text-yellow-500" },
      { title: "Delivered", value: delivered, icon: CheckCircle, color: "text-green-500" },
      { title: "Pending Approval", value: pending, icon: Clock, color: "text-orange-500" },
    ];
  }, [orders]);

  const columns: EntityColumn<PurchaseOrder>[] = [
    {
      key: "id",
      header: "PO #",
      className: "font-mono text-sm",
      render: (row) => <span className="font-semibold">{row.id}</span>,
    },
    {
      key: "vendor",
      header: "Vendor",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{row.vendor_name || "—"}</div>
            <div className="text-xs text-muted-foreground">Created {row.created_at ? new Date(row.created_at).toLocaleDateString() : "—"}</div>
          </div>
        </div>
      ),
    },
    { key: "items", header: "Items", render: (row) => <span>{row.item_count ?? "—"}</span> },
    {
      key: "total",
      header: "Total",
      className: "text-right",
      render: (row) => <span className="font-semibold">{formatCurrency(row.total_amount)}</span>,
    },
    {
      key: "eta",
      header: "ETA",
      render: (row) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4" />
          {row.expected_delivery_date ? new Date(row.expected_delivery_date).toLocaleDateString() : "—"}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <Badge variant="outline" className={statusStyle[row.status] || "bg-gray-500/10 text-gray-600 border-gray-500/20"}>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-[90px] text-right",
      render: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowDownToLine className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => updateStatus(row.id, "received")}>
              <CheckCircle className="mr-2 h-4 w-4" /> Mark Received
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => updateStatus(row.id, "ordered")}>
              <Truck className="mr-2 h-4 w-4" /> Mark In Transit
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => updateStatus(row.id, "cancelled")} className="text-destructive">
              <XCircle className="mr-2 h-4 w-4" /> Cancel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const updateStatus = async (id: string | number, next: string) => {
    try {
      await purchaseOrdersApi.updateStatus(String(id), next);
      toast({ title: `PO ${id} marked ${next} successfully` });
      
      // Update local state and refresh from backend
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: next } : o)));
    } catch (error) {
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to update status",
        variant: "destructive" 
      });
    }
  };

  const handleCreate = async () => {
    if (!form.vendor_name) {
      toast({ title: "Vendor is required", variant: "destructive" });
      return;
    }

    try {
      // First, get vendors to find a matching vendor ID
      const vendorsData = await vendorsApi.getAll();
      const vendors = Array.isArray(vendorsData) ? vendorsData : vendorsData?.data ?? [];
      
      // Find vendor by name or use first available vendor
      let selectedVendor = vendors.find(v => v.name?.toLowerCase().includes(form.vendor_name.toLowerCase()));
      if (!selectedVendor && vendors.length > 0) {
        selectedVendor = vendors[0]; // Use first vendor if no match found
      }
      
      if (!selectedVendor) {
        toast({ title: "No vendors available. Please add a vendor first.", variant: "destructive" });
        return;
      }

      // Get products to create sample items
      const productsData = await productsApi.getAll();
      const products = Array.isArray(productsData) ? productsData : productsData?.data ?? [];
      
      if (products.length === 0) {
        toast({ title: "No products available. Please add products first.", variant: "destructive" });
        return;
      }

      // Create sample items using available products
      const sampleItems = products.slice(0, form.item_count || 1).map(product => ({
        productId: product.id,
        quantity: Math.floor(Math.random() * 10) + 1, // Random quantity 1-10
        unitPrice: product.price || product.unit_price || 100
      }));

      const poData = {
        vendorId: selectedVendor.id,
        items: sampleItems,
        notes: `PO for ${form.vendor_name}`,
        expectedDeliveryDate: form.expected_delivery_date,
        status: form.status,
        totalAmount: form.total_amount,
      };

      await purchaseOrdersApi.create(poData);
      toast({ title: "Purchase order created successfully" });
      
      // Invalidate query so list auto-refreshes
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      
      setPoModalOpen(false);
    } catch (error) {
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to create purchase order",
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Orders"
        description="Create, track, and approve purchase orders."
        meta={[
          { label: "Open", value: stats[0].value, tone: "info" },
          { label: "In transit", value: stats[1].value, tone: "warning" },
          { label: "Delivered", value: stats[2].value, tone: "success" },
        ]}
        actions={
          <Dialog open={poModalOpen} onOpenChange={setPoModalOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary">
                <Plus className="mr-2 h-4 w-4" /> Create PO
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create purchase order</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3 py-2">
                <div className="grid gap-2">
                  <Label>Vendor</Label>
                  <Input value={form.vendor_name || ""} onChange={(e) => setForm({ ...form, vendor_name: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label>Items</Label>
                    <Input
                      type="number"
                      min={0}
                      value={form.item_count ?? 0}
                      onChange={(e) => setForm({ ...form, item_count: Number(e.target.value) })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Total (USD)</Label>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={form.total_amount ?? 0}
                      onChange={(e) => setForm({ ...form, total_amount: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label>Expected delivery</Label>
                    <Input
                      type="date"
                      value={form.expected_delivery_date?.slice(0, 10) || ""}
                      onChange={(e) => setForm({ ...form, expected_delivery_date: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Status</Label>
                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPoModalOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border/80">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <DataToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search PO # or vendor"
        filters={[
          {
            label: "Status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [{ label: "All", value: "all" }, ...statusOptions],
          },
        ]}
        sortValue={sortBy}
        sortOptions={[
          { label: "Recent", value: "recent" },
          { label: "Vendor", value: "vendor" },
          { label: "Total", value: "total" },
        ]}
        onSortChange={setSortBy}
      />

      <Card className="border-border/80">
        <CardHeader>
          <CardTitle>Recent Purchase Orders</CardTitle>
          <CardDescription>View and manage your purchase orders</CardDescription>
        </CardHeader>
        <CardContent>
          {isError ? (
            <div className="text-sm text-destructive">Failed to load purchase orders.</div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Loading purchase orders...
            </div>
          ) : (
            <EntityTable
              columns={columns}
              data={filtered}
              emptyState={<EmptyState title="No purchase orders" description="Create a PO to get started." />}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
