import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, MoreHorizontal, DollarSign, Calendar, GripVertical, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useUpdateDeal, useDeleteDeal } from "@/hooks/useCrmMutations";

interface DealData {
  id: string;
  title: string;
  stage: string | null;
  status: string;
  value: number | null;
  probability: number | null;
  currency: string | null;
  expected_close_date: string | null;
  invoice_amount?: number | null;
  companies?: { name: string } | null;
  contacts?: { first_name: string; last_name?: string | null } | null;
}

const stages = [
  { id: "drawings_received", name: "Drawings Received", color: "bg-chart-3", prob: 10 },
  { id: "awaiting_proposal", name: "Awaiting Proposal", color: "bg-chart-1", prob: 20 },
  { id: "proposal_sent", name: "Proposal Sent", color: "bg-chart-4", prob: 40 },
  { id: "invoice_sent", name: "Invoice Sent", color: "bg-chart-5", prob: 50 },
  { id: "proposal_approved", name: "Approved", color: "bg-chart-2", prob: 60 },
  { id: "in_progress", name: "In Progress", color: "bg-primary", prob: 80 },
  { id: "project_delivered", name: "Delivered", color: "bg-success", prob: 95 },
  { id: "revision", name: "Revision", color: "bg-destructive", prob: 90 },
  { id: "close_deal", name: "Closed", color: "bg-muted-foreground", prob: 100 },
];

interface DealsKanbanViewProps {
  deals?: DealData[];
  selectedStage?: string | null;
  onStageSelect?: (stage: string | null) => void;
}

export function DealsKanbanView({ deals = [], selectedStage, onStageSelect }: DealsKanbanViewProps) {
  const navigate = useNavigate();
  const updateDeal = useUpdateDeal();
  const deleteDeal = useDeleteDeal();
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const getStageDeals = (stageId: string) =>
    deals.filter((d) => (d.stage || "qualification") === stageId);

  const getStageTotalValue = (stageId: string) =>
    getStageDeals(stageId).reduce((sum, d) => sum + (Number(d.value) || 0), 0);

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData("dealId", dealId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(stageId);
  };

  const handleDragLeave = () => setDragOverColumn(null);

  const handleDrop = (e: React.DragEvent, newStage: string) => {
    e.preventDefault();
    setDragOverColumn(null);
    const dealId = e.dataTransfer.getData("dealId");
    if (!dealId) return;
    const deal = deals.find((d) => d.id === dealId);
    if (deal && deal.stage !== newStage) {
      const stageInfo = stages.find((s) => s.id === newStage);
      updateDeal.mutate({
        id: dealId,
        stage: newStage,
        probability: stageInfo?.prob ?? deal.probability,
      });
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {stages.map((stage) => {
        const stageDeals = getStageDeals(stage.id);
        if (selectedStage && selectedStage !== stage.id) return null;

        return (
          <div
            key={stage.id}
            className={cn(
              "flex-shrink-0 w-80 rounded-xl border transition-colors bg-muted/30",
              dragOverColumn === stage.id
                ? "border-primary bg-primary/5"
                : "border-border"
            )}
            onDragOver={(e) => handleDragOver(e, stage.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, stage.id)}
          >
            {/* Stage Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn("h-3 w-3 rounded-full", stage.color)} />
                  <span className="font-semibold">{stage.name}</span>
                  <Badge variant="secondary" className="ml-1">
                    {stageDeals.length}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => navigate("/crm/deals/create")}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                ${(getStageTotalValue(stage.id) / 1000).toFixed(0)}k total
              </p>
            </div>

            {/* Deals */}
            <div className="p-2 space-y-2 max-h-[600px] overflow-y-auto">
              {stageDeals.map((deal) => {
                const companyName = deal.companies?.name || "";
                const prob = deal.probability ?? 0;
                const closeDate = deal.expected_close_date;

                return (
                  <div
                    key={deal.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, deal.id)}
                    className="rounded-lg border border-border bg-card p-4 cursor-grab active:cursor-grabbing hover:shadow-card transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div>
                          <h4
                            className="font-medium text-sm hover:text-primary cursor-pointer"
                            onClick={() => navigate(`/crm/deals/${deal.id}`)}
                          >
                            {deal.title}
                          </h4>
                          {companyName && (
                            <p className="text-xs text-muted-foreground">{companyName}</p>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/crm/deals/${deal.id}`)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => deleteDeal.mutate(deal.id)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-success" />
                        <span className="font-semibold">
                          ${(Number(deal.value) || 0).toLocaleString()}
                        </span>
                      </div>

                      {/* Payment received indicator for Approved stage */}
                      {(deal.stage === "proposal_approved") && (() => {
                        const totalValue = Number(deal.value) || 0;
                        const invoicePaid = Number(deal.invoice_amount) || 0;
                        const paymentPct = totalValue > 0 ? Math.min(Math.round((invoicePaid / totalValue) * 100), 100) : 0;
                        const paymentLabel = paymentPct >= 100 ? "Full" : paymentPct > 0 ? "Partial" : "None";
                        return (
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-muted-foreground flex items-center gap-1">
                                <CreditCard className="h-3 w-3" />
                                {paymentLabel} Payment
                              </span>
                              <span className="font-medium">{paymentPct}%</span>
                            </div>
                            <Progress value={paymentPct} className="h-1.5" />
                          </div>
                        );
                      })()}

                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Probability</span>
                          <span className="font-medium">{prob}%</span>
                        </div>
                        <Progress value={prob} className="h-1.5" />
                      </div>

                      {closeDate && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2 border-t border-border">
                          <Calendar className="h-3 w-3" />
                          {new Date(closeDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {stageDeals.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No deals in this stage
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
