import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Pencil, Trash2, Save, ArrowRightLeft, Phone, Mail, Globe, 
  MapPin, Building2, User, Calendar, DollarSign, Tag, FileText, 
  Activity, MessageSquare, Clock, Star, MoreHorizontal, Copy, ExternalLink,
  CheckCircle, XCircle, AlertCircle, Zap, ChevronDown, ChevronRight, 
  TrendingUp, Users, Target, Award, Briefcase, Calendar as CalendarIcon,
  History, Plus, Edit3, Send, PhoneCall, Video, MessageCircle, 
  BarChart3, PieChart, TrendingDown, Eye, Filter, Search, Settings, X,
  ArrowUp, Check
} from "lucide-react";
import { ClickToCall } from "@/components/telephony/ClickToCall";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { InteractionPanel } from "@/components/crm/InteractionPanel";
import { CreatableSelect } from "@/components/crm/CreatableSelect";
import { EntityFilesSection } from "@/components/crm/EntityFilesSection";
import { EntitySearchSelect } from "@/components/crm/EntitySearchSelect";
import { InlineContactDialog } from "@/components/crm/InlineContactDialog";
import { InlineCompanyDialog } from "@/components/crm/InlineCompanyDialog";
import { DealBlueprintsSection } from "@/components/crm/deals/DealBlueprintsSection";
import { DealTasksSection } from "@/components/crm/deals/DealTasksSection";
import { ChangeResponsibleDialog } from "@/components/crm/deals/ChangeResponsibleDialog";
import { useDeal } from "@/hooks/useCrmInteractions";
import { useUpdateDeal, useDeleteDeal, useLinkDealContact, useUnlinkDealContact, useLinkSigningParty, useUnlinkSigningParty, useConvertDealToCustomer } from "@/hooks/useCrmMutations";
import { useCreateActivity } from "@/hooks/useCrmInteractions";
import { useContacts, useCompanies, useSigningParties } from "@/hooks/useCrmData";
import { usePipelineStages, useCreatePipelineStage } from "@/hooks/usePipelineStages";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { usersApi } from '@/lib/api';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";

const fallbackStages = [
  { 
    id: "drawings_received", 
    label: "Drawings Received",
    description: "Initial drawings submitted",
    color: "bg-blue-500",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
    icon: FileText
  },
  { 
    id: "awaiting_proposal", 
    label: "Awaiting Proposal",
    description: "Preparing proposal",
    color: "bg-yellow-500",
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-700",
    borderColor: "border-yellow-200",
    icon: Clock
  },
  { 
    id: "proposal_sent", 
    label: "Proposal Sent",
    description: "Proposal under review",
    color: "bg-purple-500",
    bgColor: "bg-purple-50",
    textColor: "text-purple-700",
    borderColor: "border-purple-200",
    icon: Send
  },
  { 
    id: "proposal_approved", 
    label: "Proposal Approved",
    description: "Ready to proceed",
    color: "bg-green-500",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    borderColor: "border-green-200",
    icon: CheckCircle
  },
  { 
    id: "invoice_sent", 
    label: "Invoice Sent",
    description: "Awaiting payment",
    color: "bg-indigo-500",
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-700",
    borderColor: "border-indigo-200",
    icon: DollarSign
  },
  { 
    id: "project_approved", 
    label: "Project Approved",
    description: "Project confirmed",
    color: "bg-emerald-500",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-200",
    icon: Award
  },
  { 
    id: "in_progress", 
    label: "In Progress",
    description: "Work in progress",
    color: "bg-orange-500",
    bgColor: "bg-orange-50",
    textColor: "text-orange-700",
    borderColor: "border-orange-200",
    icon: Activity
  },
  { 
    id: "awaiting_payment", 
    label: "Awaiting Payment",
    description: "Payment pending",
    color: "bg-red-500",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    borderColor: "border-red-200",
    icon: DollarSign
  },
  { 
    id: "project_delivered", 
    label: "Delivered",
    description: "Project completed",
    color: "bg-teal-500",
    bgColor: "bg-teal-50",
    textColor: "text-teal-700",
    borderColor: "border-teal-200",
    icon: CheckCircle
  },
  { 
    id: "close_deal", 
    label: "Closed",
    description: "Deal finalized",
    color: "bg-slate-500",
    bgColor: "bg-slate-50",
    textColor: "text-slate-700",
    borderColor: "border-slate-200",
    icon: Award
  },
];

