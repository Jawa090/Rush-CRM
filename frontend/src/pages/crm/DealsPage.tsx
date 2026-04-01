import { useMemo, useState, Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Sparkles, Phone, Mail, Building2, Layers, MoreHorizontal, Edit, Trash2, Eye, Download, Upload } from "lucide-react";
import { useDeals, useDeleteDeal } from "@/hooks/useCrmData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/crm/ui/PageHeader";
import { DataToolbar } from "@/components/crm/ui/DataToolbar";
import { EntityTable, EntityColumn } from "@/components/crm/ui/EntityTable";
import { EmptyState } from "@/components/crm/ui/EmptyState";
import { AdvancedSearch } from "@/components/crm/ui/AdvancedSearch";
import { useCustomDialog } from "@/contexts/DialogContext";
import { DealsKanbanView } from "@/components/crm/deals/DealsKanbanView";
import { DealsActivitiesView } from "@/components/crm/deals/DealsActivitiesView";
import { DealsCalendarView } from "@/components/crm/deals/DealsCalendarView";
import { toast } from "sonner";

const WorkflowsPage = lazy(() => import("@/pages/automation/WorkflowsPage"));

type ViewType = "kanban" | "list" | "activities" | "calendar" | "automation";

const statusTone = (status?: string) => {
  const s = (status || "").toLowerCase();
  if (s === "won" || s.includes("close")) return "bg-emerald-500/10 text-emerald-700 border-emerald-200";
  if (s === "lost" || s.includes("lost")) return "bg-rose-500/10 text-rose-700 border-rose-200";
  if (s.includes("proposal")) return "bg-primary/10 text-primary border-primary/20";
  return "bg-amber-500/10 text-amber-700 border-amber-200";
};

type DealRow = {
  id: string;
  name: string;
  stage: string;
  status: string;
  value: number;
  company: string;
  contact: string;
  email: string;
  phone: string;
  createdAt: string;
  projectType?: string;
};

