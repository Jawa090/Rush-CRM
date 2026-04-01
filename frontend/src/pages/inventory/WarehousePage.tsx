import { useMemo, useState } from "react";
import { Warehouse, Package, TrendingUp, AlertTriangle, Loader2, MapPin, Plus, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useWarehouses, useStock, useStockAlerts } from "@/hooks/useCrmData";
import { cn } from "@/lib/utils";

const WAREHOUSE_COLORS = ["bg-blue-500","bg-violet-500","bg-emerald-500","bg-orange-500","bg-pink-500","bg-cyan-500"];

function getWarehouseColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return WAREHOUSE_COLORS[Math.abs(hash) % WAREHOUSE_COLORS.length];
}

export default function WarehousePage() {
  const [search, setSearch] = useState("");

  const { data: warehousesData, isLoading, isError } = useWarehouses();
  const { data: stockData } = useStock();
  const { data: alertsData } = useStockAlerts();

  const alertSet = useMemo(() => new Set((alertsData || []).map((a: any) => String(a.id))), [alertsData]);

  // Group stock by warehouse
  const warehouses = useMemo(() => {
    const buckets: Record<string, any> = {};
    (stockData || []).forEach((row: any) => {
      const key = row.warehouse_id || "unassigned";
      if (!buckets[key]) {
        buckets[key] = {
          id: key,
          name: row.warehouse_name || "Unassigned",
          location: row.location || "—",
          products: new Set<string>(),
          totalQty: 0,
          lowStockItems: 0,
          outOfStockItems: 0,
          latestUpdate: row.updated_at,
        };
      }
      buckets[key].products.add(String(row.product_id || row.sku || Math.random()));
      const qty = Number(row.quantity || 0);
      buckets[key].totalQty += qty;
      if (qty <= 0) buckets[key].outOfStockItems++;
      else if (qty < 10) buckets[key].lowStockItems++;
      if (!buckets[key].latestUpdate || (row.updated_at && new Date(row.updated_at) > new Date(buckets[key].latestUpdate))) {
        buckets[key].latestUpdate = row.updated_at;
      }
    });
    return Object.values(buckets).map((b: any) => ({ ...b, productCount: b.products.size }));
  }, [stockData]);

  const filtered = useMemo(() => {
    if (!search) return warehouses;
    const t = search.toLowerCase();
    return warehouses.filter((w: any) => w.name.toLowerCase().includes(t) || (w.location || "").toLowerCase().includes(t));
  }, [warehouses, search]);

  const totalUnits = warehouses.reduce((s: number, w: any) => s + w.totalQty, 0);
  const totalProducts = new Set((stockData || []).map((i: any) => i.product_id)).size;

  const stats = [
    { label: "Locations",    value: warehouses.length,          color: "bg-blue-500",    icon: Warehouse },
    { label: "Unique SKUs",  value: totalProducts,              color: "bg-emerald-500", icon: Package },
    { label: "Total Units",  value: totalUnits.toLocaleString(), color: "bg-violet-500",  icon: TrendingUp },
    { label: "Low Alerts",   value: alertsData?.length || 0,    color: "bg-yellow-500",  icon: AlertTriangle },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Warehouses</h1>
          <p className="text-sm text-muted-foreground">Storage locations and capacity overview</p>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Add Location
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border/50 bg-card p-4">
            <div className={cn("p-1.5 rounded-lg w-fit mb-2", s.color)}><s.icon className="h-3.5 w-3.5 text-white" /></div>
            <p className="text-2xl font-bold tabular-nums">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input className="pl-8 h-8 text-sm" placeholder="Search warehouses..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Warehouse cards */}
      {isError ? (
        <div className="text-sm text-destructive">Failed to load warehouse data</div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading...
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2 rounded-xl border border-dashed border-border/60">
          <Warehouse className="h-10 w-10 text-muted-foreground/20" />
          <p className="text-sm text-muted-foreground">No warehouses found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((w: any) => {
            const color = getWarehouseColor(w.id);
            const hasAlerts = w.lowStockItems > 0 || w.outOfStockItems > 0;
            const healthPct = w.productCount > 0
              ? Math.round(((w.productCount - w.outOfStockItems - w.lowStockItems) / w.productCount) * 100)
              : 100;
            return (
              <div key={w.id} className="rounded-xl border border-border/50 bg-card hover:shadow-sm hover:border-primary/20 transition-all p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", color)}>
                      <Warehouse className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{w.name}</p>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-2.5 w-2.5" />{w.location}
                      </p>
                    </div>
                  </div>
                  {hasAlerts && (
                    <Badge variant="outline" className="text-[10px] bg-yellow-50 text-yellow-700 border-yellow-200 shrink-0">
                      <AlertTriangle className="h-2.5 w-2.5 mr-1" />Alerts
                    </Badge>
                  )}
                </div>

                {/* Health bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Stock Health</span><span className="font-medium text-foreground">{healthPct}%</span>
                  </div>
                  <Progress value={healthPct} className={cn("h-1.5", healthPct < 50 ? "[&>div]:bg-red-500" : healthPct < 80 ? "[&>div]:bg-yellow-500" : "[&>div]:bg-emerald-500")} />
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-border/40">
                  <div className="text-center">
                    <p className="text-lg font-bold tabular-nums">{w.productCount}</p>
                    <p className="text-[10px] text-muted-foreground">Products</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold tabular-nums text-emerald-600">{w.totalQty.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">Units</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground mb-1">Last Update</p>
                    <p className="text-xs font-medium">{w.latestUpdate ? new Date(w.latestUpdate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}</p>
                  </div>
                </div>

                {/* Alert chips */}
                {hasAlerts && (
                  <div className="flex gap-2 flex-wrap">
                    {w.outOfStockItems > 0 && (
                      <span className="text-[10px] bg-red-50 text-red-600 border border-red-200 rounded-full px-2 py-0.5">
                        {w.outOfStockItems} out of stock
                      </span>
                    )}
                    {w.lowStockItems > 0 && (
                      <span className="text-[10px] bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full px-2 py-0.5">
                        {w.lowStockItems} low stock
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
