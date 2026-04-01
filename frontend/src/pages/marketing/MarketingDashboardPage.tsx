import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3, Mail, FileText, Users, Zap, TrendingUp, Eye, MousePointer, Plus,
} from "lucide-react";
import { useMarketingCampaigns, useMarketingLists, useMarketingForms, useMarketingSequences } from "@/hooks/useMarketingData";

export default function MarketingDashboardPage() {
  const navigate = useNavigate();
  const { data: campaigns = [] } = useMarketingCampaigns();
  const { data: lists = [] } = useMarketingLists();
  const { data: forms = [] } = useMarketingForms();
  const { data: sequences = [] } = useMarketingSequences();

  const stats = useMemo(() => {
    const totalSent = campaigns.reduce((s, c) => s + (c.sent_count || 0), 0);
    const totalOpened = campaigns.reduce((s, c) => s + (c.opened_count || 0), 0);
    const totalClicked = campaigns.reduce((s, c) => s + (c.clicked_count || 0), 0);
    const totalConversions = campaigns.reduce((s, c) => s + (c.total_conversions || 0), 0);
    const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : "0";
    const clickRate = totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(1) : "0";
    return { totalSent, totalOpened, totalClicked, totalConversions, openRate, clickRate };
  }, [campaigns]);

  const activeCampaigns = campaigns.filter(c => c.status === "active" || c.status === "scheduled");
  const recentCampaigns = campaigns.slice(0, 5);

  const statCards = [
    { label: "Total Sent", value: stats.totalSent.toLocaleString(), icon: Mail, color: "text-primary" },
    { label: "Open Rate", value: `${stats.openRate}%`, icon: Eye, color: "text-chart-2" },
    { label: "Click Rate", value: `${stats.clickRate}%`, icon: MousePointer, color: "text-chart-3" },
    { label: "Conversions", value: stats.totalConversions.toLocaleString(), icon: TrendingUp, color: "text-success" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Marketing Hub</h1>
          <p className="text-muted-foreground">Capture, nurture, and convert leads across channels</p>
        </div>
        <Button onClick={() => navigate("/marketing/campaigns")} className="gap-2">
          <Plus className="h-4 w-4" /> New Campaign
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Campaigns", count: campaigns.length, icon: Mail, href: "/marketing/campaigns", desc: `${activeCampaigns.length} active` },
          { label: "Lists & Segments", count: lists.length, icon: Users, href: "/marketing/lists", desc: `${lists.filter(l => l.list_type === "dynamic").length} dynamic` },
          { label: "Forms", count: forms.length, icon: FileText, href: "/marketing/forms", desc: `${forms.filter(f => f.is_active).length} active` },
          { label: "Sequences", count: sequences.length, icon: Zap, href: "/marketing/sequences", desc: `${sequences.filter(s => s.is_active).length} active` },
        ].map((item) => (
          <Card
            key={item.label}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(item.href)}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <item.icon className="h-5 w-5 text-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{item.label}</p>
                    <Badge variant="secondary">{item.count}</Badge>
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
          <CardTitle className="text-base">Recent Campaigns</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate("/marketing/campaigns")}>View all</Button>
        </CardHeader>
        <CardContent>
          {recentCampaigns.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No campaigns yet. Create your first campaign to get started.</p>
          ) : (
            <div className="space-y-3">
              {recentCampaigns.map((c) => (
                <div key={c.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{c.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{c.channel} • {c.campaign_type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={c.status === "active" ? "default" : c.status === "completed" ? "secondary" : "outline"} className="capitalize">
                      {c.status}
                    </Badge>
                    <div className="text-right text-xs text-muted-foreground">
                      <p>{c.sent_count || 0} sent</p>
                      <p>{c.opened_count || 0} opened</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analytics link */}
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/marketing/analytics")}>
        <CardContent className="pt-6 flex items-center gap-4">
          <BarChart3 className="h-8 w-8 text-primary" />
          <div>
            <p className="font-medium">Marketing Analytics</p>
            <p className="text-sm text-muted-foreground">Funnel visualization, campaign ROI, and attribution dashboards</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
