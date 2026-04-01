import { useEffect, useMemo, useState } from "react";
import { Plus, Package, Tag, Search, MoreHorizontal, Pencil, Trash2, Scale, AlertTriangle, TrendingDown, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useWarehouses, useAdjustStock } from "@/hooks/useCrmData";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  in_stock:     "bg-emerald-50 text-emerald-700 border-emerald-200",
  low_stock:    "bg-yellow-50 text-yellow-700 border-yellow-200",
  out_of_stock: "bg-red-50 text-red-700 border-red-200",
};
const STATUS_LABELS: Record<string, string> = {
  in_stock: "In Stock", low_stock: "Low Stock", out_of_stock: "Out of Stock",
};
const STATUS_ICONS: Record<string, React.ElementType> = {
  in_stock: CheckCircle2, low_stock: AlertTriangle, out_of_stock: TrendingDown,
};

const CATEGORIES = ["Uncategorized","Hardware","Software","Electronics","Office Supplies"];

function deriveStatus(stock: number, min = 5) {
  if (stock <= 0) return "out_of_stock";
  if (stock <= min) return "low_stock";
  return "in_stock";
}

type ProductRow = { id: string; name: string; sku: string; category: string; price: number; stock: number; minStock: number; status: string; };
const BLANK: ProductRow = { id: "temp", name: "", sku: "", category: "Uncategorized", price: 0, stock: 0, minStock: 5, status: "in_stock" };

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [adjusting, setAdjusting] = useState<ProductRow | null>(null);
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState<ProductRow>(BLANK);
  const { toast } = useToast();

  const { data: productsData, isLoading, refetch } = useProducts({ search: search || undefined, category: catFilter !== "all" ? catFilter : undefined });
  const { data: warehousesData } = useWarehouses();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const adjustStock = useAdjustStock();

  useEffect(() => {
    const list = Array.isArray(productsData) ? productsData : (productsData as any) || [];
    setRows(list.map((p: any) => {
      const stock = Number(p.total_stock ?? p.stock_quantity ?? p.stock ?? 0);
      return { id: String(p.id), name: p.name ?? "Untitled", sku: p.sku ?? "—", category: p.category ?? "Uncategorized", price: Number(p.unit_price ?? p.price ?? 0), stock, minStock: p.min_stock ?? 5, status: p.status ?? deriveStatus(stock, p.min_stock) };
    }));
  }, [productsData]);

  const filtered = useMemo(() => {
    let list = [...rows];
    if (search) { const t = search.toLowerCase(); list = list.filter((p) => p.name.toLowerCase().includes(t) || p.sku.toLowerCase().includes(t)); }
    if (catFilter !== "all") list = list.filter((p) => p.category === catFilter);
    if (statusFilter !== "all") list = list.filter((p) => p.status === statusFilter);
    return list;
  }, [rows, search, catFilter, statusFilter]);

  const stats = useMemo(() => ({
    total: rows.length,
    inStock: rows.filter((p) => p.status === "in_stock").length,
    lowStock: rows.filter((p) => p.status === "low_stock").length,
    outOfStock: rows.filter((p) => p.status === "out_of_stock").length,
  }), [rows]);

  const openAdd = () => { setForm({ ...BLANK, id: `temp-${Date.now()}` }); setEditing(null); setDialog(true); };
  const openEdit = (row: ProductRow) => { setForm({ ...row }); setEditing(row); setDialog(true); };

  const handleSave = async () => {
    if (!form.name.trim()) { toast({ title: "Name required", variant: "destructive" }); return; }
    try {
      const data = { name: form.name, sku: form.sku, category: form.category, price: form.price, min_stock_level: form.minStock, status: "active" };
      if (editing) await updateProduct.mutateAsync({ id: form.id, ...data });
      else await createProduct.mutateAsync(data);
      refetch(); setDialog(false); setEditing(null);
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
  };

  const handleDelete = async (id: string) => {
    try { await deleteProduct.mutateAsync(id); }
    catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
  };

  const handleAdjust = async () => {
    const warehouses = (warehousesData as any[]) || [];
    if (!warehouses.length) { toast({ title: "No warehouses available", variant: "destructive" }); return; }
    try {
      await adjustStock.mutateAsync({ productId: form.id, warehouseId: String(warehouses[0].id), quantity: form.stock, reason: "Manual adjustment" });
      setAdjusting(null); refetch();
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Products</h1>
          <p className="text-sm text-muted-foreground">Manage inventory, pricing, and stock levels</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={openAdd}>
          <Plus className="h-3.5 w-3.5" /> Add Product
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Products", value: stats.total,      color: "bg-blue-500",    icon: Package },
          { label: "In Stock",       value: stats.inStock,    color: "bg-emerald-500", icon: CheckCircle2 },
          { label: "Low Stock",      value: stats.lowStock,   color: "bg-yellow-500",  icon: AlertTriangle },
          { label: "Out of Stock",   value: stats.outOfStock, color: "bg-red-500",     icon: TrendingDown },
        ].map((s) => (
          <button key={s.label} onClick={() => setStatusFilter(s.label === "Total Products" ? "all" : s.label.toLowerCase().replace(" ", "_"))}
            className="rounded-xl border border-border/50 bg-card p-4 text-left hover:shadow-sm hover:border-primary/20 transition-all">
            <div className={cn("p-1.5 rounded-lg w-fit mb-2", s.color)}><s.icon className="h-3.5 w-3.5 text-white" /></div>
            <p className="text-2xl font-bold tabular-nums">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input className="pl-8 h-8 text-sm" placeholder="Search name or SKU..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="h-8 w-36 text-sm"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 w-32 text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="in_stock">In Stock</SelectItem>
            <SelectItem value="low_stock">Low Stock</SelectItem>
            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border/40">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Products ({filtered.length})</span>
        </div>
        <div className="flex items-center gap-3 px-5 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider border-b border-border/30 bg-muted/20">
          <span className="flex-1">Product</span>
          <span className="w-28 hidden sm:block">Category</span>
          <span className="w-20 text-right hidden md:block">Price</span>
          <span className="w-32 hidden lg:block">Stock Level</span>
          <span className="w-24 text-center">Status</span>
          <span className="w-16" />
        </div>
        <div className="divide-y divide-border/40">
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3 animate-pulse">
                <div className="h-8 w-8 rounded-lg bg-muted" /><div className="flex-1 h-4 bg-muted rounded" />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <Package className="h-10 w-10 text-muted-foreground/20" />
              <p className="text-sm text-muted-foreground">No products found</p>
              <Button size="sm" variant="outline" onClick={openAdd} className="gap-1.5 mt-1"><Plus className="h-3.5 w-3.5" />Add Product</Button>
            </div>
          ) : filtered.map((p) => {
            const Icon = STATUS_ICONS[p.status] ?? CheckCircle2;
            const stockPct = p.minStock > 0 ? Math.min(100, Math.round((p.stock / (p.minStock * 4)) * 100)) : p.stock > 0 ? 100 : 0;
            return (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors group">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1"><Tag className="h-2.5 w-2.5" />{p.sku}</p>
                  </div>
                </div>
                <span className="w-28 text-xs text-muted-foreground hidden sm:block truncate">{p.category}</span>
                <span className="w-20 text-right text-sm font-medium hidden md:block">${p.price.toFixed(2)}</span>
                <div className="w-32 hidden lg:flex flex-col gap-1">
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>{p.stock} units</span><span>min {p.minStock}</span>
                  </div>
                  <Progress value={stockPct} className={cn("h-1.5", p.status === "out_of_stock" ? "[&>div]:bg-red-500" : p.status === "low_stock" ? "[&>div]:bg-yellow-500" : "[&>div]:bg-emerald-500")} />
                </div>
                <div className="w-24 flex justify-center">
                  <Badge variant="outline" className={cn("text-[10px] gap-1", STATUS_COLORS[p.status])}>
                    <Icon className="h-2.5 w-2.5" />{STATUS_LABELS[p.status]}
                  </Badge>
                </div>
                <div className="w-16 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(p)} className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
                  <button onClick={() => { setAdjusting(p); setForm({ ...p }); }} className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><Scale className="h-3.5 w-3.5" /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add/Edit dialog */}
      <Dialog open={dialog} onOpenChange={(o) => { setDialog(o); if (!o) { setEditing(null); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit Product" : "Add Product"}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-1">
            <div className="space-y-1.5"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>SKU</Label><Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="SKU-001" /></div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5"><Label>Price ($)</Label><Input type="number" min={0} step={0.01} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></div>
              <div className="space-y-1.5"><Label>Stock</Label><Input type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} /></div>
              <div className="space-y-1.5"><Label>Min Stock</Label><Input type="number" min={0} value={form.minStock} onChange={(e) => setForm({ ...form, minStock: Number(e.target.value) })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDialog(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSave} disabled={createProduct.isPending || updateProduct.isPending}>
              {(createProduct.isPending || updateProduct.isPending) ? "Saving..." : editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Adjust stock dialog */}
      <Dialog open={!!adjusting} onOpenChange={(o) => !o && setAdjusting(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Adjust Stock</DialogTitle></DialogHeader>
          <div className="space-y-3 py-1">
            <div className="rounded-lg bg-muted/30 px-4 py-3">
              <p className="text-sm font-medium">{adjusting?.name}</p>
              <p className="text-xs text-muted-foreground">Current: {adjusting?.stock} units</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>New Stock</Label><Input type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} /></div>
              <div className="space-y-1.5"><Label>Min Stock</Label><Input type="number" min={0} value={form.minStock} onChange={(e) => setForm({ ...form, minStock: Number(e.target.value) })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setAdjusting(null)}>Cancel</Button>
            <Button size="sm" onClick={handleAdjust} disabled={adjustStock.isPending}>{adjustStock.isPending ? "Updating..." : "Update"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
