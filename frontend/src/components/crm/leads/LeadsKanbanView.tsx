import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoreHorizontal, Plus, Building2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUpdateLead, useDeleteLead, useConvertLeadToDeal } from "@/hooks/useCrmMutations";
import { cn } from "@/lib/utils";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: "new" | "contacted" | "qualified" | "unqualified";
  source: string;
  value: number;
  assignee?: {
    name?: string;
    avatar?: string;
    initials?: string;
  };
  createdAt: string;
}

interface LeadsKanbanViewProps {
  leads: Lead[];
  onCreateLead?: () => void;
}

const columns = [
  { id: "new", title: "Unassigned", color: "bg-chart-1" },
  { id: "contacted", title: "In Progress", color: "bg-warning" },
  { id: "qualified", title: "Processed", color: "bg-success" },
  { id: "unqualified", title: "Unqualified", color: "bg-muted-foreground" },
];

export function LeadsKanbanView({ leads, onCreateLead }: LeadsKanbanViewProps) {
  const navigate = useNavigate();
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();
  const convertLead = useConvertLeadToDeal();
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const getInitials = (lead: Lead) => {
    const source =
      lead.assignee?.initials ||
      lead.assignee?.name ||
      lead.name ||
      lead.email ||
      lead.company ||
      "Lead";

    return (
      source
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || "")
        .join("") || "LD"
    );
  };

  const getLeadsByStatus = (status: string) =>
    leads.filter((lead) => lead.status === status);

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData("leadId", leadId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => setDragOverColumn(null);

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    setDragOverColumn(null);
    const leadId = e.dataTransfer.getData("leadId");
    if (!leadId) return;
    const lead = leads.find((l) => l.id === leadId);
    if (lead && lead.status !== newStatus) {
      updateLead.mutate({ id: leadId, status: newStatus, stage: newStatus });
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((column) => {
        const columnLeads = getLeadsByStatus(column.id);
        const totalValue = columnLeads.reduce((sum, lead) => sum + lead.value, 0);

        return (
          <div
            key={column.id}
            className={cn(
              "flex-shrink-0 w-80 bg-muted/30 rounded-xl border transition-colors",
              dragOverColumn === column.id
                ? "border-primary bg-primary/5"
                : "border-border"
            )}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${column.color}`} />
                  <h3 className="font-semibold">{column.title}</h3>
                  <Badge variant="secondary" className="rounded-full">
                    {columnLeads.length}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={onCreateLead}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                ${totalValue.toLocaleString()} total value
              </p>
            </div>

            {/* Column Content */}
            <div className="p-2 space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto">
              {columnLeads.map((lead) => (
                <div
                  key={lead.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, lead.id)}
                  className="bg-card border border-border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {getInitials(lead)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p
                          className="font-medium text-sm hover:text-primary cursor-pointer"
                          onClick={() => navigate(`/crm/leads/${lead.id}`)}
                        >
                          {lead.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {lead.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/crm/leads/${lead.id}`)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => convertLead.mutate(lead.id)}>
                          Convert to Deal
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => deleteLead.mutate(lead.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-2">
                    {lead.company && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Building2 className="h-3 w-3" />
                        {lead.company}
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {lead.source || "—"}
                      </Badge>
                      <span className="text-sm font-semibold text-primary">
                        ${lead.value.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {columnLeads.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No leads in this stage
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