const defaultProjectTypes = [
  { value: "cost_estimation", label: "Cost Estimation" },
  { value: "fixed_price", label: "Fixed Price" },
  { value: "hourly", label: "Hourly" },
  { value: "quantity_takeoff", label: "Quantity Takeoff" },
  { value: "project_management", label: "Project Management" },
  { value: "design", label: "Design" },
];
// Professional Field component for enterprise-level forms
interface FieldProps {
  label: string;
  value: string | undefined | null;
  onChange: (value: string) => void;
  editing: boolean;
  icon?: React.ReactNode;
  multiline?: boolean;
  type?: string;
  placeholder?: string;
  required?: boolean;
}

function Field({ label, value, onChange, editing, icon, multiline, type = "text", placeholder, required }: FieldProps) {
  if (!editing && !value) {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
          {icon}
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
        <div className="min-h-[2.5rem] px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 flex items-center">
          <span className="text-gray-400 italic">Not specified</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
        {icon}
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      {editing ? (
        multiline ? (
          <Textarea
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="min-h-[100px] resize-none border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          />
        ) : (
          <Input
            type={type}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="h-10 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          />
        )
      ) : (
        <div className="min-h-[2.5rem] px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 flex items-center">
          <span className="text-gray-900 font-medium break-words w-full">{value}</span>
        </div>
      )}
    </div>
  );
}

const getStatusColor = (status: string) => {
  const stage = fallbackStages.find(s => s.id === status);
  return stage ? `${stage.bgColor} ${stage.textColor} ${stage.borderColor}` : 'bg-slate-50 text-slate-700 border-slate-200';
};

