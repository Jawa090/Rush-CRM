import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/crm/ui/PageHeader";
import { DataToolbar } from "@/components/crm/ui/DataToolbar";
import { EmptyState } from "@/components/crm/ui/EmptyState";
import { useToast } from "@/components/ui/use-toast";
import { vendorsApi } from "@/lib/api";
import { Plus, Mail, Phone, Star, MoreVertical, Loader2, Building2, Globe2 } from "lucide-react";

type Vendor = {
  id: string | number;
  name?: string;
  status?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  rating?: number;
  orders?: number;
  website?: string;
  business_type?: string;
  address?: string;
};

const statusOptions = [
  { label: "All", value: "all" },
  { label: "Preferred", value: "preferred" },
  { label: "Active", value: "active" },
  { label: "New", value: "new" },
];

const statusColor = (status?: string) => {
  switch ((status || "").toLowerCase()) {
    case "preferred":
      return "bg-green-500/10 text-green-600 border-green-500/20";
    case "active":
      return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    case "new":
      return "bg-purple-500/10 text-purple-600 border-purple-500/20";
    default:
      return "bg-gray-500/10 text-gray-600 border-gray-500/20";
  }
};

export default function VendorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [vendorModalOpen, setVendorModalOpen] = useState(false);
  const [form, setForm] = useState<Vendor>({ id: "temp", status: "active" });
  const [localVendors, setLocalVendors] = useState<Vendor[]>([]);

  const { toast } = useToast();

  const { data, isLoading, isError } = useQuery<any>({
    queryKey: ["vendors", searchQuery],
    queryFn: async () => {
      const response = await vendorsApi.getAll(searchQuery ? { search: searchQuery } : undefined);
      // Handle different response structures
      if (Array.isArray(response)) {
        return response;
      }
      if (response && typeof response === 'object' && 'data' in response) {
        return response.data;
      }
      return response || [];
    },
  });

  useEffect(() => {
    // Handle different response structures from API
    let vendorsArray: Vendor[] = [];
    
    if (Array.isArray(data)) {
      vendorsArray = data;
    } else if (data && typeof data === 'object' && 'data' in data) {
      vendorsArray = data.data || [];
    } else if (data) {
      vendorsArray = [data];
    }
    
    setLocalVendors(vendorsArray);
  }, [data]);

  const vendors = localVendors;

  const filtered = useMemo(() => {
    return vendors.filter((v) => {
      const matchStatus = statusFilter === "all" || (v.status || "").toLowerCase() === statusFilter;
      const term = searchQuery.toLowerCase();
      const matchSearch =
        !term ||
        (v.name || "").toLowerCase().includes(term) ||
        (v.contact_person || "").toLowerCase().includes(term) ||
        (v.email || "").toLowerCase().includes(term);
      return matchStatus && matchSearch;
    });
  }, [vendors, searchQuery, statusFilter]);

  const renderStars = (rating?: number | null) => {
    const value = Number(rating ?? 0);
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= value ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
          />
        ))}
        <span className="ml-1 text-sm text-muted-foreground">{value ? value.toFixed(1) : "—"}</span>
      </div>
    );
  };

  const openNew = () => {
    setForm({ id: `V-${Date.now()}`, status: "active", rating: 4 });
    setVendorModalOpen(true);
  };

  const openEdit = (vendor: Vendor) => {
    setForm({ ...vendor });
    setVendorModalOpen(true);
  };

  const handleDelete = async (id: string | number) => {
    try {
      await vendorsApi.delete(String(id));
      toast({ title: "Vendor deleted successfully" });
      
      // Refresh data from backend
      const { data: updatedVendors } = await vendorsApi.getAll();
      setLocalVendors(Array.isArray(updatedVendors) ? updatedVendors : updatedVendors?.data ?? []);
    } catch (error) {
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to delete vendor",
        variant: "destructive" 
      });
    }
  };

  const handleSave = async () => {
    if (!form.name) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }

    try {
      const vendorData = {
        name: form.name,
        contactPerson: form.contact_person,
        email: form.email,
        phone: form.phone,
        address: form.address,
        businessType: form.business_type,
        website: form.website,
        status: form.status,
        rating: form.rating,
      };

      const isEditing = localVendors.find(v => v.id === form.id);
      
      if (isEditing) {
        await vendorsApi.update(String(form.id), vendorData);
        toast({ title: "Vendor updated successfully" });
      } else {
        await vendorsApi.create(vendorData);
        toast({ title: "Vendor added successfully" });
      }

      // Refresh data from backend
      const { data: updatedVendors } = await vendorsApi.getAll();
      setLocalVendors(Array.isArray(updatedVendors) ? updatedVendors : updatedVendors?.data ?? []);
      setVendorModalOpen(false);
    } catch (error) {
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to save vendor",
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendors"
        description="Manage your supplier relationships"
        meta={[
          { label: "Vendors", value: vendors.length, tone: "info" },
          { label: "Preferred", value: vendors.filter((v) => (v.status || "").toLowerCase() === "preferred").length, tone: "success" },
        ]}
        actions={
          <Dialog open={vendorModalOpen} onOpenChange={setVendorModalOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary" onClick={openNew}>
                <Plus className="mr-2 h-4 w-4" /> Add Vendor
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Vendor</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <Label>Vendor Name *</Label>
                  <Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter vendor name" />
                </div>
                
                <div className="grid gap-2">
                  <Label>Business Type (Kia Kam Karta Ha)</Label>
                  <Input value={form.business_type || ""} onChange={(e) => setForm({ ...form, business_type: e.target.value })} placeholder="e.g., Electronics Supplier, Raw Materials, etc." />
                </div>

                <div className="grid gap-2">
                  <Label>Contact Person</Label>
                  <Input value={form.contact_person || ""} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} placeholder="Contact person name" />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label>Email</Label>
                    <Input type="email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="vendor@example.com" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Phone</Label>
                    <Input value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+92 300 1234567" />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Address</Label>
                  <Input value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Complete address with city" />
                </div>

                <div className="grid gap-2">
                  <Label>Website</Label>
                  <Input value={form.website || ""} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://vendor-website.com" />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label>Status</Label>
                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="preferred">Preferred</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Rating (1-5)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      step={0.1}
                      value={form.rating ?? 4}
                      onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                      placeholder="4.0"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setVendorModalOpen(false)}>Cancel</Button>
                <Button onClick={handleSave}>Save Vendor</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Vendor Directory</CardTitle>
          <CardDescription>Search, filter, and manage suppliers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <DataToolbar
            search={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search vendors"
            filters={[
              { label: "Status", value: statusFilter, onChange: setStatusFilter, options: statusOptions },
            ]}
          />

          {isError ? (
            <div className="text-sm text-destructive">Failed to load vendors.</div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Loading vendors...
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState title="No vendors" description="Adjust filters or add a vendor." />
          ) : (
            <div className="space-y-4">
              {filtered.map((vendor) => (
                <div
                  key={vendor.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {(vendor.name || "?")
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold flex items-center gap-1">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          {vendor.name || "Unnamed vendor"}
                        </h3>
                        <Badge variant="outline" className={statusColor(vendor.status)}>
                          {vendor.status || "Active"}
                        </Badge>
                      </div>
                      {vendor.business_type && (
                        <p className="text-sm font-medium text-muted-foreground mt-0.5">{vendor.business_type}</p>
                      )}
                      <p className="text-sm text-muted-foreground">{vendor.contact_person || (vendor as any).contactPerson || ""}</p>
                      <div className="flex items-center flex-wrap gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {vendor.email || "—"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {vendor.phone || "—"}
                        </span>
                        {vendor.website && (
                          <span className="flex items-center gap-1">
                            <Globe2 className="h-3 w-3" />
                            {vendor.website}
                          </span>
                        )}
                      </div>
                      {vendor.address && (
                        <p className="text-xs text-muted-foreground mt-1">📍 {vendor.address}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {(vendor.orders ?? (vendor as any).order_count ?? 0).toLocaleString()} orders
                      </p>
                      {renderStars(vendor.rating)}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => openEdit(vendor)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onSelect={() => handleDelete(vendor.id)}>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
