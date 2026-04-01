import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Building2, Phone, Mail, Sparkles } from "lucide-react";
import { useCompanies } from "@/hooks/useCrmData";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/crm/ui/PageHeader";
import { DataToolbar } from "@/components/crm/ui/DataToolbar";
import { EntityTable, EntityColumn } from "@/components/crm/ui/EntityTable";
import { EmptyState } from "@/components/crm/ui/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CompaniesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  const { data, isLoading, isError } = useCompanies() as { data?: any; isLoading: boolean; isError: boolean };

  const companies = useMemo(() => {
    const payload = data as any;
    if (!payload) return [] as any[];
    if (Array.isArray(payload)) return payload;
    return payload.data ?? [];
  }, [data]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return companies
      .filter((c: any) => {
        const matchesSearch = term
          ? (c.name || "").toLowerCase().includes(term) ||
            (c.email || "").toLowerCase().includes(term) ||
            (c.industry || "").toLowerCase().includes(term)
          : true;
        const matchesIndustry = industry === "all" || (c.industry || "").toLowerCase() === industry;
        return matchesSearch && matchesIndustry;
      })
      .sort((a: any, b: any) => {
        if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });
  }, [companies, search, industry, sortBy]);

  const columns: EntityColumn<any>[] = [
    {
      key: "name",
      header: "Company",
      sortable: true,
      render: (c) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{c.name}</span>
            {c.company_type && <Badge variant="outline" className="bg-muted/40">{c.company_type}</Badge>}
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <Building2 className="h-3 w-3" /> {c.industry || "—"}
          </p>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (c) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="h-4 w-4" />
          {c.phone || "—"}
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (c) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-4 w-4" />
          {c.email || "—"}
        </div>
      ),
    },
    {
      key: "company_type",
      header: "Type",
      render: (c) => <span className="text-sm text-muted-foreground">{c.company_type || "—"}</span>,
    },
    {
      key: "created_at",
      header: "Created",
      sortable: true,
      render: (c) => (
        <span className="text-sm text-muted-foreground">
          {c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Companies"
        description="Directory of all accounts with fast filters and responsive cards."
        meta={[
          { label: "Total", value: companies.length, tone: "info" },
          { label: "Filtered", value: filtered.length, tone: "success" },
        ]}
        actions={
          <Button className="gradient-primary" onClick={() => navigate("/crm/customers/companies/create")}>
            <Plus className="mr-2 h-4 w-4" />
            New Company
          </Button>
        }
      />

      <DataToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search company, email, industry"
        filters={[
          {
            label: "Industry",
            value: industry,
            onChange: setIndustry,
            options: [
              { label: "All industries", value: "all" },
              { label: "Construction", value: "construction" },
              { label: "Manufacturing", value: "manufacturing" },
              { label: "Professional Services", value: "services" },
              { label: "Technology", value: "technology" },
            ],
          },
        ]}
        sortValue={sortBy}
        sortOptions={[
          { label: "Recent", value: "recent" },
          { label: "Name", value: "name" },
        ]}
        onSortChange={setSortBy}
      >
        <Button variant="outline" size="sm" onClick={() => { setSearch(""); setIndustry("all"); }}>
          Reset
        </Button>
      </DataToolbar>

      <Card className="border-0 shadow-card">
        <CardContent className="p-4 lg:p-6">
          <EntityTable
            data={filtered}
            columns={columns}
            isLoading={isLoading}
            pageSize={10}
            emptyState={
              <EmptyState
                title="No companies yet"
                description="Add your first company to start associating deals and contacts."
                actionLabel="Add company"
                onAction={() => navigate("/crm/customers/companies/create")}
                icon={<Sparkles className="h-6 w-6" />}
              />
            }
            onRowClick={(row) => navigate(`/crm/customers/companies/${row.id}`)}
          />
        </CardContent>
      </Card>

      {isError && (
        <Card>
          <CardContent className="p-6">
            <EmptyState title="Failed to load companies" description="Check connection and try again." muted />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
