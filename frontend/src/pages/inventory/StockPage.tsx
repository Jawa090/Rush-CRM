import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStock, useStockAlerts, useAdjustStock } from "@/hooks/useCrmData";
import { Search, Package, AlertTriangle, TrendingDown, TrendingUp, RefreshCw, Loader2, Warehouse } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  "In Stock":     "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Low Stock":    "bg-yellow-50 text-yellow-700 border-yellow-200",
  "Out of Stock": "bg-red-50 text-red-700 border-red-200",
};

export default function StockPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  const { data: stockData, isLoading, isError, refetch } = useStock();
  const { data: alertsData } = useStockAlerts();

  const alertLookup = useMemo(() => {
    const map = new Map<string, any>();
    (alertsData || []).forEach((item: any) => { if (item.product_id) map.set(String(item.product_id), item); });
    return map;
  }, [alertsData]);

  const getStatus = (item: any) => {
    const qty = Number(item.quantity || 0);
    if (qty <= 0) return "Out of Stock";
    const alert = alertLookup.get(String(item.product_id));
    if (alert && Number(alert.current_stock || 0) < Number(alert.min_stock || 0)) return "Low Stock";
    return "In Stock";
  };

  const items = useMemo(() => {
    let list: any[] = stockData || [];
    if (search) { const t = search.toLowerCase(); list = list.filter((i) => (i.product_name || "").toLowerCase().includes(t) || (i.sku || "").toLowerCase().includes(t) || (i.warehouse_name || "").toLowerCase().includes(t)); }
    if (statusFilter !== "all") list = list.filter((i) => getStatus(i).toLowerCase() === statusFilter.replace("_", " "));
    switch (sortBy) {
      case "qty":     return [...list].sort((a, b) => Number(b.quantity || 0) - Number(a.quantity || 0));
      case "product": return [...list].sort((a, b) => (a.product_name || "").localeCompare(b.product_name || ""));
      default:        return [...list].sort((a, b) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime());
    }
  }, [stockData, search, statusFilter, sortBy, alertLookup]);

  const stats = useMemo(() => {
    const totalSkus = new Set((stockData || []).map((i: any) => i.product_id)).size;
    const lowStock = alertsData?.length || 0;
    const outOfStock = (stockData || []).filter((i: any) => Number(i.quantity) <= 0).length;
    const totalUnits = (stockData || []).reduce((s: number, i: any) => s + Number(i.quantity || 0), 0);
    return { totalSkus, lowStock, outOfStock, totalUnits };
  }, [stockData, alertsData]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Stock Tracking</h1>
          <p className="text-sm text-muted-foreground">Monitor inventory levels in real-time</p>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => refetch()} disabled={isLoading}>
          {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />} Sync
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total SKUs",    value: stats.totalSkus,   color: "bg-blue-500",    icon: Package },
          { label: "Total Units",   value: stats.totalUnits,  color: "bg-emerald-500", icon: TrendingUp },
          { label: "Low Stock",     value: stats.lowStock,    color: "bg-yellow-500",  icon: AlertTriangle },
          { label: "Out of Stock",  value: stats.outOfStock,  color: "bg-red-500",     icon: TrendingDown },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border/50 bg-card p-4">
            <div className={cn("p-1.5 rounded-lg w-fit mb-2", s.color)}><s.icon className="h-3.5 w-3.5 text-white" /></div>
            <p className="text-2xl font-bold tabular-nums">{Number(s.value).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input className="pl-8 h-8 text-sm" placeholder="Search products or warehouses..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 w-32 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="in stock">In Stock</SelectItem>
            <SelectItem value="low stock">Low Stock</SelectItem>
            <SelectItem value="out of stock">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="h-8 w-32 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recent</SelectItem>
            <SelectItem value="qty">Quantity</SelectItem>
            <SelectItem value="product">Product</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border/40">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Stock Levels ({items.length})</span>
        </div>
        <div className="flex items-center gap-3 px-5 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider border-b border-border/30 bg-muted/20">
          <span className="w-20 hidden sm:block">SKU</span>
          <span className="flex-1">Product</span>
          <span className="w-28 hidden md:block">Warehouse</span>
          <span className="w-32 hidden lg:block">Stock Level</span>
          <span className="w-16 text-right hidden md:block">Qty</span>
          <span className="w-16 text-right hidden lg:block">Reorder</span>
          <span className="w-24 text-center">Status</span>
        </div>
        <div className="divide-y divide-border/40">
          {isError ? (
            <div className="flex items-center justify-center py-12 text-sm text-destructive">Failed to load stock data</div>
          ) : isLoading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3 animate-pulse">
                <div className="h-4 w-16 bg-muted rounded" /><div className="flex-1 h-4 bg-muted rounded" />
              </div>
            ))
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <Package className="h-10 w-10 text-muted-foreground/20" />
              <p className="text-sm text-muted-foreground">No stock records found</p>
            </div>
          ) : items.map((item: any, idx: number) => {
            const status = getStatus(item);
            const alert = alertLookup.get(String(item.product_id));
            const minStock = Number(alert?.min_stock || 0);
            const qty = Number(item.quantity || 0);
            const pct = minStock > 0 ? Math.min(100, Math.round((qty / (minStock * 4)) * 100)) : qty > 0 ? 100 : 0;
            return (
              <div key={item.id || idx} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors">
                <span className="w-20 font-mono text-xs text-muted-foreground hidden sm:block truncate">{item.sku || "—"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.product_name || "Unnamed"}</p>
                  <p className="text-[11px] text-muted-foreground">{item.updated_at ? new Date(item.updated_at).toLocaleDateString() : "—"}</p>
                </div>
                <div className="w-28 hidden md:flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Warehouse className="h-3 w-3 shrink-0" /><span className="truncate">{item.warehouse_name || "—"}</span>
                </div>
                <div className="w-32 hidden lg:flex flex-col gap-1">
                  <Progress value={pct} className={cn("h-1.5", status === "Out of Stock" ? "[&>div]:bg-red-500" : status === "Low Stock" ? "[&>div]:bg-yellow-500" : "[&>div]:bg-emerald-500")} />
                  <span className="text-[10px] text-muted-foreground">{pct}% of capacity</span>
                </div>
                <span className="w-16 text-right text-sm font-semibold hidden md:block">{qty}</span>
                <span className="w-16 text-right text-xs text-muted-foreground hidden lg:block">{minStock || "—"}</span>
                <div className="w-24 flex justify-center">
                  <Badge variant="outline" className={cn("text-[10px]", STATUS_COLORS[status] ?? "bg-muted text-muted-foreground")}>{status}</Badge>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
