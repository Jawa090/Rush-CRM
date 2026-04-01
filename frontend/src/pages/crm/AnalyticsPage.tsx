import { useMemo } from "react";
import { useLeads, useDeals } from "@/hooks/useCrmData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { TrendingUp, TrendingDown, Target, Award, Sparkles } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/crm/ui/PageHeader";
import { EmptyState } from "@/components/crm/ui/EmptyState";

const monthLabel = (dateStr?: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleString("en-US", { month: "short" });
};

export default function CRMAnalyticsPage() {
  const { data: leads } = useLeads();
  const { data: deals } = useDeals();

  const monthlyData = useMemo(() => {
    const months: Record<string, { month: string; leads: number; deals: number; revenue: number }> = {};

    (leads || []).forEach((l: any) => {
      const m = monthLabel(l.created_at) || "N/A";
      if (!months[m]) months[m] = { month: m, leads: 0, deals: 0, revenue: 0 };
      months[m].leads += 1;
    });

    (deals || []).forEach((d: any) => {
      const m = monthLabel(d.created_at) || "N/A";
      if (!months[m]) months[m] = { month: m, leads: 0, deals: 0, revenue: 0 };
      months[m].deals += 1;
      months[m].revenue += Number(d.value ?? d.amount ?? 0);
    });

    return Object.values(months).sort((a, b) => a.month.localeCompare(b.month));
  }, [leads, deals]);

  const sourceData = useMemo(() => {
    const buckets: Record<string, number> = {};
    (leads || []).forEach((l: any) => {
      const source = (l.source || l.lead_source || "Other").toString();
      buckets[source] = (buckets[source] || 0) + 1;
    });
    const entries = Object.entries(buckets);
    const palette = [
      "hsl(217, 91%, 60%)",
      "hsl(142, 76%, 36%)",
      "hsl(38, 92%, 50%)",
      "hsl(280, 65%, 60%)",
      "hsl(199, 89%, 48%)",
    ];
    return entries.map(([name, value], idx) => ({ name, value, color: palette[idx % palette.length] }));
  }, [leads]);

  const conversionData = useMemo(() => {
    const totalLeads = leads?.length ?? 0;
    const totalDeals = deals?.length ?? 0;
    const closed = (deals || []).filter((d: any) => (d.status || "").toLowerCase() === "won" || (d.stage || "").includes("close")).length;
    return [
      { stage: "Leads", value: totalLeads },
      { stage: "Deals", value: totalDeals },
      { stage: "Closed", value: closed },
    ];
  }, [leads, deals]);

  const conversionRate = useMemo(() => {
    const totalLeads = leads?.length ?? 0;
    const closed = conversionData[2]?.value ?? 0;
    return totalLeads ? ((closed / totalLeads) * 100).toFixed(1) + "%" : "0%";
  }, [conversionData, leads]);

  const avgDealSize = useMemo(() => {
    const totalDeals = deals?.length ?? 0;
    const sum = (deals || []).reduce((acc: number, d: any) => acc + Number(d.value ?? d.amount ?? 0), 0);
    return totalDeals ? `$${Math.round(sum / totalDeals).toLocaleString()}` : "$0";
  }, [deals]);

  const winRate = useMemo(() => {
    const total = deals?.length ?? 0;
    const won = (deals || []).filter((d: any) => (d.status || "").toLowerCase() === "won").length;
    return total ? `${Math.round((won / total) * 100)}%` : "0%";
  }, [deals]);

  const velocity = useMemo(() => {
    const durations: number[] = [];
    (deals || []).forEach((d: any) => {
      if (d.created_at && d.closed_at) {
        const diff = (new Date(d.closed_at).getTime() - new Date(d.created_at).getTime()) / (1000 * 60 * 60 * 24);
        if (!Number.isNaN(diff)) durations.push(diff);
      }
    });
    const avg = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
    return avg ? `${Math.round(avg)} days` : "—";
  }, [deals]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Premium dashboard of revenue, conversion, and velocity." 
        meta={[
          { label: "Leads", value: leads?.length ?? 0, tone: "info" },
          { label: "Deals", value: deals?.length ?? 0, tone: "success" },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Conversion Rate" value={conversionRate} change={{ value: 0, type: "increase" }} icon={Target} iconClassName="gradient-primary" />
        <StatCard title="Avg Deal Size" value={avgDealSize} change={{ value: 0, type: "increase" }} icon={Award} iconClassName="bg-success" />
        <StatCard title="Win Rate" value={winRate} change={{ value: 0, type: "decrease" }} icon={TrendingDown} iconClassName="bg-warning" />
        <StatCard title="Sales Velocity" value={velocity} change={{ value: 0, type: "increase" }} icon={TrendingUp} iconClassName="bg-info" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card border-0">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "hsl(215, 16%, 47%)", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(215, 16%, 47%)", fontSize: 12 }} tickFormatter={(value) => `$${(value as number) / 1000}k`} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(0, 0%, 100%)", border: "1px solid hsl(214, 32%, 91%)", borderRadius: "8px" }} formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]} />
                <Line type="monotone" dataKey="revenue" stroke="hsl(217, 91%, 60%)" strokeWidth={3} dot={{ fill: "hsl(217, 91%, 60%)", strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Lead Sources</h3>
            {sourceData.length === 0 ? (
              <EmptyState title="No source data yet" description="Capture more leads to see distribution." icon={<Sparkles className="h-6 w-6" />} muted />
            ) : (
              <div className="flex items-center">
                <ResponsiveContainer width="50%" height={250}>
                  <PieChart>
                    <Pie data={sourceData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                      {sourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-3">
                  {sourceData.map((source) => (
                    <div key={source.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: source.color }} />
                        <span className="text-sm">{source.name}</span>
                      </div>
                      <span className="text-sm font-semibold">{source.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card border-0">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Leads vs Deals</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "hsl(215, 16%, 47%)", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(215, 16%, 47%)", fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(0, 0%, 100%)", border: "1px solid hsl(214, 32%, 91%)", borderRadius: "8px" }} />
                <Legend />
                <Bar dataKey="leads" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="deals" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Conversion Funnel</h3>
            <div className="space-y-4">
              {conversionData.map((item, index) => {
                const width = conversionData[0]?.value ? (item.value / conversionData[0].value) * 100 : 0;
                const conversion = index > 0 && conversionData[index - 1]?.value
                  ? ((item.value / conversionData[index - 1].value) * 100).toFixed(1)
                  : "100";
                return (
                  <div key={item.stage}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{item.stage}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">{conversion}%</span>
                        <span className="text-sm font-semibold">{item.value}</span>
                      </div>
                    </div>
                    <div className="h-8 bg-muted rounded-lg overflow-hidden">
                      <div className="h-full gradient-primary rounded-lg transition-all duration-500" style={{ width: `${width}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