const getStatusIcon = (status: string) => {
  const stage = fallbackStages.find(s => s.id === status);
  const IconComponent = stage?.icon || Clock;
  return <IconComponent className="h-4 w-4" />;
};
export default function DealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const { data: deal, isLoading } = useDeal(id!);
  const updateDeal = useUpdateDeal();
  const deleteDeal = useDeleteDeal();
  const linkContact = useLinkDealContact();
  const unlinkContact = useUnlinkDealContact();
  const linkSigningParty = useLinkSigningParty();
  const unlinkSigningParty = useUnlinkSigningParty();
  const convertDealToCustomer = useConvertDealToCustomer();
  const createActivity = useCreateActivity();
  const { data: contacts } = useContacts();
  const { data: companies } = useCompanies();
  const { data: signingParties } = useSigningParties();
  const { data: dbStages } = usePipelineStages();
  const createStage = useCreatePipelineStage();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [companyDialogOpen, setCompanyDialogOpen] = useState(false);
  const [contactSearchTerm, setContactSearchTerm] = useState("");
  const [companySearchTerm, setCompanySearchTerm] = useState("");
  const [responsibleDialogOpen, setResponsibleDialogOpen] = useState(false);
  const [selectedLinkedContactId, setSelectedLinkedContactId] = useState<string | null>(null);
  const [selectedSigningPartyId, setSelectedSigningPartyId] = useState<string | null>(null);

  // Check if user can delete deals
  const canDelete = userRole?.role === 'super_admin' || userRole?.role === 'admin' || userRole?.role === 'manager' || deal?.user_id === user?.id;

  // Fetch responsible person profile
  const { data: responsiblePerson } = useQuery({
    queryKey: ['profile', form.assigned_to],
    queryFn: async () => {
      const data = await usersApi.getById(form.assigned_to as string).catch(() => null);
      return data;
    },
    enabled: !!form.assigned_to,
  });

  // Use dynamic stages from DB, fall back to hardcoded
  const pipelineStages = (dbStages && dbStages.length > 0)
    ? dbStages.map(s => ({ 
        id: s.stage_key, 
        label: s.stage_label,
        description: fallbackStages.find(f => f.id === s.stage_key)?.description || "Stage description",
        color: fallbackStages.find(f => f.id === s.stage_key)?.color || "bg-slate-500",
        bgColor: fallbackStages.find(f => f.id === s.stage_key)?.bgColor || "bg-slate-50",
        textColor: fallbackStages.find(f => f.id === s.stage_key)?.textColor || "text-slate-700",
        borderColor: fallbackStages.find(f => f.id === s.stage_key)?.borderColor || "border-slate-200",
        icon: fallbackStages.find(f => f.id === s.stage_key)?.icon || Clock
      }))
    : fallbackStages;

  const stageOptions = pipelineStages.map(s => ({ value: s.id, label: s.label }));

  useEffect(() => {
    if (deal) setForm({ ...deal });
  }, [deal]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Loading Deal Details</h3>
          <p className="text-slate-600">Please wait while we fetch the information...</p>
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl border border-slate-200 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Deal Not Found</h2>
          <p className="text-slate-600 mb-6">The deal you're looking for doesn't exist or may have been removed.</p>
          <Button onClick={() => navigate('/crm/deals')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Deals
          </Button>
        </div>
      </div>
    );
  }
  const handleSave = () => {
    const changes: Record<string, unknown> = {};
    Object.entries(form).forEach(([key, val]) => {
      if (val !== (deal as Record<string, unknown>)[key]) changes[key] = val;
    });
    if (Object.keys(changes).length === 0) { 
      setEditing(false); 
      return; 
    }

    updateDeal.mutate({ id: deal.id, ...changes }, {
      onSuccess: () => {
        setEditing(false);
        createActivity.mutate({
          entityType: 'deal', 
          entityId: deal.id,
          activityType: 'update',
          title: 'Deal information updated',
          description: `Updated fields: ${Object.keys(changes).join(', ')}`,
        });
      }
    });
  };

  const handleConvertToCustomer = () => {
    convertDealToCustomer.mutate(deal.id, {
      onSuccess: () => {
        navigate('/crm/customers');
      }
    });
  };

  const handleDelete = () => {
    deleteDeal.mutate(deal.id, {
      onSuccess: () => {
        navigate('/crm/deals');
      }
    });
  };

  const handleStageChange = (newStage: string) => {
    setForm(prev => ({ ...prev, stage: newStage }));
    if (!editing) {
      updateDeal.mutate({ id: deal.id, stage: newStage }, {
        onSuccess: () => {
          const stageName = pipelineStages.find(s => s.id === newStage)?.label || newStage;
          createActivity.mutate({
            entityType: 'deal', 
            entityId: deal.id,
            activityType: 'stage_change',
            title: `Stage changed to ${stageName}`,
            description: `Deal pipeline stage updated to ${stageName}`,
          });
        }
      });
    }
  };

  const handleResponsibleChange = (userId: string) => {
    set("assigned_to", userId);
    if (!editing) {
      updateDeal.mutate({ id: deal.id, assigned_to: userId }, {
        onSuccess: () => {
          createActivity.mutate({
            entityType: 'deal', 
            entityId: deal.id,
            activityType: 'update', 
            title: 'Changed responsible person',
          });
        }
      });
    }
  };

  const set = (key: string, val: unknown) => setForm(prev => ({ ...prev, [key]: val }));

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const contactOptions = (contacts || []).map(c => ({
    id: c.id,
    label: `${c.first_name} ${c.last_name || ''}`.trim(),
    sublabel: c.email || c.phone || undefined,
  }));

  const signingPartyOptions = (signingParties || []).map((c: any) => ({
    id: c.id,
    label: `${c.first_name ?? ''} ${c.last_name ?? ''}`.trim() || c.email || 'Signing Party',
    sublabel: c.email || c.phone || undefined,
  }));

  const companyOptions = (companies || []).map(c => ({
    id: c.id,
    label: c.name,
    sublabel: c.email || c.phone || undefined,
  }));

  // Get linked contact/company details for display in view mode
  const linkedContact = contacts?.find(c => c.id === form.contact_id);
  const linkedCompany = companies?.find(c => c.id === form.company_id);

  const blueprints = Array.isArray((form as any).project_blueprints) ? (form as any).project_blueprints : [];

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enterprise Header with Breadcrumb Navigation */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="px-4 md:px-6 py-4">
          {/* Professional Breadcrumb */}
          <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-500 mb-6">
            <span className="hover:text-slate-700 cursor-pointer">CRM</span>
            <ChevronRight className="h-4 w-4 shrink-0" />
            <span className="hover:text-slate-700 cursor-pointer" onClick={() => navigate('/crm/deals')}>Deals</span>
            <ChevronRight className="h-4 w-4 shrink-0" />
            <span className="text-slate-900 font-medium truncate">{deal.title}</span>
          </nav>

          {/* Header Content */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/crm/deals")}
                className="gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 self-start md:self-auto"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Deals
              </Button>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="relative">
                  <Avatar className="h-14 w-14 ring-4 ring-white shadow-lg">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${deal.title}`} />
                    <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white font-bold text-lg">
                      {deal.title?.split(' ').map(n => n[0]).join('').toUpperCase() || 'D'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900 break-words max-w-[200px] sm:max-w-none">{deal.title}</h1>
                    <Badge className={cn("gap-1 px-3 py-1 font-medium whitespace-nowrap", getStatusColor(deal.stage))}>
                      {getStatusIcon(deal.stage)}
                      {pipelineStages.find(s => s.id === deal.stage)?.label || deal.stage}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Building2 className="h-4 w-4" />
                      <span className="font-medium">{linkedCompany?.name || 'No Company'}</span>
                    </div>
                    {deal.value && (
                      <div className="flex items-center gap-1 text-emerald-600 font-semibold">
                        <DollarSign className="h-4 w-4" />
                        <span>${Number(deal.value).toLocaleString()}</span>
                      </div>
                    )}
                    {deal.created_at && (
                      <div className="flex items-center gap-1 text-slate-500 whitespace-nowrap">
                        <CalendarIcon className="h-4 w-4" />
                        <span>Created {format(new Date(deal.created_at), 'MMM d, yyyy')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Professional Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              {editing ? (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => { setEditing(false); setForm({ ...deal }); }}
                    className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    disabled={updateDeal.isPending} 
                    className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                  >
                    <Save className="h-4 w-4" /> 
                    {updateDeal.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </>
              ) : (
                <>
                  {/* Quick Action Buttons */}
                  {linkedContact?.phone && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                      asChild
                    >
                      <a href={`tel:${linkedContact.phone}`}>
                        <Phone className="h-4 w-4" />
                        Call
                      </a>
                    </Button>
                  )}
                  {linkedContact?.email && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                      asChild
                    >
                      <a href={`mailto:${linkedContact.email}`}>
                        <Mail className="h-4 w-4" />
                        Email
                      </a>
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setEditing(true)} 
                    className="gap-2 border-slate-300 hover:bg-slate-50"
                  >
                    <Edit3 className="h-4 w-4" /> 
                    Edit Deal
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button className="gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg">
                        <ArrowRightLeft className="h-4 w-4" /> 
                        Convert to Customer
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="max-w-md">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-emerald-600" />
                          Convert Deal to Customer
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-600">
                          This will create a new customer from this deal's information and move it to your customers section. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleConvertToCustomer} 
                          disabled={convertDealToCustomer.isPending}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          {convertDealToCustomer.isPending ? "Converting..." : "Convert to Customer"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="border-slate-300 hover:bg-slate-50">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      {linkedContact?.email && (
                        <DropdownMenuItem onClick={() => copyToClipboard(linkedContact.email, 'Email')}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Contact Email
                        </DropdownMenuItem>
                      )}
                      {linkedContact?.phone && (
                        <DropdownMenuItem onClick={() => copyToClipboard(linkedContact.phone, 'Phone')}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Contact Phone
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        View Activity Timeline
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Meeting
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Send Message
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {canDelete && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 focus:text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Deal
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                                <AlertCircle className="h-5 w-5" />
                                Delete Deal
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this deal? This action cannot be undone and will remove all associated data including activities, notes, and files.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={handleDelete} 
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete Deal
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enterprise Metrics Dashboard */}
      <div className="px-4 md:px-6 py-6 bg-white border-b border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-slate-600">Deal Score</span>
              </div>
              <Badge className="bg-blue-100 text-blue-700 border-blue-200">Hot</Badge>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">92</span>
              <span className="text-lg text-slate-500">/100</span>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm text-emerald-600">
              <ArrowUp className="h-4 w-4" />
              <span>+8 this week</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                </div>
                <span className="text-sm font-medium text-slate-600">Deal Value</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">
                ${deal.value ? Number(deal.value).toLocaleString() : '0'}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm text-slate-500">
              <Calendar className="h-4 w-4" />
              <span>Expected close: {deal.expected_close_date ? format(new Date(deal.expected_close_date), 'MMM d') : 'Not set'}</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-slate-600">Days in Pipeline</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">
                {deal.created_at ? Math.floor((new Date().getTime() - new Date(deal.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0}
              </span>
              <span className="text-lg text-slate-500">days</span>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm text-slate-500">
              <Target className="h-4 w-4" />
              <span>Avg: 45 days</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Users className="h-5 w-5 text-orange-600" />
                </div>
                <span className="text-sm font-medium text-slate-600">Win Rate</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">73</span>
              <span className="text-lg text-slate-500">%</span>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm text-emerald-600">
              <TrendingUp className="h-4 w-4" />
              <span>Above average</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Pipeline Progress */}
      <div className="px-4 md:px-6 py-6 bg-white border-b border-slate-200">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Deal Pipeline Progress</h3>
          <p className="text-sm text-slate-600">Track your deal through each stage of the sales process</p>
        </div>
        
        <div className="relative overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-200">
          <div className="flex items-center justify-between mb-4 min-w-[1000px] lg:min-w-0 px-4">
            {pipelineStages.map((stage, index) => {
              const isActive = stage.id === deal.stage;
              const isPassed = pipelineStages.findIndex(s => s.id === deal.stage) > index;
              const isClickable = !editing;
              
              return (
                <div key={stage.id} className="flex flex-col items-center flex-1">
                  <div 
                    className={cn(
                      "relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 cursor-pointer",
                      isActive 
                        ? "bg-blue-600 border-blue-600 text-white shadow-lg scale-110" 
                        : isPassed 
                        ? "bg-emerald-500 border-emerald-500 text-white" 
                        : "bg-white border-slate-300 text-slate-400 hover:border-slate-400",
                      isClickable && "hover:scale-105"
                    )}
                    onClick={() => isClickable && handleStageChange(stage.id)}
                  >
                    {isPassed ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      <stage.icon className="h-6 w-6" />
                    )}
                    {isActive && (
                      <div className="absolute -inset-1 bg-blue-600 rounded-full animate-pulse opacity-25"></div>
                    )}
                  </div>
                  <div className="mt-3 text-center">
                    <div className={cn(
                      "text-sm font-medium mb-1",
                      isActive ? "text-blue-600" : isPassed ? "text-emerald-600" : "text-slate-500"
                    )}>
                      {stage.label}
                    </div>
                    <div className="text-xs text-slate-400 max-w-20 leading-tight">
                      {stage.description}
                    </div>
                  </div>
                  {index < pipelineStages.length - 1 && (
                    <div className={cn(
                      "absolute top-6 left-1/2 w-full h-0.5 -translate-y-1/2 transition-colors duration-300",
                      isPassed ? "bg-emerald-500" : "bg-slate-200"
                    )} style={{ left: `${((index + 1) / pipelineStages.length) * 100}%`, width: `${100 / pipelineStages.length}%` }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Professional Form Sections */}
          <div className="lg:col-span-8 space-y-6">
            {/* Deal Information Card */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-slate-900">Deal Information</CardTitle>
                    <CardDescription className="text-slate-600">Core details about this deal</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Field
                    label="Deal Title"
                    value={form.title as string}
                    onChange={(val) => set("title", val)}
                    editing={editing}
                    icon={<Briefcase className="h-4 w-4" />}
                    required
                  />
                </div>
                <Field
                  label="Deal Value"
                  value={form.value as string}
                  onChange={(val) => set("value", val)}
                  editing={editing}
                  icon={<DollarSign className="h-4 w-4" />}
                  type="number"
                  placeholder="Enter deal value"
                />
                <Field
                  label="Currency"
                  value={form.currency as string}
                  onChange={(val) => set("currency", val)}
                  editing={editing}
                  icon={<DollarSign className="h-4 w-4" />}
                  placeholder="USD, EUR, etc."
                />
                <Field
                  label="Expected Close Date"
                  value={form.expected_close_date ? new Date(form.expected_close_date as string).toISOString().split('T')[0] : ""}
                  onChange={(val) => set("expected_close_date", val)}
                  editing={editing}
                  icon={<Calendar className="h-4 w-4" />}
                  type="date"
                />
                <Field
                  label="Probability (%)"
                  value={form.probability?.toString()}
                  onChange={(val) => set("probability", parseInt(val) || 0)}
                  editing={editing}
                  icon={<Target className="h-4 w-4" />}
                  type="number"
                />
                <div className="md:col-span-2">
                  <Field
                    label="Description"
                    value={form.description as string}
                    onChange={(val) => set("description", val)}
                    editing={editing}
                    icon={<FileText className="h-4 w-4" />}
                    multiline
                    placeholder="Describe the deal details..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Information Card */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <User className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-slate-900">Contact Information</CardTitle>
                    <CardDescription className="text-slate-600">Details of the primary contact</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Linked Contact Profile
                    </label>
                    {editing ? (
                      <Select value={form.contact_id as string} onValueChange={(val) => set("contact_id", val)}>
                        <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Select contact..." />
                        </SelectTrigger>
                        <SelectContent>
                          {contactOptions.map(option => (
                            <SelectItem key={option.id} value={option.id}>
                              <div>
                                <div className="font-medium">{option.label}</div>
                                {option.sublabel && <div className="text-xs text-slate-500">{option.sublabel}</div>}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="h-10 px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 flex items-center">
                        <span className="text-slate-900 font-medium">
                          {linkedContact ? `${linkedContact.first_name} ${linkedContact.last_name || ''}`.trim() : 'No contact selected'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <Field
                  label="Contact Name"
                  value={form.contact_name as string}
                  onChange={(val) => set("contact_name", val)}
                  editing={editing}
                  icon={<User className="h-4 w-4" />}
                  placeholder="Full name"
                />
                <Field
                  label="Designation"
                  value={form.designation as string}
                  onChange={(val) => set("designation", val)}
                  editing={editing}
                  icon={<Briefcase className="h-4 w-4" />}
                  placeholder="Job title"
                />
                <Field
                  label="Email"
                  value={form.email as string}
                  onChange={(val) => set("email", val)}
                  editing={editing}
                  icon={<Mail className="h-4 w-4" />}
                  type="email"
                  placeholder="Email address"
                />
                <Field
                  label="Phone"
                  value={form.phone as string}
                  onChange={(val) => set("phone", val)}
                  editing={editing}
                  icon={<Phone className="h-4 w-4" />}
                  placeholder="Phone number"
                />
                <div className="md:col-span-2">
                  <Field
                    label="Address"
                    value={form.address as string}
                    onChange={(val) => set("address", val)}
                    editing={editing}
                    icon={<MapPin className="h-4 w-4" />}
                    placeholder="Full address"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Company Information Card */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Building2 className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-slate-900">Company Information</CardTitle>
                    <CardDescription className="text-slate-600">Organizational details</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Linked Company Profile
                    </label>
                    {editing ? (
                      <Select value={form.company_id as string} onValueChange={(val) => set("company_id", val)}>
                        <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Select company..." />
                        </SelectTrigger>
                        <SelectContent>
                          {companyOptions.map(option => (
                            <SelectItem key={option.id} value={option.id}>
                              <div>
                                <div className="font-medium">{option.label}</div>
                                {option.sublabel && <div className="text-xs text-slate-500">{option.sublabel}</div>}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="h-10 px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 flex items-center">
                        <span className="text-slate-900 font-medium">{linkedCompany?.name || 'No company selected'}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Field
                  label="Company Name"
                  value={form.company_name as string}
                  onChange={(val) => set("company_name", val)}
                  editing={editing}
                  icon={<Building2 className="h-4 w-4" />}
                  placeholder="Legal company name"
                />
                <Field
                  label="Website"
                  value={form.website as string}
                  onChange={(val) => set("website", val)}
                  editing={editing}
                  icon={<Globe className="h-4 w-4" />}
                  placeholder="https://example.com"
                />
                <Field
                  label="Company Phone"
                  value={form.company_phone as string}
                  onChange={(val) => set("company_phone", val)}
                  editing={editing}
                  icon={<Phone className="h-4 w-4" />}
                  placeholder="Main office phone"
                />
                <Field
                  label="Company Email"
                  value={form.company_email as string}
                  onChange={(val) => set("company_email", val)}
                  editing={editing}
                  icon={<Mail className="h-4 w-4" />}
                  placeholder="General info email"
                />
                <Field
                  label="Company Size"
                  value={form.company_size as string}
                  onChange={(val) => set("company_size", val)}
                  editing={editing}
                  icon={<Users className="h-4 w-4" />}
                  placeholder="e.g., 50-100 employees"
                />
              </CardContent>
            </Card>

            {/* Marketing & Qualification Card */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Target className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-slate-900">Lead Qualification & Sales Info</CardTitle>
                    <CardDescription className="text-slate-600">Marketing and qualification metadata</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Priority
                  </label>
                  {editing ? (
                    <Select value={form.priority as string} onValueChange={(val) => set("priority", val)}>
                      <SelectTrigger className="border-slate-300">
                        <SelectValue placeholder="Select priority..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="h-10 px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 flex items-center">
                      <Badge className={cn(
                        form.priority === 'urgent' ? 'bg-red-100 text-red-700 border-red-200' :
                        form.priority === 'high' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                        form.priority === 'medium' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                        'bg-slate-100 text-slate-700 border-slate-200'
                      )}>
                        {(form.priority as string || 'Medium').toUpperCase()}
                      </Badge>
                    </div>
                  )}
                </div>
                <Field
                  label="Lead Source"
                  value={form.source as string}
                  onChange={(val) => set("source", val)}
                  editing={editing}
                  icon={<Tag className="h-4 w-4" />}
                  placeholder="e.g., Website, Referral"
                />
                <Field
                  label="Sales Agent"
                  value={form.agent_name as string}
                  onChange={(val) => set("agent_name", val)}
                  editing={editing}
                  icon={<User className="h-4 w-4" />}
                  placeholder="Attributed agent"
                />
                <Field
                  label="Decision Maker"
                  value={form.decision_maker as string}
                  onChange={(val) => set("decision_maker", val)}
                  editing={editing}
                  icon={<Award className="h-4 w-4" />}
                  placeholder="Primary decision maker"
                />
                <Field
                  label="Service Interested"
                  value={form.service_interested as string}
                  onChange={(val) => set("service_interested", val)}
                  editing={editing}
                  icon={<Zap className="h-4 w-4" />}
                  placeholder="Project/Service type"
                />
                <Field
                  label="Source Info"
                  value={form.source_info as string}
                  onChange={(val) => set("source_info", val)}
                  editing={editing}
                  icon={<Search className="h-4 w-4" />}
                  placeholder="Campaign details, UTM params, etc."
                />
              </CardContent>
            </Card>

            {/* Interaction Notes Card */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <History className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-slate-900">Interaction Notes & History</CardTitle>
                    <CardDescription className="text-slate-600">Timeline and communication summaries</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <Field
                  label="First Interaction Message"
                  value={form.first_message as string}
                  onChange={(val) => set("first_message", val)}
                  editing={editing}
                  icon={<MessageCircle className="h-4 w-4" />}
                  multiline
                  placeholder="Content of the very first message..."
                />
                <Field
                  label="Cumulative Interaction Notes"
                  value={form.interaction_notes as string}
                  onChange={(val) => set("interaction_notes", val)}
                  editing={editing}
                  icon={<History className="h-4 w-4" />}
                  multiline
                  placeholder="Summary of all interactions during lead stage..."
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field
                    label="Last Touch"
                    value={form.last_touch ? new Date(form.last_touch as string).toISOString().split('T')[0] : ""}
                    onChange={(val) => set("last_touch", val)}
                    editing={editing}
                    icon={<Clock className="h-4 w-4" />}
                    type="date"
                  />
                  <Field
                    label="Next Follow Up"
                    value={form.next_follow_up_date ? new Date(form.next_follow_up_date as string).toISOString().split('T')[0] : ""}
                    onChange={(val) => set("next_follow_up_date", val)}
                    editing={editing}
                    icon={<CalendarIcon className="h-4 w-4" />}
                    type="date"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Sidebar - Activity & Files */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Activity className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-slate-900">Activity & Documents</CardTitle>
                      <CardDescription className="text-slate-600">Track interactions and manage files</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs defaultValue="activity" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mx-6 mb-4 bg-slate-100">
                    <TabsTrigger value="activity" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      <Activity className="h-4 w-4" />
                      Activity
                    </TabsTrigger>
                    <TabsTrigger value="files" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      <FileText className="h-4 w-4" />
                      Files
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="activity" className="mt-0 px-6 pb-6">
                    <div className="min-h-96">
                      <InteractionPanel entityType="deal" entityId={deal.id} />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="files" className="mt-0 px-6 pb-6">
                    <div className="min-h-96">
                      <EntityFilesSection entityType="deal" entityId={deal.id} />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}