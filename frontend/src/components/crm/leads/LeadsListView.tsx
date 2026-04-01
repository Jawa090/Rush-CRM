import { useNavigate } from "react-router-dom";
import { GripVertical, Settings, ChevronDown } from "lucide-react";
import { ClickToCall } from "@/components/telephony/ClickToCall";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: "new" | "contacted" | "qualified" | "unqualified";
  source: string;
  value: number;
  type: "inbound" | "planned";
  assignee: {
    name: string;
    avatar?: string;
    initials: string;
  };
  createdAt: string;
}

interface LeadsListViewProps {
  leads: Lead[];
}

const stageProgress: Record<Lead["status"], number> = {
  new: 25,
  contacted: 50,
  qualified: 75,
  unqualified: 100,
};

const leadTypeLabels: Record<string, string> = {
  inbound: "Existing Client",
  planned: "Call",
};

const getViewStatus = (index: number): "CREATED, NOT VIEWED" | "VIEWED" => {
  return index === 1 ? "VIEWED" : "CREATED, NOT VIEWED";
};

export function LeadsListView({ leads }: LeadsListViewProps) {
  const navigate = useNavigate();
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Table Header Row */}
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
              <span className="text-xs font-medium text-muted-foreground">Lead</span>
            </TableHead>
            <TableHead className="w-[140px]">
              <span className="text-xs font-medium text-muted-foreground">Stage</span>
            </TableHead>
            <TableHead className="min-w-[180px]">
              <span className="text-xs font-medium text-muted-foreground">Activity</span>
            </TableHead>
            <TableHead className="w-[100px]">
              <span className="text-xs font-medium text-muted-foreground">Full name</span>
            </TableHead>
            <TableHead className="w-[100px]">
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium text-muted-foreground">Created</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </div>
            </TableHead>
            <TableHead className="w-[120px]">
              <span className="text-xs font-medium text-muted-foreground">Responsible</span>
            </TableHead>
            <TableHead className="w-[120px]">
              <span className="text-xs font-medium text-muted-foreground">Customer journey</span>
            </TableHead>
            <TableHead className="w-[140px]">
              <span className="text-xs font-medium text-muted-foreground">Company Name</span>
            </TableHead>
            <TableHead className="w-[140px]">
              <span className="text-xs font-medium text-muted-foreground">Company Phone Number</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead, index) => (
            <TableRow 
              key={lead.id} 
              className="hover:bg-muted/30 border-b border-border/50 group cursor-pointer"
              onClick={() => navigate(`/crm/leads/${lead.id}`)}
            >
              {/* Checkbox */}
              <TableCell className="px-2 py-3">
                <Checkbox />
              </TableCell>
              
              {/* Drag Handle */}
              <TableCell className="px-1 py-3">
                <GripVertical className="h-4 w-4 text-muted-foreground/50 cursor-grab" />
              </TableCell>
              
              {/* Lead Info */}
              <TableCell className="py-3">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-primary hover:underline">
                    {lead.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {leadTypeLabels[lead.type] || lead.type}
                  </span>
                  <span className="text-xs text-muted-foreground">Task</span>
                  <Badge 
                    variant="outline" 
                    className={`w-fit text-[10px] px-1.5 py-0 h-5 font-medium ${
                      getViewStatus(index) === "VIEWED" 
                        ? "bg-primary/10 text-primary border-primary/20" 
                        : "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {getViewStatus(index)}
                  </Badge>
                </div>
              </TableCell>
              
              {/* Stage */}
              <TableCell className="py-3">
                <div className="flex flex-col gap-1.5">
                  <Progress 
                    value={stageProgress[lead.status]} 
                    className="h-2 w-full bg-muted"
                  />
                  <span className="text-xs text-muted-foreground">Unassigned</span>
                </div>
              </TableCell>
              
              {/* Activity */}
              <TableCell className="py-3">
                <div className="flex flex-col gap-0.5">
                  <a href="#" className="text-xs text-primary hover:underline">
                    no deadline
                  </a>
                  <span className="text-xs text-muted-foreground leading-tight">
                    Process lead: {lead.name} (set from business process)
                  </span>
                  <span className="text-xs text-muted-foreground">
                    for <a href="#" className="text-primary hover:underline">{lead.assignee.name}</a>
                  </span>
                </div>
              </TableCell>
              
              {/* Full name */}
              <TableCell className="py-3">
                <span className="text-sm text-muted-foreground">Untitled</span>
              </TableCell>
              
              {/* Created */}
              <TableCell className="py-3">
                <span className="text-sm text-foreground">
                  {new Date(lead.createdAt).toLocaleDateString('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                    year: 'numeric'
                  })}
                </span>
              </TableCell>
              
              {/* Responsible */}
              <TableCell className="py-3">
                <a href="#" className="text-sm text-primary hover:underline">
                  {lead.assignee.name}
                </a>
              </TableCell>
              
              {/* Customer journey */}
              <TableCell className="py-3">
                <span className="text-sm text-muted-foreground">—</span>
              </TableCell>
              
              {/* Company Name */}
              <TableCell className="py-3">
                <span className="text-sm text-foreground">{lead.company || "—"}</span>
              </TableCell>
              
              {/* Company Phone */}
              <TableCell className="py-3">
                {lead.phone ? (
                  <ClickToCall phoneNumber={lead.phone} entityType="lead" entityId={lead.id} className="text-sm" />
                ) : (
                  <span className="text-sm text-foreground">—</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
