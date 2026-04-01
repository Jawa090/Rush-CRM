import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Mail, Phone, Building2, Sparkles, MoreHorizontal, Edit, Trash2, Eye, Download, Upload } from "lucide-react";
import { useContacts, useDeleteContact } from "@/hooks/useCrmData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/crm/ui/PageHeader";
import { DataToolbar } from "@/components/crm/ui/DataToolbar";
import { EntityTable, EntityColumn } from "@/components/crm/ui/EntityTable";
import { EmptyState } from "@/components/crm/ui/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function ContactsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  const { data, isLoading, isError } = useContacts() as { data?: any; isLoading: boolean; isError: boolean };
  const deleteContact = useDeleteContact();

  const contacts = useMemo(() => {
    const payload = data as any;
    if (!payload) return [] as any[];
    if (Array.isArray(payload)) return payload;
    return payload.data ?? [];
  }, [data]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return contacts
      .filter((c: any) => {
        const fullName = `${c.first_name || ""} ${c.last_name || ""}`.trim().toLowerCase();
        const matchesSearch = term
          ? fullName.includes(term) ||
            (c.email || "").toLowerCase().includes(term) ||
            (c.phone || "").toLowerCase().includes(term) ||
            (c.position || "").toLowerCase().includes(term) ||
            (c.company_name || "").toLowerCase().includes(term)
          : true;
        const matchesSource = source === "all" || (c.source || "").toLowerCase() === source;
        return matchesSearch && matchesSource;
      })
      .sort((a: any, b: any) => {
        if (sortBy === "name") return `${a.first_name || ""}${a.last_name || ""}`.localeCompare(`${b.first_name || ""}${b.last_name || ""}`);
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });
  }, [contacts, search, source, sortBy]);

  const columns: EntityColumn<any>[] = [
    {
      key: "name",
      header: "Contact",
      sortable: true,
      render: (c) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{`${c.first_name || ""} ${c.last_name || ""}`.trim() || "Unnamed"}</span>
            {c.position && <Badge variant="outline" className="bg-muted/40">{c.position}</Badge>}
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <Mail className="h-3 w-3" /> {c.email || "—"}
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
          {c.company_name || c.company || "—"}
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
      key: "type",
      header: "Type",
      sortable: true,
      render: (c) => (
        <Badge variant="secondary" className="capitalize">
          {c.contact_type || "Contact"}
        </Badge>
      ),
    },
    {
      key: "source",
      header: "Source",
      sortable: true,
      render: (c) => <span className="text-sm text-muted-foreground">{c.source || "—"}</span>,
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
        title="Contacts"
        description="Live list of every relationship with fast search and filters."
        meta={[
          { label: "Total", value: contacts.length, tone: "info" },
          { label: "Filtered", value: filtered.length, tone: "success" },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/crm/leads/import")}>
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button className="gradient-primary" onClick={() => navigate("/crm/customers/contacts/create")}> 
              <Plus className="mr-2 h-4 w-4" />
              New Contact
            </Button>
          </div>
        }
      />

      <DataToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search name, company, email, phone"
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
            data={filtered}
            columns={columns}
            isLoading={isLoading}
            pageSize={10}
            emptyState={
              <EmptyState
                title="No contacts yet"
                description="Create your first contact and start nurturing relationships."
                actionLabel="Add contact"
                onAction={() => navigate("/crm/customers/contacts/create")}
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
