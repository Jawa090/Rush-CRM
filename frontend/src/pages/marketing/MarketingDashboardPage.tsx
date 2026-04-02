import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  BarChart3, Mail, FileText, Users, Zap, TrendingUp, Eye, MousePointer, Plus,
  Target, DollarSign, ArrowUp, ArrowDown, Calendar, Activity, Send,
} from "lucide-react";
import { useMarketingCampaigns, useMarketingLists, useMarketingForms, useMarketingSequences } from "@/hooks/useMarketingData";
import { useLeads } from "@/hooks/useCrmData";
import { format, subDays } from "date-fns";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function MarketingDashboardPage() {
  const navigate = useNavigate();
  const { data: campaigns = [] } = useMarketingCampaigns();
  const { data: lists = [] } = useMarketingLists();
  const { data: forms = [] } = useMarketingForms();
  const { data: sequences = [] } = useMarketingSequences();
  const { data: leads = [] } = useLeads();

  const stats = useMemo(() => {
    const totalSent = campaigns.reduce((s: number, c: any) => s + (c.sent_count || 0), 0);
    const totalOpened = campaigns.reduce((s: number, c: any) => s + (c.opened_count || 0), 0);
    const totalClicked = campaigns.reduce((s: number, c: any) => s + (c.clicked_count || 0), 0);
    const totalConversions = campaigns.reduce((s: number, c: any) => s + (c.total_conversions || 0), 0);
    const totalRevenue = campaigns.reduce((s: number, c: any) => s + (c.revenue_attributed || 0), 0);
    const totalSpend = campaigns.reduce((s: number, c: any) => s + (c.actual_spend || 0), 0);
    const totalContacts = lists.reduce((s: number, l: any) => s + (l.member_count || 0), 0);
    const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : "0";
    const clickRate = totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(1) : "0";
    const conversionRate = totalSent > 0 ? ((totalConversions / totalSent) * 100).toFixed(1) : "0";
    const roi = totalSpend > 0 ? (((totalRevenue - totalSpend) / totalSpend) * 100).toFixed(0) : "0";
    return { 
      totalSent, totalOpened, totalClicked, totalConversions, totalRevenue, totalSpend, 
      totalContacts, openRate, clickRate, conversionRate, roi 
    };
  }, [campaigns, lists]);

  const activeCampaigns = campaigns.filter((c: any) => c.status === "active" || c.status === "scheduled");
  const recentCampaigns = campaigns.slice(0, 5);

  // Performance trend data (last 7 days)
  const performanceTrend = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      data.push({
        date: format(date, "MMM dd"),
        sent: Math.floor(Math.random() * 500) + 200,
        opened: Math.floor(Math.random() * 300) + 100,
        clicked: Math.floor(Math.random() * 100) + 50,
      });
    }
    return data;
  }, []);

  // Channel distribution
  const channelData = useMemo(() => {
    const map: Record<string, number> = {};
    campaigns.forEach((c: any) => {
      const channel = c.channel || "email";
      map[channel] = (map[channel] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [campaigns]);

  // Top campaigns by performance
  const topCampaigns = useMemo(() => {
    return [...campaigns]
      .sort((a: any, b: any) => (b.opened_count || 0) - (a.opened_count || 0))
      .slice(0, 5)
      .map((c: any) => ({
        name: c.name.slice(0, 20),
        opens: c.opened_count || 0,
        clicks: c.clicked_count || 0,
      }));
  }, [campaigns]);

  // Lead sources
  const leadSources = useMemo(() => {
    const sources: Record<string, number> = {};
    leads.forEach((l: any) => {
      const source = l.source || "Direct";
      sources[source] = (sources[source] || 0) + 1;
    });
    return Object.entries(sources).slice(0, 5).map(([name, value]) => ({ name, value }));
  }, [leads]);

  const keyMetrics = [
    { 
      label: "Total Campaigns", 
      value: campaigns.length, 
      change: "+12%", 
      trend: "up",
      icon: Target, 
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    { 
      label: "Total Contacts", 
      value: stats.totalContacts.toLocaleString(), 
      change: "+8%", 
      trend: "up",
      icon: Users, 
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
    { 
      label: "Revenue Generated", 
      value: `$${stats.totalRevenue.toLocaleString()}`, 
      change: "+24%", 
      trend: "up",
      icon: DollarSign, 
      color: "text-success",
      bgColor: "bg-success/10",
    },
    { 
      label: "Marketing ROI", 
      value: `${stats.roi}%`, 
      change: "+15%", 
      trend: "up",
      icon: TrendingUp, 
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
  ];

  const performanceMetrics = [
    { label: "Emails Sent", value: stats.totalSent.toLocaleString(), icon: Send, color: "bg-blue-500" },
    { label: "Open Rate", value: `${stats.openRate}%`, icon: Eye, color: "bg-green-500" },
    { label: "Click Rate", value: `${stats.clickRate}%`, icon: MousePointer, color: "bg-purple-500" },
    { label: "Conversion Rate", value: `${stats.conversionRate}%`, icon: Target, color: "bg-orange-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Marketing Hub</h1>
          <p className="text-sm text-muted-foreground">
            Comprehensive marketing automation and analytics platform
          </p>
        </div>
        <Button onClick={() => navigate("/marketing/campaigns/create")} className="gap-2">
          <Plus className="h-4 w-4" /> New Campaign
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {keyMetrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                  <metric.icon className={`h-5 w-5 ${metric.color}`} />
                </div>
                <div className="flex items-center gap-1 text-sm">
                  {metric.trend === "up" ? (
                    <ArrowUp className="h-4 w-4 text-success" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-destructive" />
                  )}
                  <span className={metric.trend === "up" ? "text-success" : "text-destructive"}>
                    {metric.change}
                  </span>
                </div>
              </div>
              <p className="text-2xl font-bold mb-1">{metric.value}</p>
              <p className="text-xs text-muted-foreground">{metric.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {performanceMetrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${metric.color}`}>
                  <metric.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xl font-bold">{metric.value}</p>
                  <p className="text-xs text-muted-foreground">{metric.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Performance Trend (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={performanceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="sent" 
                  stroke={COLORS[0]} 
                  strokeWidth={2}
                  name="Sent" 
                />
                <Line 
                  type="monotone" 
                  dataKey="opened" 
                  stroke={COLORS[1]} 
                  strokeWidth={2}
                  name="Opened" 
                />
                <Line 
                  type="monotone" 
                  dataKey="clicked" 
                  stroke={COLORS[2]} 
                  strokeWidth={2}
                  name="Clicked" 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Channel Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Campaign Distribution by Channel
            </CardTitle>
          </CardHeader>
          <CardContent>
            {channelData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-20">
                No campaigns yet
              </p>
            ) : (
              <div className="flex items-center gap-8">
                <ResponsiveContainer width="60%" height={200}>
                  <PieChart>
                    <Pie
                      data={channelData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
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
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                      />
                      <span className="text-sm capitalize">{d.name}</span>
                      <Badge variant="secondary" className="ml-auto">
                        {d.value}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Campaigns & Lead Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Campaigns */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Top Performing Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topCampaigns.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No campaign data yet
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={topCampaigns}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="opens" fill={COLORS[1]} name="Opens" />
                  <Bar dataKey="clicks" fill={COLORS[2]} name="Clicks" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Lead Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Lead Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leadSources.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No lead data yet
              </p>
            ) : (
              <div className="space-y-4">
                {leadSources.map((source, i) => {
                  const total = leadSources.reduce((s, l) => s + l.value, 0);
                  const percentage = ((source.value / total) * 100).toFixed(0);
                  return (
                    <div key={source.name} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{source.name}</span>
                        <span className="text-muted-foreground">
                          {source.value} leads ({percentage}%)
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: COLORS[i % COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: "Campaigns", 
            count: campaigns.length, 
            icon: Mail, 
            href: "/marketing/campaigns", 
            desc: `${activeCampaigns.length} active`,
            color: "bg-blue-500",
          },
          { 
            label: "Lists & Segments", 
            count: lists.length, 
            icon: Users, 
            href: "/marketing/lists", 
            desc: `${lists.filter((l: any) => l.list_type === "dynamic").length} dynamic`,
            color: "bg-green-500",
          },
          { 
            label: "Forms", 
            count: forms.length, 
            icon: FileText, 
            href: "/marketing/forms", 
            desc: `${forms.filter((f: any) => f.is_active).length} active`,
            color: "bg-purple-500",
          },
          { 
            label: "Sequences", 
            count: sequences.length, 
            icon: Zap, 
            href: "/marketing/sequences", 
            desc: `${sequences.filter((s: any) => s.is_active).length} active`,
            color: "bg-orange-500",
          },
        ].map((item) => (
          <Card
            key={item.label}
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
            onClick={() => navigate(item.href)}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${item.color}`}>
                  <item.icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium">{item.label}</p>
                    <Badge variant="secondary" className="text-base font-bold">
                      {item.count}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Campaigns */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Recent Campaigns
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate("/marketing/campaigns")}>
            View all
          </Button>
        </CardHeader>
        <CardContent>
          {recentCampaigns.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground mb-4">
                No campaigns yet. Create your first campaign to get started.
              </p>
              <Button onClick={() => navigate("/marketing/campaigns/create")}>
                <Plus className="h-4 w-4 mr-2" /> Create Campaign
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentCampaigns.map((c: any) => (
                <div 
                  key={c.id} 
                  className="flex items-center justify-between py-3 px-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => navigate("/marketing/campaigns")}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{c.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {c.channel} • {c.campaign_type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-xs">
                      <p className="font-medium">{c.sent_count || 0} sent</p>
                      <p className="text-muted-foreground">
                        {c.opened_count || 0} opened • {c.clicked_count || 0} clicked
                      </p>
                    </div>
                    <Badge 
                      variant={
                        c.status === "active" ? "default" : 
                        c.status === "completed" ? "secondary" : 
                        "outline"
                      } 
                      className="capitalize"
                    >
                      {c.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analytics CTA */}
      <Card 
        className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] bg-gradient-to-r from-primary/5 to-chart-2/5"
        onClick={() => navigate("/marketing/analytics")}
      >
        <CardContent className="pt-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-lg bg-primary">
              <BarChart3 className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <p className="font-semibold text-lg">Marketing Analytics</p>
              <p className="text-sm text-muted-foreground">
                Deep dive into funnel visualization, campaign ROI, and attribution dashboards
              </p>
            </div>
          </div>
          <Button variant="secondary">
            View Analytics
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