export default function DealsPage() {
  const navigate = useNavigate();
  const { confirm } = useCustomDialog();
  const [view, setView] = useState<ViewType>("list");
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("all");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [selectedDeals, setSelectedDeals] = useState<string[]>([]);

  const { data: dbDeals, isLoading, isError } = useDeals();
  const deleteDeal = useDeleteDeal();

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDeals(filtered.map(deal => deal.id));
    } else {
      setSelectedDeals([]);
    }
  };

  const handleSelectDeal = (dealId: string, checked: boolean) => {
    if (checked) {
      setSelectedDeals(prev => [...prev, dealId]);
    } else {
      setSelectedDeals(prev => prev.filter(id => id !== dealId));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedDeals.length === 0) return;
    
    if (await confirm(`Are you sure you want to delete ${selectedDeals.length} deals?`, { variant: 'destructive', title: 'Confirm Bulk Deletion' })) {
      try {
        for (const dealId of selectedDeals) {
          await deleteDeal.mutateAsync(dealId);
        }
        setSelectedDeals([]);
        toast.success(`${selectedDeals.length} deals deleted successfully`);
      } catch (error) {
        // Error is handled by the mutate call above
      }
    }
  };

  const handleBulkExport = () => {
    const csvContent = [
      ['Name', 'Company', 'Contact', 'Value', 'Stage', 'Status', 'Created'],
      ...filtered
        .filter(deal => selectedDeals.includes(deal.id))
        .map(deal => [
          deal.name,
          deal.company,
          deal.contact,
          deal.value.toString(),
          deal.stage,
          deal.status,
          deal.createdAt
        ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deals-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Deals exported successfully');
  };

  const deals: DealRow[] = useMemo(() => {
    return (dbDeals || []).map((d: any) => {
      const stageKey = (d.stage || "qualification").toLowerCase();
      
      const companyName = d.company || d.companyName || d.company_name || "";
      const contactName = d.contactName || d.contact_name || d.name || "";
      const email = d.contactEmail || d.email || d.companyEmail || d.company_email || "";
      const phone = d.contactPhone || d.phone || d.companyPhone || d.company_phone || "";

      return {
        id: d.id,
        name: d.title || "Untitled Deal",
        stage: stageKey,
        status: d.status || d.stage || "open",
        value: Number(d.value) || 0,
        company: companyName,
        contact: contactName,
        email: email,
        phone: phone,
        createdAt: d.created_at,
        projectType: d.project_type,
      };
    });
  }, [dbDeals]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return deals
      .filter((deal) => {
        const matchesSearch = term
          ? deal.name.toLowerCase().includes(term) ||
            deal.company.toLowerCase().includes(term) ||
            deal.contact.toLowerCase().includes(term) ||
            deal.email.toLowerCase().includes(term)
          : true;
        const matchesStage = stage === "all" || deal.stage === stage;
        const matchesStatus = status === "all" || deal.status.toLowerCase() === status;
        return matchesSearch && matchesStage && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "value") return b.value - a.value;
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
  }, [deals, search, stage, status, sortBy]);

  const columns: EntityColumn<DealRow>[] = [
    {
      key: "name",
      header: "Deal",
      sortable: true,
      render: (deal) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{deal.name}</span>
            <Badge variant="outline" className="bg-muted/50">
              {deal.stage.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <Mail className="h-3 w-3" /> 
            {deal.email ? (
              <a href={`mailto:${deal.email}`} className="hover:text-primary hover:underline transition-colors" onClick={(e) => e.stopPropagation()}>
                {deal.email}
              </a>
            ) : (
              "—"
            )}
          </p>
        </div>
      ),
    },
    {
      key: "company",
      header: "Company",
      render: (deal) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Building2 className="h-4 w-4" />
          {deal.company || "—"}
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      render: (deal) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="h-4 w-4" />
          {deal.contact || deal.phone ? (
            <a href={`tel:${deal.phone || deal.contact}`} className="hover:text-primary hover:underline transition-colors" onClick={(e) => e.stopPropagation()}>
              {deal.contact || deal.phone}
            </a>
          ) : (
            "—"
          )}
        </div>
      ),
    },
    {
      key: "value",
      header: "Value",
      align: "right",
      sortable: true,
      render: (deal) => <span className="font-semibold">{deal.value ? `$${Number(deal.value).toLocaleString()}` : "—"}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (deal) => (
        <Badge variant="outline" className={statusTone(deal.status)}>
          {deal.status || "Open"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      sortable: true,
      render: (deal) => (
        <span className="text-sm text-muted-foreground">
          {deal.createdAt ? new Date(deal.createdAt).toLocaleDateString() : "—"}
        </span>
      ),
    },
  ];

  const handleCreate = () => navigate("/crm/deals/create");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Deals"
        description="Interactive pipeline of every deal with instant filters and automation shortcuts."
        meta={[
          { label: "Total", value: deals.length, tone: "info" },
          { label: "Filtered", value: filtered.length, tone: "success" },
          { label: "Selected", value: selectedDeals.length, tone: "warning" },
        ]}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {selectedDeals.length > 0 && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleBulkExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export ({selectedDeals.length})
                </Button>
                <Button variant="outline" size="sm" onClick={handleBulkDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete ({selectedDeals.length})
                </Button>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={() => navigate("/crm/leads/import")}>
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => setView(view === "automation" ? "list" : "automation")}>
              <Layers className="h-4 w-4" />
              Automation
            </Button>
            <Button className="gradient-primary" onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              New Deal
            </Button>
          </div>
        }
      />

      <DataToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search deal, company, contact, email"
        filters={[
          {
            label: "Stage",
            value: stage,
            onChange: setStage,
            options: [
              { label: "All stages", value: "all" },
              { label: "Qualification", value: "qualification" },
              { label: "Discovery", value: "discovery" },
              { label: "Proposal sent", value: "proposal_sent" },
              { label: "Negotiation", value: "negotiation" },
              { label: "Close deal", value: "close_deal" },
            ],
          },
          {
            label: "Status",
            value: status,
            onChange: setStatus,
            options: [
              { label: "All", value: "all" },
              { label: "Open", value: "open" },
              { label: "Won", value: "won" },
              { label: "Lost", value: "lost" },
            ],
          },
        ]}
        quickFilters={[
          { label: "Won", value: "won", active: status === "won", onToggle: setStatus },
          { label: "Open", value: "open", active: status === "open", onToggle: setStatus },
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
          { id: "automation", label: "Automation" },
        ]}
        onViewChange={(v) => setView(v as ViewType)}
      >
        <Button variant="outline" size="sm" onClick={() => { setStage("all"); setStatus("all"); setSearch(""); }}>
          Reset
        </Button>
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
                  title="No deals yet"
                  description="Create or import deals to populate your pipeline."
                  actionLabel="Add deal"
                  onAction={handleCreate}
                  icon={<Sparkles className="h-6 w-6" />}
                />
              }
              onRowClick={(row) => navigate(`/crm/deals/${row.id}`)}
            />
          </CardContent>
        </Card>
      )}

      {!isLoading && view === "kanban" && (
        <DealsKanbanView deals={filtered as any} selectedStage={stage === "all" ? null : stage} onStageSelect={(s) => setStage(s || "all")} />
      )}

      {view === "activities" && <DealsActivitiesView />}
      {view === "calendar" && <DealsCalendarView />}

      {view === "automation" && (
        <Suspense fallback={<div className="text-center py-8 text-muted-foreground">Loading automation...</div>}>
          <WorkflowsPage />
        </Suspense>
      )}

      {isError && (
        <Card>
          <CardContent className="p-6">
            <EmptyState title="Failed to load deals" description="Check connection and try again." muted />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
