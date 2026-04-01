import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, FunnelChart, Funnel, LabelList,
} from "recharts";
import { useMarketingCampaigns, useMarketingLists, useMarketingForms, useMarketingSequences } from "@/hooks/useMarketingData";
import { useLeads } from "@/hooks/useCrmData";
import { TrendingUp, Target, DollarSign, Users } from "lucide-react";

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export default function MarketingAnalyticsPage() {
  const { data: campaigns = [] } = useMarketingCampaigns();
  const { data: lists = [] } = useMarketingLists();
  const { data: forms = [] } = useMarketingForms();
  const { data: sequences = [] } = useMarketingSequences();
  const { data: leads = [] } = useLeads();

  const aggregated = useMemo(() => {
    const totalSent = campaigns.reduce((s, c) => s + c.sent_count, 0);
    const totalOpened = campaigns.reduce((s, c) => s + c.opened_count, 0);
    const totalClicked = campaigns.reduce((s, c) => s + c.clicked_count, 0);
    const totalConverted = campaigns.reduce((s, c) => s + c.total_conversions, 0);
    const totalBudget = campaigns.reduce((s, c) => s + (c.budget || 0), 0);
    const totalSpend = campaigns.reduce((s, c) => s + (c.actual_spend || 0), 0);
    const totalRevenue = campaigns.reduce((s, c) => s + (c.revenue_attributed || 0), 0);
    const roi = totalSpend > 0 ? (((totalRevenue - totalSpend) / totalSpend) * 100).toFixed(0) : "0";
    return { totalSent, totalOpened, totalClicked, totalConverted, totalBudget, totalSpend, totalRevenue, roi };
  }, [campaigns]);

  // Lifecycle funnel
  const lifecycleCounts = useMemo(() => {
    const stages = ["subscriber", "lead", "mql", "sql", "opportunity", "customer"];
    return stages.map((stage) => ({
      name: stage.toUpperCase(),
      value: leads.filter((l: any) => (l.lifecycle_stage || "subscriber") === stage).length || 0,
    }));
  }, [leads]);

  // Channel breakdown
  const channelData = useMemo(() => {
    const map: Record<string, number> = {};
    campaigns.forEach((c) => { map[c.channel] = (map[c.channel] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [campaigns]);

  // Campaign performance (top 5)
  const topCampaigns = useMemo(() => {
    return [...campaigns]
      .sort((a, b) => b.total_opened - a.total_opened)
      .slice(0, 5)
      .map((c) => ({ name: c.name.slice(0, 20), sent: c.sent_count, opened: c.opened_count, clicked: c.clicked_count }));
  }, [campaigns]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Marketing Analytics</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Campaigns", value: campaigns.length, icon: Target, color: "text-primary" },
          { label: "Total Contacts in Lists", value: lists.reduce((s, l) => s + l.member_count, 0), icon: Users, color: "text-chart-2" },
          { label: "Total Revenue Attributed", value: `$${aggregated.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-success" },
          { label: "Marketing ROI", value: `${aggregated.roi}%`, icon: TrendingUp, color: "text-chart-4" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-bold">{s.value}</p>
                </div>
                <s.icon className={`h-8 w-8 ${s.color} opacity-80`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Campaigns Performance */}
        <Card>
          <CardHeader><CardTitle className="text-base">Top Campaign Performance</CardTitle></CardHeader>
          <CardContent>
            {topCampaigns.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No campaign data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={topCampaigns}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="sent" fill="hsl(var(--chart-1))" name="Sent" />
                  <Bar dataKey="opened" fill="hsl(var(--chart-2))" name="Opened" />
                  <Bar dataKey="clicked" fill="hsl(var(--chart-3))" name="Clicked" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Channel Distribution */}
        <Card>
          <CardHeader><CardTitle className="text-base">Channel Distribution</CardTitle></CardHeader>
          <CardContent>
            {channelData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No channel data yet</p>
            ) : (
              <div className="flex items-center gap-8">
                <ResponsiveContainer width="60%" height={250}>
                  <PieChart>
                    <Pie data={channelData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                      {channelData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {channelData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-sm capitalize">{d.name}</span>
                      <Badge variant="secondary" className="ml-auto">{d.value}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lifecycle Funnel */}
      <Card>
        <CardHeader><CardTitle className="text-base">Lead Lifecycle Funnel</CardTitle></CardHeader>
        <CardContent>
          {lifecycleCounts.every(l => l.value === 0) ? (
            <p className="text-sm text-muted-foreground text-center py-8">No lifecycle data yet. Leads will appear here as they progress through stages.</p>
          ) : (
            <div className="grid grid-cols-6 gap-2">
              {lifecycleCounts.map((stage, i) => (
                <div key={stage.name} className="text-center">
                  <div
                    className="mx-auto rounded-lg flex items-center justify-center font-bold text-primary-foreground"
                    style={{
                      backgroundColor: COLORS[i % COLORS.length],
                      width: `${100 - i * 10}%`,
                      minWidth: "60px",
                      height: "60px",
                    }}
                  >
                    {stage.value}
                  </div>
                  <p className="text-xs mt-2 font-medium">{stage.name}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold">{aggregated.totalSent.toLocaleString()}</p><p className="text-xs text-muted-foreground">Total Emails Sent</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold">{aggregated.totalSent > 0 ? ((aggregated.totalOpened / aggregated.totalSent) * 100).toFixed(1) : 0}%</p><p className="text-xs text-muted-foreground">Avg Open Rate</p></CardContent></Card>        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold">{forms.reduce((s, f) => s + f.submission_count, 0)}</p><p className="text-xs text-muted-foreground">Form Submissions</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold">{sequences.filter(s => s.is_active).length}</p><p className="text-xs text-muted-foreground">Active Sequences</p></CardContent></Card>
      </div>
    </div>
  );
}
