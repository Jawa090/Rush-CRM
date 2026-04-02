import { useState, useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Handshake,
  Package,
  Warehouse,
  Calendar,
  Mail,
  Mailbox,
  Settings,
  ChevronDown,
  ChevronRight,
  Building2,
  Briefcase,
  DollarSign,
  UserCheck,
  TrendingUp,
  ShoppingCart,
  Truck,
  BarChart3,
  FolderOpen,
  UsersRound,
  ClipboardList,
  FileText,
  Bell,
  Shield,
  Lock,
  LogIn,
  Phone,
  CheckSquare,
  Zap,
  UserPlus2,
  FolderKanban,
  Megaphone,
  Target,
  ListFilter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface NestedChild {
  title: string;
  href: string;
  hasNested?: boolean;
}

interface NavSubItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  nestedChildren?: NestedChild[];
}

interface NavItem {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  children?: NavSubItem[];
}

const navigation: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Tasks & Projects",
    href: "/tasks",
    icon: FolderKanban,
  },
  {
    title: "Collaboration",
    icon: UsersRound,
    children: [
      { title: "Calendar", href: "/collaboration/calendar", icon: Calendar },
      { title: "Drive", href: "/collaboration/drive", icon: FolderOpen },
      { title: "Mail", href: "/collaboration/mail", icon: Mail },
      { title: "Unibox", href: "/collaboration/unibox", icon: Mailbox },
      { title: "Workgroups", href: "/collaboration/workgroups", icon: Users },
    ],
  },
  {
    title: "CRM",
    icon: TrendingUp,
    children: [
      { title: "Leads", href: "/crm/leads", icon: UserPlus },
      { title: "Deals", href: "/crm/deals", icon: Handshake },
      { 
        title: "Customers", 
        href: "/crm/customers", 
        icon: Building2,
        nestedChildren: [
          { title: "Contacts", href: "/crm/customers/contacts" },
          { title: "Companies", href: "/crm/customers/companies" },
          { title: "Signing parties", href: "/crm/customers/signing-parties", hasNested: true },
          { title: "Vendors", href: "/inventory/vendors", hasNested: false },
        ]
      },
      { title: "Sales", href: "/crm/sales", icon: DollarSign },
      { title: "Analytics", href: "/crm/analytics", icon: BarChart3 },
    ],
  },
  {
    title: "HRMS",
    icon: Briefcase,
    children: [
      { title: "Dashboard", href: "/hrms", icon: BarChart3 },
      { title: "Attendance", href: "/hrms/attendance", icon: ClipboardList },
      { title: "Employees", href: "/hrms/employees", icon: UserCheck },
      { title: "Leave Management", href: "/hrms/leave", icon: Calendar },
      { title: "Payroll", href: "/hrms/payroll", icon: DollarSign },
      { title: "Notifications", href: "/hrms/notifications", icon: Bell },
    ],
  },
  {
    title: "Inventory",
    icon: Package,
    children: [
      { title: "Dashboard", href: "/inventory", icon: BarChart3 },
      { title: "Products", href: "/inventory/products", icon: ShoppingCart },
      { title: "Stock Tracking", href: "/inventory/stock", icon: Package },
      { title: "Purchase Orders", href: "/inventory/purchase-orders", icon: FileText },
      { title: "Vendors", href: "/inventory/vendors", icon: Truck },
      { title: "Warehouses", href: "/inventory/warehouses", icon: Warehouse },
      { title: "Assignments", href: "/inventory/assignments", icon: Users },
    ],
  },
  {
    title: "Marketing",
    icon: Megaphone,
    children: [
      { title: "Dashboard", href: "/marketing", icon: LayoutDashboard },
      { title: "Campaigns", href: "/marketing/campaigns", icon: Mail },
      { title: "Lists & Segments", href: "/marketing/lists", icon: ListFilter },
      { title: "Forms", href: "/marketing/forms", icon: FileText },
      { title: "Sequences", href: "/marketing/sequences", icon: Zap },
      { title: "Analytics", href: "/marketing/analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Automation",
    icon: Zap,
    children: [
      { title: "Workflows", href: "/automation/workflows", icon: Zap },
    ],
  },
  {
    title: "Admin Portal",
    icon: Shield,
    children: [
      { title: "User Management", href: "/admin/users", icon: Users },
      { title: "Role Assignments", href: "/admin/roles", icon: UserCheck },
      { title: "Permissions", href: "/admin/permissions", icon: Lock },
      { title: "Join Requests", href: "/admin/join-requests", icon: UserPlus2 },
      { title: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { userRole } = useAuth();
  const [openSections, setOpenSections] = useState<string[]>(["Collaboration", "CRM"]);
  const [expandedSubItems, setExpandedSubItems] = useState<string[]>([]);

  const isAdmin = userRole?.role === 'super_admin' || userRole?.role === 'admin';

  // Filter out Admin Portal for non-admin users
  const filteredNavigation = useMemo(() => {
    return navigation.filter(item => {
      if (item.title === "Admin Portal" && !isAdmin) return false;
      return true;
    });
  }, [isAdmin]);

  const toggleSection = (title: string) => {
    setOpenSections((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const toggleSubItem = (title: string) => {
    setExpandedSubItems((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const isActive = (href: string) => location.pathname === href;
  const isSectionActive = (children?: { href: string }[]) =>
    children?.some((child) => location.pathname.startsWith(child.href));

  // Define nested submenus for items that have hasNested flag
  const getDeepNestedItems = (title: string): NestedChild[] => {
    switch (title) {
      case "Signing parties":
        return [{ title: "Contacts", href: "/crm/customers/signing-parties/contacts" }];
      case "Vendors":
        // Redirect to main inventory vendors page instead of non-existent CRM routes
        return [
          { title: "All Vendors", href: "/inventory/vendors" },
          { title: "Companies", href: "/crm/companies" },
          { title: "Contacts", href: "/crm/contacts" },
        ];
      default:
        return [];
    }
  };

  const [expandedNestedItems, setExpandedNestedItems] = useState<string[]>([]);
  
  const toggleNestedItem = (title: string) => {
    setExpandedNestedItems((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const renderSubItem = (child: NavSubItem) => {
    const hasNestedChildren = child.nestedChildren && child.nestedChildren.length > 0;
    const isExpanded = expandedSubItems.includes(child.title);

    if (hasNestedChildren) {
      return (
        <div key={child.href}>
          <button
            onClick={() => toggleSubItem(child.title)}
            className={cn(
              "flex w-full items-center justify-between gap-3 rounded-lg py-2 pl-11 pr-3 text-sm transition-colors",
              isActive(child.href) || location.pathname.startsWith(child.href)
                ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
            )}
          >
            <div className="flex items-center gap-3">
              {child.icon && <child.icon className="h-4 w-4" />}
              <span>{child.title}</span>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                isExpanded && "rotate-180"
              )}
            />
          </button>
          
          {/* Inline expanded submenu */}
          {isExpanded && (
            <div className="ml-4 mt-1 space-y-1 border-l border-sidebar-border pl-4">
              {child.nestedChildren!.map((nested) => {
                const deepNested = nested.hasNested ? getDeepNestedItems(nested.title) : [];
                const hasDeepNested = deepNested.length > 0;
                const isNestedExpanded = expandedNestedItems.includes(nested.title);
                
                if (hasDeepNested) {
                  return (
                    <div key={nested.href}>
                      <button
                        onClick={() => toggleNestedItem(nested.title)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-lg py-1.5 pl-3 pr-2 text-sm transition-colors",
                          isActive(nested.href)
                            ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                            : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
                        )}
                      >
                        <span>{nested.title}</span>
                        <ChevronDown
                          className={cn(
                            "h-3.5 w-3.5 transition-transform duration-200",
                            isNestedExpanded && "rotate-180"
                          )}
                        />
                      </button>
                      
                      {/* Third level nested items */}
                      {isNestedExpanded && (
                        <div className="ml-3 mt-1 space-y-1 border-l border-sidebar-border pl-3">
                          {deepNested.map((deep) => (
                            <NavLink
                              key={deep.href}
                              to={deep.href}
                              className={cn(
                                "flex items-center rounded-lg py-1.5 pl-3 pr-2 text-sm transition-colors",
                                isActive(deep.href)
                                  ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                                  : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
                              )}
                            >
                              {deep.title}
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                
                return (
                  <NavLink
                    key={nested.href}
                    to={nested.href}
                    className={cn(
                      "flex items-center rounded-lg py-1.5 pl-3 pr-2 text-sm transition-colors",
                      isActive(nested.href)
                        ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                        : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    )}
                  >
                    {nested.title}
                  </NavLink>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return (
      <NavLink
        key={child.href}
        to={child.href}
        className={cn(
          "flex items-center gap-3 rounded-lg py-2 pl-11 pr-3 text-sm transition-colors",
          isActive(child.href)
            ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
            : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
        )}
      >
        {child.icon && <child.icon className="h-4 w-4" />}
        <span>{child.title}</span>
      </NavLink>
    );
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
          <Building2 className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-sidebar-foreground">CRM Pro</h1>
          <p className="text-xs text-sidebar-muted">Enterprise Suite</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto h-[calc(100vh-4rem)] custom-scrollbar">
        {filteredNavigation.map((item) => {
          if (item.children) {
            const isOpen = openSections.includes(item.title);
            const sectionActive = isSectionActive(item.children);

            return (
              <Collapsible
                key={item.title}
                open={isOpen}
                onOpenChange={() => toggleSection(item.title)}
              >
                <CollapsibleTrigger
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    sectionActive
                      ? "bg-sidebar-accent text-sidebar-foreground"
                      : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      isOpen && "rotate-180"
                    )}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 pt-1">
                  {item.children.map((child) => renderSubItem(child))}
                </CollapsibleContent>
              </Collapsible>
            );
          }

          return (
            <NavLink
              key={item.href}
              to={item.href!}
              className={cn(
                "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive(item.href!)
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
              </div>
              {item.badge && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
