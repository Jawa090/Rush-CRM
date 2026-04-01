import { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Plus, 
  Sparkles, 
  Mail, 
  Phone, 
  Clock3, 
  Building2, 
  Download, 
  Users, 
  AlertCircle, 
  Loader2,
  Filter
} from "lucide-react";
import { useSigningParties } from "@/hooks/useCrmData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/crm/ui/PageHeader";
import { DataToolbar } from "@/components/crm/ui/DataToolbar";
import { EntityTable, EntityColumn } from "@/components/crm/ui/EntityTable";
import { EmptyState } from "@/components/crm/ui/EmptyState";

const tabs = [
  { label: "Sign and manage", path: "/crm/customers/signing-parties" },
  { label: "My vault", path: "/crm/customers/signing-parties/vault" },
  { label: "Contacts", path: "/crm/customers/signing-parties/contacts" },
];

type ContactRow = {
  id: string;
  name: string;
  company: string;
  title?: string;
  phone?: string;
  email?: string;
  source?: string;
  lastActivity?: string;
};

export default function SigningPartiesContactsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  const { data, isLoading, isError } = useSigningParties() as { data?: any[]; isLoading: boolean; isError: boolean };

  const contacts = useMemo(() => {
    const dataArray = (data as any)?.data || data || [];
    return Array.isArray(dataArray) ? dataArray : [];
  }, [data]);

  const rows: ContactRow[] = useMemo(() => {
    const term = searchQuery.toLowerCase();
    return contacts
      .filter((c: any) => {
        const fullName = `${c.first_name || ""} ${c.last_name || ""}`.trim().toLowerCase();
        const matchesSearch = term
          ? fullName.includes(term) ||
            (c.email || "").toLowerCase().includes(term) ||
            (c.phone || "").toLowerCase().includes(term) ||
            (c.company_name || "").toLowerCase().includes(term)
          : true;
        const matchesSource = sourceFilter === "all" || (c.source || "").toLowerCase() === sourceFilter.toLowerCase();
        return matchesSearch && matchesSource;
      })
      .sort((a: any, b: any) => {
        if (sortBy === "name") return `${a.first_name || ""}${a.last_name || ""}`.localeCompare(`${b.first_name || ""}${b.last_name || ""}`);
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      })
      .map((c: any) => ({
        id: c.id,
        company: c.company_name || "—",
        name: `${c.first_name || ""} ${c.last_name || ""}`.trim() || c.full_name || "Unnamed",
        title: c.title || c.position,
        phone: c.phone,
        email: c.email,
        source: c.source,
        lastActivity: c.last_activity || "No recent activity",
      }));
  }, [contacts, searchQuery, sourceFilter, sortBy]);

  const columns: EntityColumn<ContactRow>[] = [
    {
      key: "name",
      header: "Contact",
      sortable: true,
      render: (c) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{c.name}</span>
            {c.title && <Badge variant="outline" className="bg-muted/40 font-normal">{c.title}</Badge>}
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <Mail className="h-3.5 w-3.5" /> {c.email || "—"}
          </p>
        </div>
      ),
    },
    {
      key: "company",
      header: "Company",
      render: (c) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Building2 className="h-4 w-4" />
          {c.company}
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
      key: "source",
      header: "Source",
      sortable: true,
      render: (c) => (
        <Badge variant="outline" className="text-xs font-normal capitalize">
          {c.source || "Direct"}
        </Badge>
      ),
    },
    {
      key: "lastActivity",
      header: "Last activity",
      render: (c) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock3 className="h-4 w-4 text-muted-foreground/60" />
          {c.lastActivity}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        {tabs.map((tab) => (
          <Button
            key={tab.path}
            variant={location.pathname === tab.path ? "secondary" : "ghost"}
            size="sm"
            className="rounded-full transition-all duration-300 hover:bg-secondary/80 shadow-sm"
            onClick={() => navigate(tab.path)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <PageHeader
        title="Signing party contacts"
        description="Manage your signing parties and their contact information"
        meta={[
          { label: "Total Contacts", value: rows.length, tone: rows.length > 0 ? "info" : "default" },
          { label: "Active Organizations", value: new Set(rows.map(r => r.company).filter(c => c !== "—")).size, tone: "success" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden sm:flex border-primary/20 hover:bg-primary/5">
              <Download className="mr-2 h-4 w-4 text-primary" /> Export
            </Button>
            <Button 
              className="gradient-primary shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95" 
              onClick={() => navigate("/crm/customers/signing-parties/contacts/create")}
            >
              <Plus className="mr-2 h-4 w-4" /> New signing contact
            </Button>
          </div>
        }
      />

      <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 tracking-tight">Active Contacts</CardTitle>
          </div>
          <CardDescription>View and manage all your signing contacts in one place</CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 pt-6">
          <DataToolbar
            search={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search signing contacts..."
            filters={[
              {
                label: "Source",
                value: sourceFilter,
                onChange: setSourceFilter,
                options: [
                  { label: "All sources", value: "all" },
                  { label: "Web", value: "web" },
                  { label: "Referral", value: "referral" },
                  { label: "Email", value: "email" },
                  { label: "Event", value: "event" },
                ],
              },
            ]}
          />

          <div className="mt-4 rounded-xl border bg-background/50 overflow-hidden shadow-inner">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary/60" />
                <span className="ml-3 text-lg font-medium text-muted-foreground">Loading contacts...</span>
              </div>
            ) : isError ? (
              <div className="text-center py-20 bg-destructive/5 mx-4 my-4 rounded-xl border border-destructive/20">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-bold text-destructive">Connection failed</h3>
                <p className="text-muted-foreground mt-2">Could not retrieve contacts. Please try again later.</p>
                <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                  Retry Connection
                </Button>
              </div>
            ) : rows.length === 0 ? (
              <EmptyState 
                title={searchQuery || sourceFilter !== "all" ? "No results found" : "No signing contacts yet"}
                description={searchQuery || sourceFilter !== "all" ? "Try adjusting your search or filters to find what you're looking for." : "Start building your client database by adding your first signing contact."}
                actionLabel={searchQuery || sourceFilter !== "all" ? "Reset filters" : "Create first contact"}
                onAction={() => {
                  if (searchQuery || sourceFilter !== "all") {
                    setSearchQuery("");
                    setSourceFilter("all");
                  } else {
                    navigate("/crm/customers/signing-parties/contacts/create");
                  }
                }}
                icon={searchQuery || sourceFilter !== "all" ? <Filter className="h-12 w-12 text-muted-foreground/40" /> : <Users className="h-12 w-12 text-primary/40" />}
                className="py-32"
              />
            ) : (
              <EntityTable
                columns={columns}
                data={rows}
                onRowClick={(row) => navigate(`/crm/customers/contacts/${row.id}`)}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
