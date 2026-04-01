import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { DollarSign, TrendingUp, ShoppingCart, Target, Plus, Sparkles, Building2 } from "lucide-react";
import { dealsApi } from "@/lib/api";
import { PageHeader } from "@/components/crm/ui/PageHeader";
import { DataToolbar } from "@/components/crm/ui/DataToolbar";
import { EntityTable, EntityColumn } from "@/components/crm/ui/EntityTable";
import { EmptyState } from "@/components/crm/ui/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const formatCurrency = (value?: number | string) => {
  if (value === undefined || value === null) return "—";
  const num = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(num)) return String(value);
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num);
};

export default function SalesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["sales", "deals"],
    queryFn: () => dealsApi.getAll(),
  });

  const deals = useMemo(() => {
    if (!data) return [] as any[];
    if (Array.isArray(data)) return data;
    return (data as any).data ?? [];
  }, [data]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return deals
      .filter((d: any) => {
        const customer = `${d.contacts?.first_name || ""} ${d.contacts?.last_name || ""}`.trim() || d.companies?.name || "";
        const matchesSearch = term
          ? customer.toLowerCase().includes(term) ||
            (d.title || "").toLowerCase().includes(term) ||
            (d.stage || "").toLowerCase().includes(term)
          : true;
        const matchesStatus = status === "all" || (d.status || d.stage || "").toLowerCase() === status;
        return matchesSearch && matchesStatus;
      })
      .sort((a: any, b: any) => {
        if (sortBy === "value") return Number(b.value || 0) - Number(a.value || 0);
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });
  }, [deals, search, status, sortBy]);

  const stats = useMemo(() => {
    const count = filtered.length;
    const total = filtered.reduce((sum: number, d: any) => sum + Number(d.value ?? d.amount ?? 0), 0);
    const avg = count ? total / count : 0;
    const won = filtered.filter((d: any) => (d.status || "").toLowerCase() === "won").length;
    return [
      { title: "Total Sales", value: formatCurrency(total), change: "+0%", icon: DollarSign },
      { title: "Orders", value: count.toLocaleString(), change: "+0%", icon: ShoppingCart },
      { title: "Avg. Order Value", value: formatCurrency(avg), change: "+0%", icon: Target },
      { title: "Win Rate", value: count ? `${Math.round((won / count) * 100)}%` : "0%", change: "", icon: TrendingUp },
    ];
  }, [filtered]);

  const getStatusColor = (status?: string) => {
    const normalized = (status || "").toLowerCase();
    if (normalized.includes("complete") || normalized === "won") return "bg-green-500/10 text-green-600 border-green-500/20";
    if (normalized.includes("process") || normalized === "open" || normalized === "in_progress") return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    if (normalized.includes("pending") || normalized === "new") return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
    return "bg-gray-500/10 text-gray-600 border-gray-500/20";
  };

  const columns: EntityColumn<any>[] = [
    {
      key: "id",
      header: "Order",
      render: (d) => (
        <div className="space-y-1">
          <p className="font-semibold">{d.title || d.id}</p>
          <p className="text-xs text-muted-foreground">{d.created_at ? new Date(d.created_at).toLocaleDateString() : "—"}</p>
        </div>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (d) => {
        const contact = d.contacts || d.contact;
        const company = d.companies || d.company;
        const customer = contact ? `${contact.first_name ?? ""} ${contact.last_name ?? ""}`.trim() || company?.name || "—" : company?.name || "—";
        return <span className="text-sm text-foreground">{customer}</span>;
      },
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      sortable: true,
      render: (d) => <span className="font-semibold">{formatCurrency(d.value ?? d.amount)}</span>,
    },
    {
      key: "items",
      header: "Items",
      render: (d) => <span className="text-sm text-muted-foreground">{d.items?.length ?? d.item_count ?? "—"}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (d) => (
        <Badge variant="outline" className={getStatusColor(d.status || d.stage)}>
          {d.status || d.stage || "Open"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales"
        description="Monitor revenue performance and recent orders."
        meta={[
          { label: "Orders", value: filtered.length, tone: "info" },
        ]}
        actions={
          <Button className="gradient-primary" onClick={() => navigate("/crm/deals/create")}>
            <Plus className="mr-2 h-4 w-4" />
            New Order
          </Button>
        }
      />

      <DataToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search customer, deal, status"
        filters={[
          {
            label: "Status",
            value: status,
            onChange: setStatus,
            options: [
              { label: "All", value: "all" },
              { label: "Open", value: "open" },
              { label: "Won", value: "won" },
              { label: "Lost", value: "lost" },
              { label: "Pending", value: "pending" },
            ],
          },
        ]}
        sortValue={sortBy}
        sortOptions={[
          { label: "Recent", value: "recent" },
          { label: "Value", value: "value" },
        ]}
        onSortChange={setSortBy}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-card border-0 bg-card/90">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  {stat.change && <p className="text-sm text-success">{stat.change}</p>}
                </div>
                <div className="p-3 rounded-full bg-primary/10">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-0 shadow-card">
        <CardContent className="p-0">
          <EntityTable
            data={filtered}
            columns={columns}
            isLoading={isLoading}
            pageSize={10}
            emptyState={
              <EmptyState
                title="No sales orders"
                description="Close your first deal to see sales here."
                icon={<Sparkles className="h-6 w-6" />}
              />
            }
          />
        </CardContent>
      </Card>

      {isError && (
        <Card>
          <CardContent className="p-6">
            <EmptyState title="Failed to load sales" description="Check connection and try again." muted />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
