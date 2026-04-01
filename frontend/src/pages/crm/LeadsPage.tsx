import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Sparkles, Mail, Phone, Building2, Filter, Download, Upload, MoreHorizontal, Edit, Trash2, Eye, Globe } from "lucide-react";
import { useLeads, useDeleteLead } from "@/hooks/useCrmData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LeadsKanbanView } from "@/components/crm/leads/LeadsKanbanView";
import { LeadsActivitiesView } from "@/components/crm/leads/LeadsActivitiesView";
import { LeadsCalendarView } from "@/components/crm/leads/LeadsCalendarView";
import { WorkspaceFilter } from "@/components/crm/leads/WorkspaceFilter";
import { PageHeader } from "@/components/crm/ui/PageHeader";
import { DataToolbar } from "@/components/crm/ui/DataToolbar";
import { EntityTable, EntityColumn } from "@/components/crm/ui/EntityTable";
import { EmptyState } from "@/components/crm/ui/EmptyState";
import { AdvancedSearch } from "@/components/crm/ui/AdvancedSearch";
import { toast } from "sonner";

const statusTone = (status?: string) => {
  const s = (status || "").toLowerCase();
  if (s === "qualified") return "bg-emerald-500/10 text-emerald-700 border-emerald-200";
  if (s === "contacted") return "bg-sky-500/10 text-sky-700 border-sky-200";
  if (s === "unqualified") return "bg-rose-500/10 text-rose-700 border-rose-200";
  return "bg-amber-500/10 text-amber-700 border-amber-200";
};

type ViewType = "kanban" | "list" | "activities" | "calendar";

type LeadRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: string;
  source: string;
  value: number;
  type: "inbound" | "planned";
  createdAt: string;
};

