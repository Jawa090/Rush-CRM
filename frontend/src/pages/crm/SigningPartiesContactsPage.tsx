import { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus, Sparkles, Mail, Phone, Clock3 } from "lucide-react";
import { useContacts } from "@/hooks/useCrmData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
  title?: string;
  phone?: string;
  email?: string;
  source?: string;
  lastActivity?: string;
};

export default function SigningPartiesContactsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  const { data, isLoading, isError } = useContacts() as { data?: any; isLoading: boolean; isError: boolean };

  const contacts = useMemo(() => {
    const payload = data as any;
    if (!payload) return [] as any[];
    if (Array.isArray(payload)) return payload;
    return payload.data ?? [];
  }, [data]);

  const rows: ContactRow[] = useMemo(() => {
    const term = search.toLowerCase();
    return contacts
      .filter((c: any) => {
        const fullName = `${c.first_name || ""} ${c.last_name || ""}`.trim().toLowerCase();
        const matchesSearch = term
          ? fullName.includes(term) ||
            (c.email || "").toLowerCase().includes(term) ||
            (c.phone || "").toLowerCase().includes(term)
          : true;
        const matchesSource = source === "all" || (c.source || "").toLowerCase() === source;
        return matchesSearch && matchesSource;
      })
      .sort((a: any, b: any) => {
        if (sortBy === "name") return `${a.first_name || ""}${a.last_name || ""}`.localeCompare(`${b.first_name || ""}${b.last_name || ""}`);
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      })
      .map((c: any) => ({
        id: c.id,
        name: `${c.first_name || ""} ${c.last_name || ""}`.trim() || c.full_name || "Unnamed",
        title: c.title || c.position,
        phone: c.phone,
        email: c.email,
        source: c.source,
        lastActivity: c.last_activity || c.activity,
      }));
  }, [contacts, search, source, sortBy]);

  const columns: EntityColumn<ContactRow>[] = [
    {
      key: "name",
      header: "Contact",
      sortable: true,
      render: (c) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{c.name}</span>
            {c.title && <Badge variant="outline" className="bg-muted/40">{c.title}</Badge>}
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <Mail className="h-3 w-3" /> {c.email || "—"}
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
      key: "source",
      header: "Source",
      sortable: true,
      render: (c) => <span className="text-sm text-muted-foreground">{c.source || "—"}</span>,
    },
    {
      key: "lastActivity",
      header: "Last activity",
      render: (c) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock3 className="h-4 w-4" />
          {c.lastActivity || "—"}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab.path}
            variant={location.pathname === tab.path ? "secondary" : "ghost"}
            size="sm"
            className="rounded-full"
            onClick={() => navigate(tab.path)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <PageHeader
        title="Signing party contacts"
        description="Link and manage all contacts used for signing workflows."
        meta={[
          { label: "Total", value: contacts.length, tone: "info" },
          { label: "Filtered", value: rows.length, tone: "success" },
        ]}
        actions={
          <Button className="gradient-primary" onClick={() => navigate("/crm/customers/signing-parties/contacts/create")}>
            <Plus className="mr-2 h-4 w-4" /> New signing contact
          </Button>
        }
      />

      <DataToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search name, email, phone"
        filters={[
          {
            label: "Source",
            value: source,
            onChange: setSource,
            options: [
              { label: "All sources", value: "all" },
              { label: "Web", value: "web" },
              { label: "Referral", value: "referral" },
              { label: "Email", value: "email" },
              { label: "Event", value: "event" },
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
        <Button variant="outline" size="sm" onClick={() => { setSearch(""); setSource("all"); }}>
          Reset
        </Button>
      </DataToolbar>

      <Card className="border-0 shadow-card">
        <CardContent className="p-4 lg:p-6">
          <EntityTable
            data={rows}
            columns={columns}
            isLoading={isLoading}
            pageSize={10}
            emptyState={
              <EmptyState
                title="No signing contacts yet"
                description="Create a contact to attach to agreements and deals."
                actionLabel="Add contact"
                onAction={() => navigate("/crm/customers/signing-parties/contacts/create")}
                icon={<Sparkles className="h-6 w-6" />}
              />
            }
            onRowClick={(row) => navigate(`/crm/customers/contacts/${row.id}`)}
          />
        </CardContent>
      </Card>

      {isError && (
        <Card>
          <CardContent className="p-6">
            <EmptyState title="Failed to load contacts" description="Check connection and try again." muted />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
