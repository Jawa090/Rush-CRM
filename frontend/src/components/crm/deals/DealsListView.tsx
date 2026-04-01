import { useNavigate } from "react-router-dom";
import { GripVertical, Settings, ChevronDown } from "lucide-react";
import { ClickToCall } from "@/components/telephony/ClickToCall";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Deal {
  id: string;
  name: string;
  type: string;
  stage: {
    name: string;
    progress: number;
    color: string;
  };
  activity: string;
  client: {
    name: string;
    company: string;
    email?: string;
    phone?: string;
  };
  amount: number;
  currency: string;
  responsible: string;
  createdAt: string;
  customerJourney?: string;
  hoursOfWork?: string;
  hourlyRate?: string;
}

interface DealsListViewProps {
  deals?: Deal[];
}

export function DealsListView({ deals: propDeals }: DealsListViewProps) {
  const navigate = useNavigate();
  const displayDeals = propDeals || [];

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="w-10 px-2">
              <Checkbox />
            </TableHead>
            <TableHead className="w-8 px-1">
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Settings className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </TableHead>
            <TableHead className="min-w-[200px]">
              <span className="text-xs font-medium text-muted-foreground">Deal</span>
            </TableHead>
            <TableHead className="w-[160px]">
              <span className="text-xs font-medium text-muted-foreground">Stage</span>
            </TableHead>
            <TableHead className="w-[100px]">
              <span className="text-xs font-medium text-muted-foreground">Activity</span>
            </TableHead>
            <TableHead className="min-w-[200px]">
              <span className="text-xs font-medium text-muted-foreground">Contact</span>
            </TableHead>
            <TableHead className="w-[120px]">
              <span className="text-xs font-medium text-muted-foreground">Amount/Currency</span>
            </TableHead>
            <TableHead className="w-[100px]">
              <span className="text-xs font-medium text-muted-foreground">Responsible</span>
            </TableHead>
            <TableHead className="w-[100px]">
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium text-muted-foreground">Created</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </div>
            </TableHead>
            <TableHead className="w-[100px]">
              <span className="text-xs font-medium text-muted-foreground">Hours Of Work</span>
            </TableHead>
            <TableHead className="w-[100px]">
              <span className="text-xs font-medium text-muted-foreground">Hourly Rate</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayDeals.length === 0 && (
            <TableRow>
              <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                No deals found. Create your first deal to get started.
              </TableCell>
            </TableRow>
          )}
          {displayDeals.map((deal) => (
            <TableRow 
              key={deal.id} 
              className="hover:bg-muted/30 border-b border-border/50 group cursor-pointer"
              onClick={() => navigate(`/crm/deals/${deal.id}`)}
            >
              <TableCell className="px-2 py-3" onClick={(e) => e.stopPropagation()}>
                <Checkbox />
              </TableCell>
              <TableCell className="px-1 py-3">
                <GripVertical className="h-4 w-4 text-muted-foreground/50 cursor-grab" />
              </TableCell>
              <TableCell className="py-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-primary hover:underline">
                    {deal.name}
                  </span>
                  {deal.type && (
                    <span className="text-xs text-muted-foreground">{deal.type}</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="py-3">
                <div className="flex flex-col gap-1">
                  <div className="relative h-2 w-full bg-muted rounded overflow-hidden">
                    <div 
                      className={`absolute left-0 top-0 h-full ${deal.stage.color} transition-all`}
                      style={{ width: `${deal.stage.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{deal.stage.name}</span>
                </div>
              </TableCell>
              <TableCell className="py-3">
                <span className="text-xs text-muted-foreground">{deal.activity}</span>
              </TableCell>
              <TableCell className="py-3" onClick={(e) => e.stopPropagation()}>
                {deal.client.phone ? (
                  <ClickToCall
                    phoneNumber={deal.client.phone}
                    entityType="deal"
                    entityId={deal.id}
                    className="text-sm"
                  />
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="py-3">
                <span className="text-sm text-foreground">
                  {deal.currency}{deal.amount.toLocaleString()}
                </span>
              </TableCell>
              <TableCell className="py-3">
                <span className="text-sm text-primary hover:underline">
                  {deal.responsible}
                </span>
              </TableCell>
              <TableCell className="py-3">
                <span className="text-sm text-foreground">{deal.createdAt}</span>
              </TableCell>
              <TableCell className="py-3">
                <span className="text-sm text-muted-foreground">{deal.hoursOfWork || "—"}</span>
              </TableCell>
              <TableCell className="py-3">
                <span className="text-sm text-muted-foreground">{deal.hourlyRate || "—"}</span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