export default function LeadsPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<ViewType>("list");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [workspaceFilter, setWorkspaceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const { data: dbLeads, isLoading, isError } = useLeads({ 
    search, 
    status: status !== "all" ? status : undefined,
    page: currentPage,
    limit: pageSize
  });
  const deleteLead = useDeleteLead();

  const leads: LeadRow[] = useMemo(() => {
    // Handle different response formats from the API
    let leadsData: any[] = [];
    
    if (Array.isArray(dbLeads)) {
      leadsData = dbLeads;
    } else if (dbLeads && typeof dbLeads === 'object') {
      const dataObj = dbLeads as any;
      if (Array.isArray(dataObj.data)) {
        leadsData = dataObj.data;
      } else if (dataObj.leads && Array.isArray(dataObj.leads)) {
        leadsData = dataObj.leads;
      }
    }

    return leadsData.map((l: any) => {
      const inferredType = ((l.source || "").toLowerCase().includes("inbound") || (l.channel || "").includes("web")) ? "inbound" : "planned";
      return {
        id: l.id,
        name: l.title || l.name || "Untitled",
        email: l.email || "",
        phone: l.phone || l.company_phone || "",
        company: l.company_name || l.company || "",
        status: l.status || "new",
        source: l.source || l.lead_source || "",
        value: Number(l.value) || 0,
        type: inferredType,
        createdAt: l.created_at,
      };
    });
  }, [dbLeads]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return leads
      .filter((lead) => {
        const matchesSearch = term
          ? lead.name.toLowerCase().includes(term) ||
            lead.company.toLowerCase().includes(term) ||
            lead.email.toLowerCase().includes(term) ||
            lead.source.toLowerCase().includes(term)
          : true;
        const matchesStatus = status === "all" || lead.status.toLowerCase() === status;
        const matchesType = type === "all" || lead.type === type;
        return matchesSearch && matchesStatus && matchesType;
      })
      .sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "value") return b.value - a.value;
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
  }, [leads, search, status, type, sortBy]);

  const handleCreate = () => navigate("/crm/leads/create");

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(filtered.map(lead => lead.id));
    } else {
      setSelectedLeads([]);
    }
  };

  const handleSelectLead = (leadId: string, checked: boolean) => {
    if (checked) {
      setSelectedLeads(prev => [...prev, leadId]);
    } else {
      setSelectedLeads(prev => prev.filter(id => id !== leadId));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLeads.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedLeads.length} leads?`)) {
      try {
        for (const leadId of selectedLeads) {
          await deleteLead.mutateAsync(leadId);
        }
        setSelectedLeads([]);
        toast.success(`${selectedLeads.length} leads deleted successfully`);
      } catch (error) {
        toast.error('Failed to delete leads');
      }
    }
  };

  const handleBulkExport = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Company', 'Status', 'Source', 'Value', 'Created'],
      ...filtered
        .filter(lead => selectedLeads.includes(lead.id))
        .map(lead => [
          lead.name,
          lead.email,
          lead.phone,
          lead.company,
          lead.status,
          lead.source,
          lead.value.toString(),
          lead.createdAt
        ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Leads exported successfully');
  };

  const columns: EntityColumn<LeadRow>[] = [
    {
      key: "select",
      header: "",
      render: (lead) => (
        <Checkbox
          checked={selectedLeads.includes(lead.id)}
          onCheckedChange={(checked) => handleSelectLead(lead.id, checked as boolean)}
        />
      ),
    },
    {
      key: "name",
      header: "Lead",
      sortable: true,
      render: (lead) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{lead.name}</span>
            <Badge variant="outline" className={statusTone(lead.status)}>
              {lead.status || "New"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <Mail className="h-3 w-3" /> {lead.email || "—"}
          </p>
        </div>
      ),
    },
    {
      key: "company",
      header: "Company",
      render: (lead) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Building2 className="h-4 w-4" />
          {lead.company || "—"}
        </div>
      ),
    },
    {
      key: "source",
      header: "Source",
      sortable: true,
      render: (lead) => <span className="text-sm text-muted-foreground">{lead.source || "—"}</span>,
    },
    {
      key: "value",
      header: "Value",
      align: "right",
      sortable: true,
      render: (lead) => (
        <span className="font-semibold">
          {lead.value ? `$${Number(lead.value).toLocaleString()}` : "—"}
        </span>
      ),
    },
    {
      key: "phone",
      header: "Contact",
      render: (lead) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="h-4 w-4" />
          {lead.phone || "—"}
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      sortable: true,
      render: (lead) => (
        <span className="text-sm text-muted-foreground">
          {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (lead) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`/crm/leads/${lead.id}`)}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`/crm/leads/${lead.id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Lead
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => deleteLead.mutate(lead.id)}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads"
        description="A live, filterable pipeline of every lead with fast actions."
        meta={[
          { label: "Total", value: leads.length, tone: "info" },
          { label: "Filtered", value: filtered.length, tone: "success" },
          { label: "Selected", value: selectedLeads.length, tone: "warning" },
        ]}
        actions={
          <div className="flex gap-2">
            {selectedLeads.length > 0 && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleBulkExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export ({selectedLeads.length})
                </Button>
                <Button variant="outline" size="sm" onClick={handleBulkDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete ({selectedLeads.length})
                </Button>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={() => navigate('/crm/leads/external-sources')}>
              <Globe className="h-4 w-4 mr-2" />
              External Sources
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/crm/leads/import')}>
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button className="gradient-primary" onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              New Lead
            </Button>
          </div>
        }
      />

      <DataToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search name, company, email, source"
        filters={[
          {
            label: "Status",
            value: status,
            onChange: setStatus,
            options: [
              { label: "All statuses", value: "all" },
              { label: "New", value: "new" },
              { label: "Contacted", value: "contacted" },
              { label: "Qualified", value: "qualified" },
              { label: "Unqualified", value: "unqualified" },
            ],
          },
          {
            label: "Type",
            value: type,
            onChange: setType,
            options: [
              { label: "All types", value: "all" },
              { label: "Inbound", value: "inbound" },
              { label: "Planned", value: "planned" },
            ],
          },
        ]}
        quickFilters={[
          { label: "Inbound", value: "inbound", active: type === "inbound", onToggle: setType },
          { label: "Planned", value: "planned", active: type === "planned", onToggle: setType },
        ]}
        sortValue={sortBy}
        sortOptions={[
          { label: "Recent", value: "recent" },
          { label: "Name", value: "name" },
          { label: "Value", value: "value" },
        ]}
        onSortChange={setSortBy}
        view={view}
        viewOptions={[
          { id: "list", label: "List" },
          { id: "kanban", label: "Kanban" },
          { id: "activities", label: "Activities" },
          { id: "calendar", label: "Calendar" },
        ]}
        onViewChange={(v) => setView(v as ViewType)}
      >
        <div className="flex gap-2 items-center">
          <WorkspaceFilter 
            value={workspaceFilter} 
            onChange={setWorkspaceFilter}
            className="border-blue-200 bg-blue-50"
          />
          <Button variant="outline" size="sm" onClick={() => { setType("all"); setWorkspaceFilter("all"); }}>
            Reset Filters
          </Button>
          {filtered.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleSelectAll(selectedLeads.length !== filtered.length)}
            >
              {selectedLeads.length === filtered.length ? 'Deselect All' : 'Select All'}
            </Button>
          )}
          {selectedLeads.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => setSelectedLeads([])}>
              Clear Selection
            </Button>
          )}
        </div>
      </DataToolbar>

      {view === "list" && (
        <Card className="border-0 shadow-card">
          <CardContent className="p-4 lg:p-6">
            <EntityTable
              data={filtered}
              columns={columns}
              isLoading={isLoading}
              pageSize={10}
              emptyState={
                <EmptyState
                  title="No leads yet"
                  description="Import or create your first lead to get started."
                  actionLabel="Add lead"
                  onAction={handleCreate}
                  icon={<Sparkles className="h-6 w-6" />}
                />
              }
              onRowClick={(row) => navigate(`/crm/leads/${row.id}`)}
            />
          </CardContent>
        </Card>
      )}

      {!isLoading && view === "kanban" && (
        <LeadsKanbanView leads={filtered as any} onCreateLead={handleCreate} />
      )}

      {view === "activities" && <LeadsActivitiesView />}
      {view === "calendar" && <LeadsCalendarView />}

      {isError && (
        <Card>
          <CardContent className="p-6">
            <EmptyState title="Failed to load leads" description="Check connection and try again." muted />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
