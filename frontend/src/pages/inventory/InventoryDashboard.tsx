import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Package, ShoppingCart, Warehouse, Users, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle, Clock, DollarSign, ArrowUpRight, Box,
  Truck, FileText, Activity, BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function InventoryDashboard() {
  const navigate = useNavigate();

  // Fetch dashboard stats
  const { data: statsResp } = useQuery({
    queryKey: ["inventory-stats"],
    queryFn: () => api.get("/inventory/stats"),
    refetchInterval: 60000,
  });

  const stats = (statsResp as any)?.data || {};

  // Fetch low stock products
  const { data: lowStockResp } = useQuery({
    queryKey: ["low-stock-products"],
    queryFn: () => api.get("/products", { params: { lowStock: true, limit: 10 } }),
  });

  const lowStockProducts = (lowStockResp as any)?.data || [];

  // Fetch recent purchase orders
  const { data: recentPOResp } = useQuery({
    queryKey: ["recent-purchase-orders"],
    queryFn: () => api.get("/purchase-orders", { params: { limit: 5 } }),
  });

  const recentPOs = (recentPOResp as any)?.data || [];

  // Fetch recent stock movements
  const { data: movementsResp } = useQuery({
    queryKey: ["recent-stock-movements"],
    queryFn: () => api.get("/stock/movements", { params: { limit: 10 } }),
  });

  const recentMovements = (movementsResp as any)?.data || [];

  const stockHealthPercentage = stats.totalProducts 
    ? Math.round(((stats.totalProducts - (stats.lowStockProducts || 0)) / stats.totalProducts) * 100)
    : 100;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Real-time inventory tracking and management
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => navigate("/inventory/products")} className="gap-2">
            <Package className="h-4 w-4" />
            Add Product
          </Button>
          <Button onClick={() => navigate("/inventory/purchase-orders")} variant="outline" className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            New PO
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Products */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                <p className="text-3xl font-bold mt-2">{stats.totalProducts || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.activeProducts || 0} active
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Stock Value */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Stock Value</p>
                <p className="text-3xl font-bold mt-2">
                  ${(stats.totalStockValue || 0).toLocaleString()}
                </p>
                <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {stats.stockValueChange || 0}% vs last month
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
                <p className="text-3xl font-bold mt-2">{stats.lowStockProducts || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Needs reordering
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            {stats.lowStockProducts > 0 && (
              <Button 
                variant="link" 
                size="sm" 
                className="mt-2 p-0 h-auto text-xs"
                onClick={() => navigate("/inventory/products?filter=low-stock")}
              >
                View products →
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Stock Health */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Stock Health</p>
                <p className="text-3xl font-bold mt-2">{stockHealthPercentage}%</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <Progress value={stockHealthPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Overall inventory status
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {[
          { label: "Warehouses", value: stats.totalWarehouses || 0, color: "bg-cyan-500", icon: Warehouse },
          { label: "Vendors", value: stats.totalVendors || 0, color: "bg-violet-500", icon: Users },
          { label: "Pending POs", value: stats.pendingPOs || 0, color: "bg-yellow-500", icon: Clock },
          { label: "In Transit", value: stats.inTransitPOs || 0, color: "bg-blue-500", icon: Truck },
          { label: "Completed POs", value: stats.completedPOs || 0, color: "bg-emerald-500", icon: CheckCircle },
          { label: "Assigned Items", value: stats.assignedToEmployees || 0, color: "bg-pink-500", icon: Users },
        ].map((stat) => (
          <Card key={stat.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className={cn("p-2 rounded-lg w-fit mb-2", stat.color)}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock Products - 2 columns */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <CardTitle>Low Stock Alert</CardTitle>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/inventory/products?filter=low-stock")}
                className="gap-1"
              >
                View All
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <CheckCircle className="h-12 w-12 text-emerald-500" />
                <p className="text-sm text-muted-foreground">All products are well stocked!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.map((product: any) => {
                  const stockPercentage = (product.current_stock / product.reorder_level) * 100;
                  
                  return (
                    <div
                      key={product.id}
                      className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-sm truncate">{product.name}</p>
                          <Badge variant="outline" className="text-xs">
                            {product.sku}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Stock: {product.current_stock} {product.unit}</span>
                          <span>Reorder: {product.reorder_level}</span>
                          <span className="text-orange-600 font-medium">
                            {stockPercentage.toFixed(0)}% of minimum
                          </span>
                        </div>
                        <Progress value={stockPercentage} className="h-1.5 mt-2" />
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => navigate(`/inventory/purchase-orders`)}
                      >
                        Reorder
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Stock Movements - 1 column */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Recent Activity</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentMovements.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <Activity className="h-12 w-12 text-muted-foreground/20" />
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                </div>
              ) : recentMovements.map((movement: any) => (
                <div key={movement.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={cn(
                    "mt-0.5 shrink-0 p-2 rounded-full",
                    movement.movement_type === 'stock_in' ? "bg-emerald-100" : "bg-red-100"
                  )}>
                    {movement.movement_type === 'stock_in' ? (
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{movement.product_name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {movement.movement_type === 'stock_in' ? 'Added' : 'Removed'} {movement.quantity} units
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      {movement.warehouse_name} • {format(new Date(movement.created_at), "MMM d, HH:mm")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Purchase Orders */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Recent Purchase Orders</CardTitle>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/inventory/purchase-orders")}
              className="gap-1"
            >
              View All
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentPOs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <FileText className="h-12 w-12 text-muted-foreground/20" />
              <p className="text-sm text-muted-foreground">No purchase orders yet</p>
              <Button 
                size="sm" 
                onClick={() => navigate("/inventory/purchase-orders")}
                className="mt-2"
              >
                Create First PO
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPOs.map((po: any) => (
                <div
                  key={po.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/inventory/purchase-orders/${po.id}`)}
                >
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm">{po.po_number}</p>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs",
                          po.status === 'completed' && "bg-emerald-50 text-emerald-700 border-emerald-200",
                          po.status === 'pending' && "bg-yellow-50 text-yellow-700 border-yellow-200",
                          po.status === 'approved' && "bg-blue-50 text-blue-700 border-blue-200"
                        )}
                      >
                        {po.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{po.vendor_name}</span>
                      <span>•</span>
                      <span>{format(new Date(po.order_date), "MMM d, yyyy")}</span>
                      <span>•</span>
                      <span>{po.item_count} items</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">${po.total_amount?.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Products", sub: "Manage catalog", icon: Package, href: "/inventory/products", color: "bg-blue-500" },
              { label: "Stock", sub: "Track inventory", icon: Box, href: "/inventory/stock", color: "bg-emerald-500" },
              { label: "Purchase Orders", sub: "Create & manage", icon: ShoppingCart, href: "/inventory/purchase-orders", color: "bg-orange-500" },
              { label: "Vendors", sub: "Supplier list", icon: Users, href: "/inventory/vendors", color: "bg-violet-500" },
              { label: "Warehouses", sub: "Locations", icon: Warehouse, href: "/inventory/warehouses", color: "bg-cyan-500" },
              { label: "Assignments", sub: "Employee items", icon: Users, href: "/inventory/assignments", color: "bg-pink-500" },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => navigate(item.href)}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border border-border hover:shadow-lg hover:border-primary/30 transition-all group"
              >
                <div className={cn("p-4 rounded-full", item.color)}>
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.sub}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
