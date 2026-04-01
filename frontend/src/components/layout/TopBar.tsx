import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell, Search, Plus, ChevronDown, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SoftphoneToggleButton } from "@/components/telephony/SoftphoneToggleButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { leadsApi, contactsApi, companiesApi, dealsApi, attendanceApi, leaveApi, employeesApi } from "@/lib/api";
import { Card } from "@/components/ui/card";

export function TopBar() {
  const navigate = useNavigate();
  const { profile, userRole, signOut } = useAuth();
  const { organization } = useOrganization();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleDisplay = (role: string | undefined) => {
    if (!role) return 'User';
    return role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const { data: searchResults, isFetching: searching } = useQuery({
    queryKey: ["global-search", searchTerm],
    enabled: searchTerm.trim().length > 1,
    queryFn: async () => {
      const term = searchTerm.trim();
      const [leads, contacts, companies, deals] = await Promise.all([
        leadsApi.getAll({ search: term, limit: 5 }),
        contactsApi.getAll({ search: term, limit: 5 }),
        companiesApi.getAll({ search: term, limit: 5 }),
        dealsApi.getAll({ search: term, limit: 5 }),
      ]);
      const toArray = (res: any) => (Array.isArray(res) ? res : res?.data ?? []);
      return {
        leads: toArray(leads),
        contacts: toArray(contacts),
        companies: toArray(companies),
        deals: toArray(deals),
      };
    },
  });

  const { data: notifData } = useQuery({
    queryKey: ["topbar", "notifications"],
    queryFn: async () => {
      const [leaves, attendance, employees] = await Promise.all([
        leaveApi.getAll({ status: "pending", limit: 5 }),
        attendanceApi.getAll({ date: new Date().toISOString().split("T")[0], limit: 10 }),
        employeesApi.getAll({ limit: 5 }),
      ]);
      const toArray = (res: any) => (Array.isArray(res) ? res : res?.data ?? []);
      const leaveItems = toArray(leaves);
      const lateItems = toArray(attendance).filter((a: any) => (a.status || "").toLowerCase() === "late");
      const employeeItems = toArray(employees);
      return { leaveItems, lateItems, employeeItems };
    },
  });

  const unreadCount = useMemo(() => {
    if (!notifData) return 0;
    return notifData.leaveItems.length + notifData.lateItems.length + notifData.employeeItems.length;
  }, [notifData]);

  const markAllRead = () => setReadIds(new Set(searchResults ? Object.values(searchResults).flat().map((r: any) => String(r.id)) : []));

  const resultsVisible = searchFocused && searchTerm.trim().length > 1;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card px-6">
      {/* Organization Name + Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        {organization && (
          <span className="text-sm font-medium text-muted-foreground hidden md:block">
            {organization.name}
          </span>
        )}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search leads, contacts, deals..."
            className="pl-9 bg-secondary border-0 focus-visible:ring-1"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
          />
          {resultsVisible && (
            <Card className="absolute mt-2 w-full shadow-lg border border-border bg-popover z-20">
              <div className="flex items-center justify-between px-3 py-2 text-xs text-muted-foreground uppercase tracking-wide">
                <span>Quick results</span>
                {searching && <Loader2 className="h-3 w-3 animate-spin" />}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y">
                {searchResults && Object.values(searchResults).every((arr) => (arr as any[]).length === 0) && (
                  <div className="px-3 py-2 text-sm text-muted-foreground">No matches</div>
                )}
                {searchResults?.leads?.length ? (
                  <div className="px-3 py-2 space-y-1">
                    <p className="text-[11px] uppercase text-muted-foreground font-semibold">Leads</p>
                    {searchResults.leads.map((lead: any) => (
                      <button
                        key={lead.id}
                        className="w-full text-left px-2 py-1.5 rounded hover:bg-muted"
                        onMouseDown={() => navigate(`/crm/leads/${lead.id}`)}
                      >
                        <div className="text-sm font-medium">{lead.name || lead.title || 'Lead'}</div>
                        <div className="text-xs text-muted-foreground">{lead.email || lead.source || ''}</div>
                      </button>
                    ))}
                  </div>
                ) : null}
                {searchResults?.contacts?.length ? (
                  <div className="px-3 py-2 space-y-1">
                    <p className="text-[11px] uppercase text-muted-foreground font-semibold">Contacts</p>
                    {searchResults.contacts.map((contact: any) => (
                      <button
                        key={contact.id}
                        className="w-full text-left px-2 py-1.5 rounded hover:bg-muted"
                        onMouseDown={() => navigate(`/crm/customers/contacts/${contact.id}`)}
                      >
                        <div className="text-sm font-medium">{`${contact.first_name || ''} ${contact.last_name || ''}`.trim() || contact.full_name || 'Contact'}</div>
                        <div className="text-xs text-muted-foreground">{contact.email || contact.phone || ''}</div>
                      </button>
                    ))}
                  </div>
                ) : null}
                {searchResults?.companies?.length ? (
                  <div className="px-3 py-2 space-y-1">
                    <p className="text-[11px] uppercase text-muted-foreground font-semibold">Companies</p>
                    {searchResults.companies.map((company: any) => (
                      <button
                        key={company.id}
                        className="w-full text-left px-2 py-1.5 rounded hover:bg-muted"
                        onMouseDown={() => navigate(`/crm/customers/companies/${company.id}`)}
                      >
                        <div className="text-sm font-medium">{company.name || 'Company'}</div>
                        <div className="text-xs text-muted-foreground">{company.industry || company.website || ''}</div>
                      </button>
                    ))}
                  </div>
                ) : null}
                {searchResults?.deals?.length ? (
                  <div className="px-3 py-2 space-y-1">
                    <p className="text-[11px] uppercase text-muted-foreground font-semibold">Deals</p>
                    {searchResults.deals.map((deal: any) => (
                      <button
                        key={deal.id}
                        className="w-full text-left px-2 py-1.5 rounded hover:bg-muted"
                        onMouseDown={() => navigate(`/crm/deals/${deal.id}`)}
                      >
                        <div className="text-sm font-medium">{deal.title || deal.name || 'Deal'}</div>
                        <div className="text-xs text-muted-foreground">{deal.stage || deal.status || ''}</div>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="gradient-primary gap-2">
              <Plus className="h-4 w-4" />
              Quick Add
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Create New</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/crm/leads/create')}>New Lead</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/crm/customers/contacts/create')}>New Contact</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/crm/deals/create')}>New Deal</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/crm/customers/companies/create')}>New Company</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/hrms/employees')}>New Employee</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/inventory/products')}>New Product</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Softphone Toggle */}
        <SoftphoneToggleButton />

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative" onClick={() => navigate('/hrms/notifications')}>
          <Bell className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
            {unreadCount}
          </span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 pl-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback>{getInitials(profile?.full_name || 'User')}</AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium">{profile?.full_name || 'User'}</span>
                <span className="text-xs text-muted-foreground">{getRoleDisplay(userRole?.role)}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/settings')}>Profile Settings</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/admin/users')}>Organization Settings</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={handleSignOut}>
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
