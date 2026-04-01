import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { dealsApi } from "@/lib/api";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const stageColors: Record<string, string> = {
  discovery: "bg-chart-3",
  proposal: "bg-chart-1",
  negotiation: "bg-chart-4",
  "closed won": "bg-success",
  won: "bg-success",
  default: "bg-muted",
};

export function DealsProgress() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "deals", "active"],
    queryFn: () => dealsApi.getAll({ status: "open", limit: 50 }),
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });

  const deals = data?.data || [];

  const { weightedValue } = useMemo(() => {
    const weighted = deals.reduce((sum: number, deal: any) => {
      const value = Number(deal.value) || 0;
      const prob = Number(deal.probability) || 0;
      return sum + (value * prob) / 100;
    }, 0);
    return { weightedValue: weighted };
  }, [deals]);

  return (
    <div className="rounded-xl border border-border bg-card shadow-card animate-fade-in">
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Active Deals</h3>
            <p className="text-sm text-muted-foreground">Pipeline overview</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">${(weightedValue / 1000).toFixed(0)}k</p>
            <p className="text-xs text-muted-foreground">Weighted value</p>
          </div>
        </div>
      </div>
      {isLoading ? (
        <div className="space-y-3 p-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : deals.length === 0 ? (
        <div className="p-6 text-sm text-muted-foreground">No active deals yet.</div>
      ) : (
        <div className="divide-y divide-border">
          {deals.map((deal: any) => (
            <div key={deal.id} className="px-6 py-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium text-sm">{deal.title}</p>
                  <p className="text-xs text-muted-foreground">{deal.company_name || deal.company || "—"}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${(Number(deal.value) || 0).toLocaleString()}</p>
                  <span className="text-xs text-muted-foreground">{deal.stage || "—"}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Progress
                  value={Number(deal.probability) || 0}
                  className={cn("h-2 flex-1", stageColors[(deal.stage || "").toLowerCase()] || stageColors.default)}
                />
                <span className="text-xs font-medium text-muted-foreground w-10">
                  {Number(deal.probability) || 0}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
