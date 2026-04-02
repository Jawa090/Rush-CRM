import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { OrganizationProvider } from "@/contexts/OrganizationContext";
import { DialogProvider } from "@/contexts/DialogContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminRoute } from "@/components/auth/AdminRoute";
import { MainLayout } from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
// Auth
import AuthPage from "./pages/auth/AuthPage";
import OnboardingPage from "./pages/auth/OnboardingPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import AcceptInvitePage from "./pages/auth/AcceptInvitePage";
import GoogleCallbackPage from "./pages/auth/GoogleCallbackPage";
import MicrosoftCallbackPage from "./pages/auth/MicrosoftCallbackPage";
import ForcePasswordChangePage from "./pages/auth/ForcePasswordChangePage";
// Public Pages (for Google OAuth verification)
import HomePage from "./pages/public/HomePage";
import PrivacyPolicyPage from "./pages/public/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/public/TermsOfServicePage";
// Collaboration
import CalendarPage from "./pages/collaboration/CalendarPage";
import DrivePage from "./pages/collaboration/DrivePage";
import MailPage from "./pages/collaboration/MailPage";
import UniboxPage from "./pages/collaboration/UniboxPage";
import WorkgroupsPage from "./pages/collaboration/WorkgroupsPage";
// CRM
import LeadsPage from "./pages/crm/LeadsPage";
import CreateLeadPage from "./pages/crm/CreateLeadPage";
import LeadImportPage from "./pages/leads/LeadImportPage";
import ExternalSourcesPage from "./pages/leads/ExternalSourcesPage";
import CreateWorkspacePage from "./pages/workspaces/CreateWorkspacePage";
import DealsPage from "./pages/crm/DealsPage";
import CreateDealPage from "./pages/crm/CreateDealPage";
import CustomersPage from "./pages/crm/CustomersPage";
import ContactsPage from "./pages/crm/ContactsPage";
import CompaniesPage from "./pages/crm/CompaniesPage";
import SigningPartiesContactsPage from "./pages/crm/SigningPartiesContactsPage";
import SignAndManagePage from "./pages/crm/SignAndManagePage";
import MyVaultPage from "./pages/crm/MyVaultPage";
import CreateSigningPartyContactPage from "./pages/crm/CreateSigningPartyContactPage";
import CreateContactPage from "./pages/crm/CreateContactPage";
import CreateCompanyPage from "./pages/crm/CreateCompanyPage";
import SalesPage from "./pages/crm/SalesPage";
import AnalyticsPage from "./pages/crm/AnalyticsPage";
// HRMS
import HRMSDashboard from "./pages/hrms/HRMSDashboard";
import AttendancePage from "./pages/hrms/AttendancePage";
import EmployeesPage from "./pages/hrms/EmployeesPage";
import CreateEmployeePage from "./pages/hrms/CreateEmployeePage";
import EditEmployeePage from "./pages/hrms/EditEmployeePage";
import EmployeeDetailPage from "./pages/hrms/EmployeeDetailPage";
import LeaveManagementPage from "./pages/hrms/LeaveManagementPage";
import PayrollPage from "./pages/hrms/PayrollPage";
import GenerateSalarySlipPage from "./pages/hrms/GenerateSalarySlipPage";
import ViewSalarySlipPage from "./pages/hrms/ViewSalarySlipPage";
import NotificationsPage from "./pages/hrms/NotificationsPage";
// Inventory
import InventoryDashboard from "./pages/inventory/InventoryDashboard";
import ProductsPage from "./pages/inventory/ProductsPage";
import StockPage from "./pages/inventory/StockPage";
import PurchaseOrdersPage from "./pages/inventory/PurchaseOrdersPage";
import VendorsPage from "./pages/inventory/VendorsPage";
import WarehousePage from "./pages/inventory/WarehousePage";
import EmployeeAssignmentsPage from "./pages/inventory/EmployeeAssignmentsPage";
// Admin
import UsersPage from "./pages/admin/UsersPage";
import RolesPage from "./pages/admin/RolesPage";
import PermissionsPage from "./pages/admin/PermissionsPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import JoinRequestsPage from "./pages/admin/JoinRequestsPage";
// CRM Detail Pages
import LeadDetailPage from "./pages/crm/LeadDetailPage";
import DealDetailPage from "./pages/crm/DealDetailPage";
import ContactDetailPage from "./pages/crm/ContactDetailPage";
import CompanyDetailPage from "./pages/crm/CompanyDetailPage";
// Tasks & Automation
import TasksPage from "./pages/tasks/TasksPage";
import WorkflowsPage from "./pages/automation/WorkflowsPage";
// Projects
import ProjectsDashboardPage from "./pages/projects/ProjectsDashboardPage";
import ProjectDetailPage from "./pages/projects/ProjectDetailPage";
import ProjectReportPage from "./pages/projects/ProjectReportPage";
// Marketing
import MarketingDashboardPage from "./pages/marketing/MarketingDashboardPage";
import CampaignsPage from "./pages/marketing/CampaignsPage";
import ListsPage from "./pages/marketing/ListsPage";
import FormsPage from "./pages/marketing/FormsPage";
import SequencesPage from "./pages/marketing/SequencesPage";
import MarketingAnalyticsPage from "./pages/marketing/MarketingAnalyticsPage";
// Other
import PlaceholderPage from "./pages/PlaceholderPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <OrganizationProvider>
            <DialogProvider>
              <Routes>
                {/* Public Pages (for Google OAuth verification) */}
                <Route path="/home" element={<HomePage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsOfServicePage />} />
                <Route path="/project-report/:token" element={<ProjectReportPage />} />
                
                {/* Public Auth Routes */}
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/onboarding" element={<OnboardingPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/accept-invite" element={<AcceptInvitePage />} />
                <Route path="/force-password-change" element={<ForcePasswordChangePage />} />
                <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
                <Route path="/auth/microsoft/callback" element={<MicrosoftCallbackPage />} />
                
                {/* Protected Routes */}
                <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                  <Route path="/" element={<Dashboard />} />
                  {/* Collaboration Routes */}
                  <Route path="/collaboration/calendar" element={<CalendarPage />} />
                  <Route path="/collaboration/drive" element={<DrivePage />} />
                  <Route path="/collaboration/mail" element={<MailPage />} />
                  <Route path="/collaboration/unibox" element={<UniboxPage />} />
                  <Route path="/collaboration/workgroups" element={<WorkgroupsPage />} />
                  {/* CRM Routes */}
                  <Route path="/crm/leads" element={<LeadsPage />} />
                  <Route path="/crm/leads/create" element={<CreateLeadPage />} />
                  <Route path="/crm/leads/import" element={<LeadImportPage />} />
                  <Route path="/crm/leads/external-sources" element={<ExternalSourcesPage />} />
                  <Route path="/crm/leads/:id" element={<LeadDetailPage />} />
                  <Route path="/workspaces/create" element={<CreateWorkspacePage />} />
                  <Route path="/crm/deals" element={<DealsPage />} />
                  <Route path="/crm/deals/create" element={<CreateDealPage />} />
                  <Route path="/crm/deals/:id" element={<DealDetailPage />} />
                  <Route path="/crm/customers" element={<CustomersPage />} />
                  <Route path="/crm/customers/contacts" element={<ContactsPage />} />
                  <Route path="/crm/customers/contacts/create" element={<CreateContactPage />} />
                  <Route path="/crm/customers/contacts/:id" element={<ContactDetailPage />} />
                  <Route path="/crm/customers/companies" element={<CompaniesPage />} />
                  <Route path="/crm/customers/companies/create" element={<CreateCompanyPage />} />
                  <Route path="/crm/customers/companies/:id" element={<CompanyDetailPage />} />
                  <Route path="/crm/customers/signing-parties" element={<SignAndManagePage />} />
                  <Route path="/crm/customers/signing-parties/vault" element={<MyVaultPage />} />
                  <Route path="/crm/customers/signing-parties/contacts" element={<SigningPartiesContactsPage />} />
                  <Route path="/crm/customers/signing-parties/contacts/create" element={<CreateSigningPartyContactPage />} />
                  <Route path="/crm/sales" element={<SalesPage />} />
                  <Route path="/crm/analytics" element={<AnalyticsPage />} />
                  {/* HRMS Routes */}
                  <Route path="/hrms" element={<HRMSDashboard />} />
                  <Route path="/hrms/dashboard" element={<HRMSDashboard />} />
                  <Route path="/hrms/attendance" element={<AttendancePage />} />
                  <Route path="/hrms/employees" element={<EmployeesPage />} />
                  <Route path="/hrms/employees/create" element={<CreateEmployeePage />} />
                  <Route path="/hrms/employees/edit/:id" element={<EditEmployeePage />} />
                  <Route path="/hrms/employees/:id" element={<EmployeeDetailPage />} />
                  <Route path="/hrms/leave" element={<LeaveManagementPage />} />
                  <Route path="/hrms/payroll" element={<PayrollPage />} />
                  <Route path="/hrms/payroll/generate" element={<GenerateSalarySlipPage />} />
                  <Route path="/hrms/payroll/view/:id" element={<ViewSalarySlipPage />} />
                  <Route path="/hrms/notifications" element={<NotificationsPage />} />
                  {/* Inventory Routes */}
                  <Route path="/inventory" element={<InventoryDashboard />} />
                  <Route path="/inventory/products" element={<ProductsPage />} />
                  <Route path="/inventory/stock" element={<StockPage />} />
                  <Route path="/inventory/purchase-orders" element={<PurchaseOrdersPage />} />
                  <Route path="/inventory/vendors" element={<VendorsPage />} />
                  <Route path="/inventory/warehouse" element={<WarehousePage />} />
                  <Route path="/inventory/assignments" element={<EmployeeAssignmentsPage />} />
                  {/* Admin Routes - restricted to admin users */}
                  <Route path="/admin/users" element={<AdminRoute><UsersPage /></AdminRoute>} />
                  <Route path="/admin/roles" element={<AdminRoute><RolesPage /></AdminRoute>} />
                  <Route path="/admin/permissions" element={<AdminRoute><PermissionsPage /></AdminRoute>} />
                  <Route path="/admin/settings" element={<AdminRoute><AdminSettingsPage /></AdminRoute>} />
                  <Route path="/admin/join-requests" element={<AdminRoute><JoinRequestsPage /></AdminRoute>} />
                  {/* Tasks & Automation */}
                  <Route path="/tasks" element={<TasksPage />} />
                  <Route path="/automation/workflows" element={<WorkflowsPage />} />
                  {/* Projects — /projects redirects to /tasks, detail page stays */}
                  <Route path="/projects" element={<Navigate to="/tasks" replace />} />
                  <Route path="/projects/:id" element={<ProjectDetailPage />} />
                  {/* Marketing */}
                  <Route path="/marketing" element={<MarketingDashboardPage />} />
                  <Route path="/marketing/campaigns" element={<CampaignsPage />} />
                  <Route path="/marketing/lists" element={<ListsPage />} />
                  <Route path="/marketing/forms" element={<FormsPage />} />
                  <Route path="/marketing/sequences" element={<SequencesPage />} />
                  <Route path="/marketing/analytics" element={<MarketingAnalyticsPage />} />
                  {/* Other Routes */}
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </DialogProvider>
          </OrganizationProvider>
        </AuthProvider>

      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
