import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Pencil, Trash2, Save, ArrowRightLeft, Phone, Mail, Globe, 
  MapPin, Building2, User, Calendar, DollarSign, Tag, FileText, 
  Activity, MessageSquare, Clock, Star, MoreHorizontal, Copy, ExternalLink,
  CheckCircle, XCircle, AlertCircle, Zap, ChevronDown, ChevronRight, 
  TrendingUp, Users, Target, Award, Briefcase, Calendar as CalendarIcon,
  History, Plus, Edit3, Send, PhoneCall, Video, MessageCircle, 
  BarChart3, PieChart, TrendingDown, Eye, Filter, Search, Settings, Share2
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
import { WorkspaceShareModal } from "@/components/crm/leads/WorkspaceShareModal";
import { useLead } from "@/hooks/useCrmInteractions";
import { useUpdateLead, useDeleteLead, useConvertLeadToDeal } from "@/hooks/useCrmMutations";
import { useCreateActivity } from "@/hooks/useCrmInteractions";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";

const defaultServiceOptions = [
  { value: "Web Development", label: "Web Development" },
  { value: "Mobile App Development", label: "Mobile App Development" }, 
  { value: "Digital Marketing", label: "Digital Marketing" },
  { value: "SEO Services", label: "SEO Services" },
  { value: "Consulting", label: "Consulting" },
  { value: "Design Services", label: "Design Services" },
  { value: "E-commerce Solutions", label: "E-commerce Solutions" },
  { value: "Cloud Services", label: "Cloud Services" }
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
            className="min-h-[100px] resize-none border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        ) : (
          <Input
            type={type}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="h-10 border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        )
      ) : (
        <div className="min-h-[2.5rem] px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 flex items-center overflow-hidden">
          {type === "tel" ? (
            <a href={`tel:${value}`} className="text-primary hover:underline font-medium break-all w-full">{value}</a>
          ) : type === "email" ? (
            <a href={`mailto:${value}`} className="text-primary hover:underline font-medium break-all w-full">{value}</a>
          ) : (
            <span className="text-gray-900 font-medium break-all w-full">{value}</span>
          )}
        </div>
      )}
    </div>
  );
}
// Enterprise-level pipeline stages with professional styling
const pipelineStages = [
  { 
    id: "new", 
    label: "New Lead", 
    color: "bg-primary",
    bgColor: "bg-primary/5",
    textColor: "text-primary",
    borderColor: "border-primary/20",
    icon: <AlertCircle className="h-4 w-4" />,
    description: "Fresh lead, needs initial contact"
  },
  { 
    id: "contacted", 
    label: "Contacted", 
    color: "bg-yellow-500",
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-700", 
    borderColor: "border-yellow-200",
    icon: <PhoneCall className="h-4 w-4" />,
    description: "Initial contact made"
  },
  { 
    id: "qualified", 
    label: "Qualified", 
    color: "bg-green-500",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    borderColor: "border-green-200", 
    icon: <CheckCircle className="h-4 w-4" />,
    description: "Lead meets criteria"
  },
  { 
    id: "proposal", 
    label: "Proposal Sent", 
    color: "bg-purple-500",
    bgColor: "bg-purple-50",
    textColor: "text-purple-700",
    borderColor: "border-purple-200",
    icon: <Send className="h-4 w-4" />,
    description: "Proposal delivered"
  },
  { 
    id: "negotiation", 
    label: "Negotiation", 
    color: "bg-orange-500",
    bgColor: "bg-orange-50", 
    textColor: "text-orange-700",
    borderColor: "border-orange-200",
    icon: <Target className="h-4 w-4" />,
    description: "Terms being discussed"
  },
  { 
    id: "unqualified", 
    label: "Unqualified", 
    color: "bg-red-500",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    borderColor: "border-red-200",
    icon: <XCircle className="h-4 w-4" />,
    description: "Does not meet criteria"
  },
];

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'qualified': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'contacted': return 'bg-primary/5 text-primary border-primary/20';
    case 'unqualified': return 'bg-red-50 text-red-700 border-red-200';
    case 'new': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'proposal': return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'negotiation': return 'bg-orange-50 text-orange-700 border-orange-200';
    default: return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'qualified': return <CheckCircle className="h-4 w-4" />;
    case 'contacted': return <PhoneCall className="h-4 w-4" />;
    case 'unqualified': return <XCircle className="h-4 w-4" />;
    case 'new': return <AlertCircle className="h-4 w-4" />;
    case 'proposal': return <Send className="h-4 w-4" />;
    case 'negotiation': return <Target className="h-4 w-4" />;
    default: return <Clock className="h-4 w-4" />;
  }
};
export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: lead, isLoading, error } = useLead(id!);
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();
  const convertLeadToDeal = useConvertLeadToDeal();
  const createActivity = useCreateActivity();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);

  useEffect(() => {
    if (lead) {
      setForm({
        title: lead.title,
        stage: lead.stage,
        status: lead.status,
        company_name: lead.company_name,
        designation: lead.designation,
        phone: lead.phone,
        email: lead.email,
        website: lead.website,
        address: lead.address,
        company_phone: lead.company_phone,
        company_email: lead.company_email,
        interaction_notes: lead.interaction_notes,
        service_interested: lead.service_interested,
        value: lead.value,
        currency: lead.currency,
        source: lead.source,
        source_info: lead.source_info,
        agent_name: lead.agent_name,
        customer_type: lead.customer_type,
        company_size: lead.company_size,
        decision_maker: lead.decision_maker,
        // Additional imported fields
        notes: lead.notes,
        priority: lead.priority,
        pipeline: lead.pipeline,
        tags: lead.tags,
        expected_close_date: lead.expected_close_date,
        last_contacted_date: lead.last_contacted_date,
        next_follow_up_date: lead.next_follow_up_date,
        first_message: lead.first_message,
        last_touch: lead.last_touch,
        phone_type: lead.phone_type,
        email_type: lead.email_type,
        website_type: lead.website_type,
        responsible_person: lead.responsible_person,
      });
    }
  }, [lead]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-primary/5 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Loading Lead Details</h3>
          <p className="text-slate-600">Please wait while we fetch the information...</p>
        </div>
      </div>
    );
  }

  if (!lead && !isLoading && !deleteLead.isPending && !deleteLead.isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-primary/5 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl border border-slate-200 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Lead Not Found</h2>
          <p className="text-slate-600 mb-6">The lead you're looking for doesn't exist or may have been removed.</p>
          <Button onClick={() => navigate('/crm/leads')} className="bg-primary hover:bg-primary/90 text-white px-6 py-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Leads
          </Button>
        </div>
      </div>
    );
  }
  const handleSave = () => {
    const changes: Record<string, unknown> = {};
    Object.entries(form).forEach(([key, val]) => {
      if (val !== (lead as Record<string, unknown>)[key]) changes[key] = val;
    });
    if (Object.keys(changes).length === 0) { 
      setEditing(false); 
      return; 
    }

    updateLead.mutate({ id: lead.id, ...changes }, {
      onSuccess: () => {
        setEditing(false);
      },
    });
  };

  const handleConvertToDeal = () => {
    convertLeadToDeal.mutate(lead.id, {
      onSuccess: (data: any) => {
        navigate(`/crm/deals/${data.dealId || data.id}`);
      },
    });
  };

  const handleDelete = () => {
    deleteLead.mutate(lead.id, {
      onSuccess: () => {
        navigate('/crm/leads');
      },
    });
  };

  const handleStageChange = (newStage: string) => {
    setForm(prev => ({ ...prev, stage: newStage }));
    if (!editing) {
      updateLead.mutate({ id: lead.id, stage: newStage }, {
        onSuccess: () => {
          const stageName = pipelineStages.find(s => s.id === newStage)?.label || newStage;
          createActivity.mutate({
            entityType: 'lead', 
            entityId: lead.id,
            activityType: 'stage_change',
            title: `Stage changed to ${stageName}`,
            description: `Lead pipeline stage updated to ${stageName}`,
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary/5 to-indigo-50">
      {/* Enterprise Header with Breadcrumb Navigation */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4">
          {/* Professional Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
            <span className="hover:text-slate-700 cursor-pointer">CRM</span>
            <ChevronRight className="h-4 w-4" />
            <span className="hover:text-slate-700 cursor-pointer" onClick={() => navigate('/crm/leads')}>Leads</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-slate-900 font-medium">{lead.title}</span>
          </nav>

          {/* Header Content */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/crm/leads")}
                className="gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 self-start md:self-auto"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Leads
              </Button>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="relative">
                  <Avatar className="h-14 w-14 ring-4 ring-white shadow-lg">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${lead.title}`} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white font-bold text-lg">
                      {lead.title?.split(' ').map(n => n[0]).join('').toUpperCase() || 'L'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900 break-words max-w-[200px] sm:max-w-none">{lead.title}</h1>
                    <Badge className={cn("gap-1 px-3 py-1 font-medium whitespace-nowrap", getStatusColor(lead.status))}>
                      {getStatusIcon(lead.status)}
                      {lead.status || 'New Lead'}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Building2 className="h-4 w-4" />
                      <span className="font-medium">{lead.company_name || 'No Company'}</span>
                    </div>
                    {lead.value && (
                      <div className="flex items-center gap-1 text-emerald-600 font-semibold">
                        <DollarSign className="h-4 w-4" />
                        <span>${Number(lead.value).toLocaleString()}</span>
                      </div>
                    )}
                    {lead.created_at && (
                      <div className="flex items-center gap-1 text-slate-500 whitespace-nowrap">
                        <CalendarIcon className="h-4 w-4" />
                        <span>Created {format(new Date(lead.created_at), 'MMM d, yyyy')}</span>
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
                    onClick={() => { setEditing(false); setForm({ ...lead }); }}
                    className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    disabled={updateLead.isPending} 
                    className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg"
                  >
                    <Save className="h-4 w-4" /> 
                    {updateLead.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </>
              ) : (
                <>
                  {/* Quick Action Buttons */}
                  {lead.phone && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                      asChild
                    >
                      <a href={`tel:${lead.phone}`}>
                        <Phone className="h-4 w-4" />
                        Call
                      </a>
                    </Button>
                  )}
                  {lead.email && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2 text-primary border-primary/20 hover:bg-primary/5"
                      asChild
                    >
                      <a href={`mailto:${lead.email}`}>
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
                    Edit Lead
                  </Button>
                  
                  {lead.status === 'converted' || lead.converted_to_deal_id ? (
                    <Button 
                      className="gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 shadow-sm"
                      onClick={() => navigate(`/crm/deals/${lead.converted_to_deal_id || ''}`)}
                    >
                      <Target className="h-4 w-4 text-emerald-600" />
                      View Converted Deal
                    </Button>
                  ) : (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button className="gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg">
                          <ArrowRightLeft className="h-4 w-4" /> 
                          Convert to Deal
                        </Button>
                      </AlertDialogTrigger>
                    <AlertDialogContent className="max-w-md">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-emerald-600" />
                          Convert Lead to Deal
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-600">
                          This will create a new deal from this lead's information and move it to your deals pipeline. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleConvertToDeal} 
                          disabled={convertLeadToDeal.isPending}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          {convertLeadToDeal.isPending ? "Converting..." : "Convert to Deal"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="border-slate-300 hover:bg-slate-50">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      {lead.email && (
                        <DropdownMenuItem onClick={() => copyToClipboard(lead.email, 'Email')}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Email Address
                        </DropdownMenuItem>
                      )}
                      {lead.phone && (
                        <DropdownMenuItem onClick={() => copyToClipboard(lead.phone, 'Phone')}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Phone Number
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
                      <DropdownMenuItem onClick={() => setShowWorkspaceModal(true)}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Manage Workspace Access
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 focus:text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Lead
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                              <AlertCircle className="h-5 w-5" />
                              Delete Lead
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this lead? This action cannot be undone and will remove all associated data including activities, notes, and files.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={handleDelete} 
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete Lead
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Enterprise Pipeline Progress Tracker */}
      <div className="px-6 pb-6">
        <div className="bg-gradient-to-r from-slate-50 to-primary/5 rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Lead Progress Pipeline</h3>
              <p className="text-sm text-slate-600">Track your lead through the sales process</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-500">Progress</div>
              <div className="text-lg font-bold text-slate-900">
                {Math.round(((pipelineStages.findIndex(s => s.id === (form.stage || lead.stage)) + 1) / pipelineStages.length) * 100)}%
              </div>
            </div>
          </div>
            
            <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-200">
              <div className="flex gap-3 min-w-[800px] md:min-w-0">
              {pipelineStages.map((stage, index) => {
                const isActive = (form.stage || lead.stage) === stage.id;
                const isPassed = pipelineStages.findIndex(s => s.id === (form.stage || lead.stage)) > index;
                const isUnqualified = stage.id === 'unqualified' && isActive;
                
                return (
                  <div
                    key={stage.id}
                    onClick={() => handleStageChange(stage.id)}
                    className={cn(
                      "flex-1 relative cursor-pointer transition-all duration-300 rounded-xl p-4 border-2 group",
                      isActive && !isUnqualified
                        ? `${stage.bgColor} ${stage.borderColor} ${stage.textColor} shadow-lg transform scale-105` 
                        : isActive && isUnqualified
                        ? "bg-red-50 border-red-200 text-red-700 shadow-lg"
                        : isPassed && !isUnqualified
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                        isActive && !isUnqualified
                          ? stage.color + " text-white shadow-md"
                          : isActive && isUnqualified
                          ? "bg-red-500 text-white shadow-md"
                          : isPassed && !isUnqualified
                          ? "bg-emerald-500 text-white shadow-md"
                          : "bg-slate-300 text-slate-600 group-hover:bg-slate-400"
                      )}>
                        {isPassed && !isUnqualified ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : isActive ? (
                          stage.icon
                        ) : (
                          index + 1
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{stage.label}</p>
                        <p className="text-xs opacity-75">{stage.description}</p>
                      </div>
                    </div>
                    {isActive && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-current rounded-full shadow-lg"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Lead Details */}
          <div className="lg:col-span-8 space-y-8">
            {/* Enterprise Metrics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary rounded-lg shadow-lg">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-primary font-medium uppercase tracking-wide truncate">Lead Score</p>
                      <p className="text-2xl font-bold text-slate-900">85<span className="text-sm">/100</span></p>
                      <p className="text-xs text-primary truncate">High Quality</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500 rounded-lg shadow-lg">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-emerald-600 font-medium uppercase tracking-wide truncate">Conversion</p>
                      <p className="text-2xl font-bold text-emerald-900">67<span className="text-sm">%</span></p>
                      <p className="text-xs text-emerald-700 truncate">Above Avg</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500 rounded-lg shadow-lg">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-purple-600 font-medium uppercase tracking-wide truncate">Days</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {lead.created_at ? Math.floor((new Date().getTime() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0}
                      </p>
                      <p className="text-xs text-purple-700 truncate">Active Lead</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Professional Form Sections */}
            <div className="space-y-8">
              {/* Contact Information */}
              <Card className="shadow-xl border-0 bg-white">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-indigo-50 border-b border-slate-200 rounded-t-lg">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-primary rounded-lg">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    Contact Information
                  </CardTitle>
                  <CardDescription>Primary contact details and personal information</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Field 
                      label="Full Name" 
                      value={form.title as string} 
                      onChange={(v) => set("title", v)} 
                      editing={editing}
                      icon={<User className="h-4 w-4" />}
                      required
                    />
                    <Field 
                      label="Job Title" 
                      value={form.designation as string} 
                      onChange={(v) => set("designation", v)} 
                      editing={editing}
                      icon={<Briefcase className="h-4 w-4" />}
                    />
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        Phone Number
                      </Label>
                      {editing ? (
                        <Input
                          value={form.phone as string || ""}
                          onChange={(e) => set("phone", e.target.value)}
                          placeholder="+1 (555) 123-4567"
                          className="h-10 border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                      ) : (
                        <div className="h-10 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 flex items-center">
                          {(form.phone as string) ? (
                            <ClickToCall phoneNumber={form.phone as string} entityType="lead" entityId={id} className="text-sm font-medium text-gray-900" />
                          ) : (
                            <span className="text-gray-400 italic">Not specified</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <Field 
                      label="Email Address" 
                      value={form.email as string} 
                      onChange={(v) => set("email", v)} 
                      editing={editing} 
                      type="email"
                      icon={<Mail className="h-4 w-4" />}
                    />
                  </div>
                </CardContent>
              </Card>
              {/* Company Information */}
              <Card className="shadow-xl border-0 bg-white">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-slate-200 rounded-t-lg">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-emerald-500 rounded-lg">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    Company Information
                  </CardTitle>
                  <CardDescription>Organization details and business information</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Field 
                      label="Company Name" 
                      value={form.company_name as string} 
                      onChange={(v) => set("company_name", v)} 
                      editing={editing}
                      icon={<Building2 className="h-4 w-4" />}
                    />
                    <Field 
                      label="Company Size" 
                      value={form.company_size as string} 
                      onChange={(v) => set("company_size", v)} 
                      editing={editing}
                      icon={<Users className="h-4 w-4" />}
                    />
                    <Field 
                      label="Company Phone" 
                      value={form.company_phone as string} 
                      onChange={(v) => set("company_phone", v)} 
                      editing={editing}
                      type="tel"
                      icon={<Phone className="h-4 w-4" />}
                    />
                    <Field 
                      label="Company Email" 
                      value={form.company_email as string} 
                      onChange={(v) => set("company_email", v)} 
                      editing={editing}
                      icon={<Mail className="h-4 w-4" />}
                    />
                    <Field 
                      label="Website" 
                      value={form.website as string} 
                      onChange={(v) => set("website", v)} 
                      editing={editing}
                      icon={<Globe className="h-4 w-4" />}
                    />
                    <div className="md:col-span-2">
                      <Field 
                        label="Business Address" 
                        value={form.address as string} 
                        onChange={(v) => set("address", v)} 
                        editing={editing} 
                        multiline
                        icon={<MapPin className="h-4 w-4" />}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lead Qualification */}
              <Card className="shadow-xl border-0 bg-white">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-slate-200 rounded-t-lg">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    Lead Qualification & Sales Information
                  </CardTitle>
                  <CardDescription>Qualification criteria and sales potential assessment</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        Service Interested
                      </Label>
                      <CreatableSelect
                        label="Service Interested"
                        value={(form.service_interested as string) || ""}
                        onChange={(v) => set("service_interested", v)}
                        options={defaultServiceOptions}
                        disabled={!editing}
                      />
                    </div>
                    
                    <Field 
                      label="Estimated Value" 
                      value={String(form.value || "")} 
                      onChange={(v) => set("value", v ? Number(v) : null)} 
                      editing={editing} 
                      type="number"
                      icon={<DollarSign className="h-4 w-4" />}
                    />
                    <Field 
                      label="Lead Source" 
                      value={form.source as string} 
                      onChange={(v) => set("source", v)} 
                      editing={editing}
                      icon={<Tag className="h-4 w-4" />}
                    />
                    <Field 
                      label="Decision Maker" 
                      value={form.decision_maker as string} 
                      onChange={(v) => set("decision_maker", v)} 
                      editing={editing}
                      icon={<Award className="h-4 w-4" />}
                    />
                    <Field 
                      label="Assigned Sales Agent" 
                      value={form.agent_name as string} 
                      onChange={(v) => set("agent_name", v)} 
                      editing={editing}
                      icon={<User className="h-4 w-4" />}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Interaction Notes */}
              <Card className="shadow-xl border-0 bg-white">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-slate-200 rounded-t-lg">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-orange-500 rounded-lg">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    Interaction Notes & Communication History
                  </CardTitle>
                  <CardDescription>Detailed notes about interactions and communication with this lead</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  {editing ? (
                    <Textarea 
                      value={form.interaction_notes as string || ""} 
                      onChange={(e) => set("interaction_notes", e.target.value)} 
                      className="min-h-[150px] resize-none border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                      placeholder="Add detailed notes about your interactions with this lead, including call summaries, meeting notes, email exchanges, and any important observations..."
                    />
                  ) : (
                    <div className="min-h-[150px] p-6 bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl border border-slate-200">
                      <p className="text-sm whitespace-pre-wrap text-slate-700 leading-relaxed">
                        {(form.interaction_notes as string) || (
                          <span className="text-slate-400 italic">
                            No interaction notes available. Click "Edit Lead" to add detailed notes about your communications and interactions with this lead.
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
          {/* Right Sidebar - Enterprise Dashboard */}
          <div className="lg:col-span-4 space-y-8">
            {/* Lead Summary Dashboard */}
            <Card className="shadow-2xl border-0 bg-gradient-to-br from-white via-blue-50 to-indigo-50">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-lg">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  Lead Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center pb-6 border-b border-slate-200">
                  <Avatar className="h-20 w-20 mx-auto mb-4 ring-4 ring-white shadow-2xl">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${lead.title}`} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold">
                      {lead.title?.split(' ').map(n => n[0]).join('').toUpperCase() || 'L'}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-bold text-xl text-slate-900 mb-1">{lead.title}</h3>
                  <p className="text-slate-600 font-medium">{lead.company_name}</p>
                  <p className="text-sm text-slate-500">{lead.designation}</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-sm font-semibold text-slate-600">Current Status</span>
                    <Badge className={cn("gap-1 px-3 py-1", getStatusColor(lead.status))}>
                      {getStatusIcon(lead.status)}
                      {lead.status || 'New Lead'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-sm font-semibold text-slate-600">Potential Value</span>
                    <span className="font-bold text-lg text-emerald-600">
                      {lead.value ? `$${Number(lead.value).toLocaleString()}` : 'Not specified'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-sm font-semibold text-slate-600">Lead Source</span>
                    <span className="text-sm font-semibold text-slate-900">{lead.source || 'Unknown'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-sm font-semibold text-slate-600">Date Created</span>
                    <span className="text-sm font-medium text-slate-700">
                      {lead.created_at ? format(new Date(lead.created_at), 'MMM d, yyyy') : 'Unknown'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enterprise Quick Actions */}
            <Card className="shadow-xl border-0 bg-white">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg shadow-lg">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {lead.phone && (
                  <Button variant="outline" className="w-full justify-start p-0 h-14 text-left border-2 hover:border-emerald-300 hover:bg-emerald-50 transition-all" asChild>
                    <a href={`tel:${lead.phone}`} className="flex items-center gap-4 w-full h-full px-4">
                      <div className="p-3 bg-emerald-100 rounded-xl">
                        <Phone className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Call Lead</p>
                        <p className="text-sm text-slate-500">{lead.phone}</p>
                      </div>
                    </a>
                  </Button>
                )}
                
                {lead.email && (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-4 h-14 text-left border-2 hover:border-blue-300 hover:bg-blue-50 transition-all"
                    onClick={() => window.open(`mailto:${lead.email}`, '_blank')}
                  >
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Send Email</p>
                      <p className="text-sm text-slate-500">{lead.email}</p>
                    </div>
                  </Button>
                )}
                
                {lead.website && (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-4 h-14 text-left border-2 hover:border-purple-300 hover:bg-purple-50 transition-all"
                    onClick={() => window.open(lead.website, '_blank')}
                  >
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <Globe className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Visit Website</p>
                      <p className="text-sm text-slate-500">Open in new tab</p>
                    </div>
                  </Button>
                )}
                
                <Button variant="outline" className="w-full justify-start gap-4 h-14 text-left border-2 hover:border-orange-300 hover:bg-orange-50 transition-all">
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <Calendar className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Schedule Meeting</p>
                    <p className="text-sm text-slate-500">Book a call or demo</p>
                  </div>
                </Button>
              </CardContent>
            </Card>

            {/* Activity & Files Dashboard */}
            <Card className="shadow-xl border-0 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Activity & Documents
                </CardTitle>
                <CardDescription>Track interactions and manage files for this lead</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs defaultValue="activity" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mx-6 mt-0 mb-4 bg-slate-100 h-12">
                    <TabsTrigger value="activity" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm h-10 text-sm font-medium">
                      <Activity className="h-4 w-4" />
                      Activity Timeline
                    </TabsTrigger>
                    <TabsTrigger value="files" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm h-10 text-sm font-medium">
                      <FileText className="h-4 w-4" />
                      Documents & Files
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="activity" className="mx-6 mb-6 mt-0">
                    <div className="border border-slate-200 rounded-lg bg-slate-50 p-6 min-h-[400px]">
                      <InteractionPanel entityType="lead" entityId={lead.id} />
                    </div>
                  </TabsContent>

                  <TabsContent value="files" className="mx-6 mb-6 mt-0">
                    <div className="border border-slate-200 rounded-lg bg-slate-50 p-6 min-h-[400px]">
                      <EntityFilesSection entityType="lead" entityId={lead.id} />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Workspace Share Modal */}
      {showWorkspaceModal && (
        <WorkspaceShareModal
          leadId={lead.id}
          leadTitle={lead.title}
          currentWorkspaceName={lead.workspace_name}
          onClose={() => setShowWorkspaceModal(false)}
          onSuccess={() => {
            // Optionally refresh lead data
          }}
        />
      )}
    </div>
  );
}