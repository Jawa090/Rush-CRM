import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  RefreshCw,
  Activity as ActivityIcon,
  AlertCircle,
  GitMerge,
  Plus,
  Users,
  ArrowRightLeft,
  Loader2,
  ExternalLink,
  Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { activitiesApi, leadsApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ActivityItem {
  id: string;
  entity_type?: string;
  entity_id?: string;
  activity_type?: string;
  title?: string;
  description?: string;
  created_at?: string;
  user_name?: string;
}

const buckets = [
  {
    id: "created",
    label: "Created",
    color: "bg-chart-1",
    icon: Plus,
    matches: (type: string) => type.includes("create"),
  },
  {
    id: "updated",
    label: "Updated",
    color: "bg-primary",
    icon: RefreshCw,
    matches: (type: string) => type.includes("update"),
  },
  {
    id: "stage",
    label: "Stage changes",
    color: "bg-warning",
    icon: GitMerge,
    matches: (type: string) => type.includes("stage"),
  },
  {
    id: "converted",
    label: "Converted",
    color: "bg-success",
    icon: ArrowRightLeft,
    matches: (type: string) => type.includes("convert"),
  },
  {
    id: "other",
    label: "Other",
    color: "bg-muted-foreground",
    icon: ActivityIcon,
    matches: () => true,
  },
];

export function LeadsActivitiesView() {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["lead-activities"],
    queryFn: () => activitiesApi.getRecent(200),
  });

  const { data: leadsList } = useQuery({
    queryKey: ["lead-lookup"],
    queryFn: () => leadsApi.getAll({ limit: 500 }),
  });

  const leadIdSet = useMemo(() => {
    const rows = (leadsList as any)?.data || [];
    return new Set(rows.map((l: any) => l.id));
  }, [leadsList]);

  const handleOpenLead = async (id?: string) => {
    if (!id) return;
    try {
      await leadsApi.getById(id);
      navigate(`/crm/leads/${id}`);
    } catch (err: any) {
      toast.error("Lead not found or inaccessible");
    }
  };

  const leadActivities = useMemo(() => {
    const list: ActivityItem[] = (data as ActivityItem[]) || [];
    return list
      .filter((a) => (a.entity_type || "").toLowerCase() === "lead")
      .map((a) => {
        const type = (a.activity_type || "").toLowerCase();
        const bucket = buckets.find((b) => b.matches(type))?.id || "other";
        return { ...a, bucket } as ActivityItem & { bucket: string };
      });
  }, [data]);

  const grouped = useMemo(() => {
    return buckets.map((bucket) => ({
      ...bucket,
      items: leadActivities.filter((a: any) => a.bucket === bucket.id),
    }));
  }, [leadActivities]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <ActivityIcon className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Lead activities</h3>
          <Badge variant="outline" className="text-xs">
            {leadActivities.length}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            {isFetching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Refresh
          </Button>
          <Button size="sm" className="gap-1" onClick={() => navigate("/crm/leads/create")}> 
            <Plus className="h-4 w-4" />
            New lead
          </Button>
        </div>
      </div>

      {isError && (
        <Card className="border-destructive/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" /> Failed to load activities
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-muted-foreground">
            Please refresh or check your connection.
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Card key={idx}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : leadActivities.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground/60" />
            No lead activities yet. Create a lead or update one to see activity here.
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="w-full">
          <div className="flex gap-3 pb-3 min-w-max">
            {grouped.map((bucket) => (
              <Card key={bucket.id} className="w-72 flex-shrink-0 border-border">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <span className={cn("w-2 h-2 rounded-full", bucket.color)} />
                    <CardTitle className="text-sm flex items-center gap-1">
                      <bucket.icon className="h-4 w-4 text-muted-foreground" />
                      {bucket.label}
                    </CardTitle>
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {bucket.items.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {bucket.items.length === 0 && (
                    <div className="text-xs text-muted-foreground py-6 text-center border border-dashed border-border rounded-md">
                      No items
                    </div>
                  )}
                  {bucket.items.map((item) => (
                    <div key={item.id} className="rounded-md border border-border p-3 space-y-1 bg-card/60">
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5">
                          <Badge variant="outline" className="text-[10px] capitalize">
                            {item.activity_type || "activity"}
                          </Badge>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-2">
                            {item.title || "Activity"}
                          </p>
                          {item.description && (
                            <p className="text-xs text-muted-foreground line-clamp-3">
                              {item.description}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-muted-foreground">
                            {item.user_name && (
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" /> {item.user_name}
                              </span>
                            )}
                            {item.created_at && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {item.entity_id ? (
                        leadIdSet.has(item.entity_id) ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs gap-1 px-2"
                            onClick={() => handleOpenLead(item.entity_id)}
                          >
                            <ExternalLink className="h-3 w-3" /> Open lead
                          </Button>
                        ) : (
                          <Badge variant="outline" className="text-[10px] text-destructive border-destructive/50">
                            Lead missing
                          </Badge>
                        )
                      ) : null}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}
    </div>
  );
}
