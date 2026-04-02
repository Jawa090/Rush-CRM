import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  X, Pencil, Calendar, Search, Plus, Bold, Italic, 
  Underline, Strikethrough, List, ListOrdered, Link, 
  AtSign, User, Briefcase, Globe, MessageSquare, 
  MapPin, Settings, Info, Check, Image as ImageIcon, Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useCreateSigningParty, useCompanies, useUsers } from "@/hooks/useCrmData";
import { useToast } from "@/components/ui/use-toast";

const tabs = ["General", "History", "Market", "More"];
const activityTabs = ["Activity", "Comment", "Message", "Booking", "Task", "More"];

export default function CreateSigningPartyContactPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createSigningParty = useCreateSigningParty();
  const { data: companiesResponse } = useCompanies();
  const { data: usersData } = useUsers();
  
  const companies = companiesResponse || [];
  const users = usersData || [];

  const [activeTab, setActiveTab] = useState("General");
  const [activeActivityTab, setActiveActivityTab] = useState("Activity");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    secondName: "",
    salutation: "mr",
    dob: "",
    email: "",
    phone: "",
    companyId: "",
    position: "",
    website: "",
    websiteType: "corporate",
    messenger: "",
    messengerType: "facebook",
    address: "",
    contactType: "signing_party",
    source: "call",
    sourceInfo: "",
    isPublic: true,
    includeInExport: true,
    responsibleId: "",
    observers: [] as string[],
    notes: "",
    tags: [] as string[],
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    navigate("/crm/customers/signing-parties/contacts");
  };

  const handleSave = () => {
    if (!formData.firstName) {
      toast({
        title: "Validation Error",
        description: "First name is required",
        variant: "destructive"
      });
      return;
    }

    createSigningParty.mutate(formData, {
      onSuccess: () => {
        toast({
          title: "Created",
          description: "Signing party contact created successfully"
        });
        navigate("/crm/customers/signing-parties/contacts");
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.message || "Failed to create contact",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-card sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-destructive/10 hover:bg-destructive/20"
            onClick={handleCancel}
          >
            <X className="h-4 w-4 text-destructive" />
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">New contact</h1>
            <span className="text-muted-foreground ml-2">{formData.firstName || "Untitled"} {formData.lastName !== 'Contact #' ? formData.lastName : ''}</span>
          </div>
          <Button variant="ghost" size="icon" className="h-4 w-4">
            <Pencil className="h-3 w-3 text-muted-foreground" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {createSigningParty.isPending && <span className="text-sm text-muted-foreground animate-pulse mr-2">Saving...</span>}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 px-4 py-2 border-b bg-card sticky top-[53px] z-10">
        {tabs.map((tab) => (
          <Button
            key={tab}
            variant="ghost"
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md",
              activeTab === tab
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {tab}
          </Button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex gap-6 p-4 max-w-[1600px] mx-auto">
        {/* Left Column - Form */}
        <div className="flex-1 space-y-4 max-w-xl">
          {activeTab === "General" && (
            <>
              {/* About Contact Section */}
              <div className="bg-card rounded-lg border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b">
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-bold text-foreground uppercase tracking-wider">About Contact</span>
                  </div>
                  <Button variant="ghost" className="text-muted-foreground text-xs p-0 h-auto font-normal hover:text-primary">
                    cancel
                  </Button>
                </div>

                <div className="p-4 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[11px] text-muted-foreground uppercase font-semibold">Salutation</Label>
                      <Select value={formData.salutation} onValueChange={(v) => handleChange("salutation", v)}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Not selected" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mr">Mr.</SelectItem>
                          <SelectItem value="mrs">Mrs.</SelectItem>
                          <SelectItem value="ms">Ms.</SelectItem>
                          <SelectItem value="dr">Dr.</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[11px] text-muted-foreground uppercase font-semibold">First Name *</Label>
                      <Input 
                        className="h-9 focus-visible:ring-primary" 
                        value={formData.firstName}
                        onChange={(e) => handleChange("firstName", e.target.value)}
                        placeholder="e.g. John"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[11px] text-muted-foreground uppercase font-semibold">Last name</Label>
                      <Input 
                        className="h-9" 
                        value={formData.lastName}
                        onChange={(e) => handleChange("lastName", e.target.value)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[11px] text-muted-foreground uppercase font-semibold">Second name</Label>
                      <Input 
                        className="h-9" 
                        value={formData.secondName}
                        onChange={(e) => handleChange("secondName", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-muted-foreground uppercase font-semibold">Photo</Label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 transition-colors cursor-pointer group">
                        <ImageIcon className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
                      </div>
                      <div className="space-y-1">
                        <Button variant="outline" size="sm" className="h-8 font-semibold">
                          ADD IMAGE
                        </Button>
                        <p className="text-[10px] text-muted-foreground italic">File size must not exceed 3 Mb.</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[11px] text-muted-foreground uppercase font-semibold">Date of birth</Label>
                      <div className="relative">
                        <Input 
                          type="date" 
                          className="h-9 pl-3 pr-10" 
                          value={formData.dob}
                          onChange={(e) => handleChange("dob", e.target.value)}
                        />
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-muted/30">
                    <Label className="text-[11px] text-primary uppercase font-bold tracking-widest">Contact Information</Label>
                    
                    <div className="space-y-1.5">
                      <Label className="text-[10px] text-muted-foreground">Phone</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input 
                            className="h-9 pl-9" 
                            placeholder="+1 234 567 890" 
                            value={formData.phone}
                            onChange={(e) => handleChange("phone", e.target.value)}
                          />
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                        <Select defaultValue="work">
                          <SelectTrigger className="w-[120px] h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="work">Work Phone</SelectItem>
                            <SelectItem value="mobile">Mobile</SelectItem>
                            <SelectItem value="home">Home</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[10px] text-muted-foreground">E-mail</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input 
                            className="h-9 pl-9" 
                            type="email" 
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={(e) => handleChange("email", e.target.value)}
                          />
                          <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                        <Select defaultValue="work">
                          <SelectTrigger className="w-[100px] h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="work">Work</SelectItem>
                            <SelectItem value="personal">Personal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[10px] text-muted-foreground">Website</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input 
                            className="h-9 pl-9" 
                            placeholder="www.company.com"
                            value={formData.website}
                            onChange={(e) => handleChange("website", e.target.value)}
                          />
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                        <Select value={formData.websiteType} onValueChange={(v) => handleChange("websiteType", v)}>
                          <SelectTrigger className="w-[110px] h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="corporate">Corporate</SelectItem>
                            <SelectItem value="personal">Personal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[10px] text-muted-foreground">Messenger</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input 
                            className="h-9 pl-9" 
                            placeholder="@username"
                            value={formData.messenger}
                            onChange={(e) => handleChange("messenger", e.target.value)}
                          />
                          <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                        <Select value={formData.messengerType} onValueChange={(v) => handleChange("messengerType", v)}>
                          <SelectTrigger className="w-[110px] h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="facebook">Facebook</SelectItem>
                            <SelectItem value="whatsapp">WhatsApp</SelectItem>
                            <SelectItem value="telegram">Telegram</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-muted/30">
                    <Label className="text-[11px] text-muted-foreground uppercase font-semibold">Address</Label>
                    <div className="relative">
                      <Input 
                        className="h-9 pl-9" 
                        placeholder="Primary address..."
                        value={formData.address}
                        onChange={(e) => handleChange("address", e.target.value)}
                      />
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <span className="text-[10px] text-primary cursor-pointer hover:underline font-medium">expand</span>
                        <Search className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* More Section */}
              <div className="bg-card rounded-lg border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 delay-75">
                <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b">
                  <div className="flex items-center gap-2">
                    <Settings className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-bold text-foreground uppercase tracking-wider">Classification & Settings</span>
                  </div>
                  <Button variant="ghost" className="text-muted-foreground text-xs p-0 h-auto font-normal">
                    cancel
                  </Button>
                </div>

                <div className="p-4 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[11px] text-muted-foreground uppercase font-semibold">Contact type</Label>
                      <Select value={formData.contactType} onValueChange={(v) => handleChange("contactType", v)}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="signing_party">Signing Party</SelectItem>
                          <SelectItem value="clients">Clients</SelectItem>
                          <SelectItem value="partners">Partners</SelectItem>
                          <SelectItem value="vendors">Vendors</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[11px] text-muted-foreground uppercase font-semibold">Source</Label>
                      <Select value={formData.source} onValueChange={(v) => handleChange("source", v)}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="call">Call</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="website">Website</SelectItem>
                          <SelectItem value="referral">Referral</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-muted-foreground uppercase font-semibold">Source information</Label>
                    <Textarea 
                      className="min-h-[80px] focus-visible:ring-primary text-sm" 
                      placeholder="Details about where this contact came from..."
                      value={formData.sourceInfo}
                      onChange={(e) => handleChange("sourceInfo", e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-3 pt-1">
                    <label className="flex items-center space-x-3 cursor-pointer group">
                      <Checkbox 
                        id="available" 
                        checked={formData.isPublic} 
                        onCheckedChange={(v) => handleChange("isPublic", !!v)}
                        className="data-[state=checked]:bg-primary"
                      />
                      <div>
                        <Label htmlFor="available" className="text-sm font-medium leading-none cursor-pointer">Available to everyone</Label>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Control visibility across the organization</p>
                      </div>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer group">
                      <Checkbox 
                        id="export" 
                        checked={formData.includeInExport} 
                        onCheckedChange={(v) => handleChange("includeInExport", !!v)}
                        className="data-[state=checked]:bg-primary"
                      />
                      <div>
                        <Label htmlFor="export" className="text-sm font-medium leading-none cursor-pointer">Included in export</Label>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Include this contact in CSV/Excel data exports</p>
                      </div>
                    </label>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-muted/30">
                    <div className="flex items-center justify-between">
                      <Label className="text-[11px] text-muted-foreground uppercase font-semibold">Responsible person</Label>
                    </div>
                    <Select value={formData.responsibleId} onValueChange={(v) => handleChange("responsibleId", v)}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select responsible person" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user: any) => (
                          <SelectItem key={user.id} value={user.id}>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-[10px]">{user.full_name?.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span>{user.full_name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-muted-foreground uppercase font-semibold">Observers</Label>
                    <div className="flex flex-wrap gap-2 items-center">
                      {users.filter(u => formData.observers.includes(u.id)).map(user => (
                        <Badge key={user.id} variant="secondary" className="gap-1 pr-1">
                          {user.full_name}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => handleChange("observers", formData.observers.filter((id: string) => id !== user.id))} />
                        </Badge>
                      ))}
                      <Select value="" onValueChange={(v) => !formData.observers.includes(v) && handleChange("observers", [...formData.observers, v])}>
                        <SelectTrigger className="h-7 w-[130px] border-dashed text-xs">
                          <Plus className="h-3 w-3 mr-1" /> Add observer
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((user: any) => (
                            <SelectItem key={user.id} value={user.id}>{user.full_name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 mb-1">
                      <Label className="text-[11px] text-muted-foreground uppercase font-semibold">Internal Comment</Label>
                      <Info className="h-3 w-3 text-muted-foreground/50" />
                    </div>
                    <div className="border rounded-lg shadow-inner bg-card overflow-hidden">
                      <div className="flex items-center gap-1 p-1.5 border-b bg-muted/10">
                        <Button variant="ghost" size="icon" className="h-7 w-7"><Bold className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7"><Italic className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7"><Underline className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7"><Strikethrough className="h-3.5 w-3.5" /></Button>
                        <div className="w-px h-4 bg-border mx-1" />
                        <Button variant="ghost" size="icon" className="h-7 w-7"><List className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7"><Link className="h-3.5 w-3.5" /></Button>
                      </div>
                      <Textarea 
                        className="border-0 focus-visible:ring-0 min-h-[100px] text-sm resize-none" 
                        placeholder="Write a comment..."
                        value={formData.notes}
                        onChange={(e) => handleChange("notes", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions Helper */}
              <div className="flex items-center justify-between px-2 text-[11px] text-muted-foreground font-medium pb-24">
                <div className="flex items-center gap-4">
                  <span className="hover:text-primary cursor-pointer">Add section</span>
                  <span className="hover:text-primary cursor-pointer">Market</span>
                </div>
                <div className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                  <User className="h-3 w-3" />
                  <span>Use standard layout</span>
                </div>
              </div>
            </>
          )}

          {activeTab === "Market" && (
            <div className="bg-card rounded-lg border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2">
              <div className="px-4 py-3 bg-muted/30 border-b">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">Professional Info</span>
              </div>
              <div className="p-4 space-y-5">
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-muted-foreground uppercase font-semibold">Company</Label>
                  <Select value={formData.companyId} onValueChange={(v) => handleChange("companyId", v)}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company: any) => (
                        <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[11px] text-muted-foreground uppercase font-semibold">Position</Label>
                  <div className="relative">
                    <Input 
                      className="h-10 pl-10" 
                      value={formData.position}
                      onChange={(e) => handleChange("position", e.target.value)}
                      placeholder="e.g. CEO, Director"
                    />
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-muted/30">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-muted-foreground uppercase font-semibold">Source</Label>
                    <Select value={formData.source} onValueChange={(v) => handleChange("source", v)}>
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="call">Call</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-muted-foreground uppercase font-semibold">Source Info</Label>
                    <Input 
                      className="h-10" 
                      value={formData.sourceInfo}
                      onChange={(e) => handleChange("sourceInfo", e.target.value)}
                      placeholder="e.g. Summer Campaign"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "History" && (
            <div className="bg-card rounded-lg border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2">
              <div className="px-4 py-3 bg-muted/30 border-b">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">Internal Context</span>
              </div>
              <div className="p-4 space-y-6">
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-muted-foreground uppercase font-semibold">Internal Notes</Label>
                  <Textarea 
                    className="min-h-[150px] text-sm" 
                    placeholder="Capture history, background, or internal context..."
                    value={formData.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                  />
                </div>

                <div className="space-y-1.5 pt-4 border-t border-muted/30">
                  <Label className="text-[11px] text-muted-foreground uppercase font-semibold">Observers</Label>
                  <p className="text-[10px] text-muted-foreground mb-3 italic">These users will be notified about activities regarding this contact.</p>
                  <div className="flex flex-wrap gap-2 items-center min-h-[40px] p-2 bg-muted/20 border border-dashed rounded-lg">
                    {users.filter(u => formData.observers.includes(u.id)).map(user => (
                      <Badge key={user.id} variant="secondary" className="gap-1 pr-1 bg-background border shadow-sm">
                        {user.full_name}
                        <X className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-destructive" onClick={() => handleChange("observers", formData.observers.filter((id: string) => id !== user.id))} />
                      </Badge>
                    ))}
                    <Select value="" onValueChange={(v) => !formData.observers.includes(v) && handleChange("observers", [...formData.observers, v])}>
                      <SelectTrigger className="h-8 w-[140px] border-dashed text-xs bg-transparent">
                        <Plus className="h-3 w-3 mr-1" /> Add observer
                      </SelectTrigger>
                      <SelectContent>
                        {users.filter(u => !formData.observers.includes(u.id)).map((user: any) => (
                          <SelectItem key={user.id} value={user.id}>{user.full_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "More" && (
            <div className="bg-card rounded-lg border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2">
              <div className="px-4 py-3 bg-muted/30 border-b">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">Classification & Permissions</span>
              </div>
              <div className="p-4 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-muted-foreground uppercase font-semibold">Contact type</Label>
                    <Select value={formData.contactType} onValueChange={(v) => handleChange("contactType", v)}>
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="signing_party">Signing Party</SelectItem>
                        <SelectItem value="clients">Clients</SelectItem>
                        <SelectItem value="partners">Partners</SelectItem>
                        <SelectItem value="vendors">Vendors</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-muted-foreground uppercase font-semibold">Responsible</Label>
                    <Select value={formData.responsibleId} onValueChange={(v) => handleChange("responsibleId", v)}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select one" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user: any) => (
                          <SelectItem key={user.id} value={user.id}>{user.full_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-muted/30">
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center space-x-3 cursor-pointer group">
                      <Checkbox 
                        id="available-more" 
                        checked={formData.isPublic} 
                        onCheckedChange={(v) => handleChange("isPublic", !!v)}
                      />
                      <div className="space-y-0.5">
                        <Label htmlFor="available-more" className="text-sm font-bold cursor-pointer">Public availability</Label>
                        <p className="text-[10px] text-muted-foreground">Visible to all employees</p>
                      </div>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer group">
                      <Checkbox 
                        id="export-more" 
                        checked={formData.includeInExport} 
                        onCheckedChange={(v) => handleChange("includeInExport", !!v)}
                      />
                      <div className="space-y-0.5">
                        <Label htmlFor="export-more" className="text-sm font-bold cursor-pointer">Include in exports</Label>
                        <p className="text-[10px] text-muted-foreground">Allowed for CSV downloading</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-muted/30">
                  <Label className="text-[11px] text-muted-foreground uppercase font-semibold">Tags</Label>
                  <Input 
                    placeholder="Add tags separated by commas..." 
                    className="h-10"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = (e.currentTarget as HTMLInputElement).value.trim();
                        if (val) {
                          handleChange("tags", [...formData.tags, val]);
                          (e.currentTarget as HTMLInputElement).value = '';
                        }
                        e.preventDefault();
                      }
                    }}
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {formData.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary" className="text-[10px] uppercase font-bold py-0 h-5">
                        {tag}
                        <X className="ml-1 h-2 w-2 cursor-pointer" onClick={() => handleChange("tags", formData.tags.filter((_, idx) => idx !== i))} />
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Activity Panel */}
        <div className="hidden lg:block w-[400px] xl:w-[450px]">
          <div className="bg-card rounded-lg border shadow-sm sticky top-[120px] overflow-hidden">
            {/* Activity Tabs */}
            <div className="flex items-center gap-0.5 p-1.5 border-b bg-muted/20">
              <div className="w-8 h-8 rounded bg-primary shadow-sm flex items-center justify-center mr-2">
                <Pencil className="h-4 w-4 text-primary-foreground" />
              </div>
              {activityTabs.map((tab) => (
                <Button
                  key={tab}
                  variant="ghost"
                  onClick={() => setActiveActivityTab(tab)}
                  className={cn(
                    "h-8 px-2.5 text-[11px] font-bold rounded uppercase tracking-tighter",
                    activeActivityTab === tab
                      ? "bg-background text-primary shadow-sm ring-1 ring-border"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  )}
                >
                  {tab === "Booking" && <span className="text-[8px] bg-destructive text-destructive-foreground px-1 py-0 rounded mr-1 animate-pulse">NEW</span>}
                  {tab}
                </Button>
              ))}
            </div>

            {/* Things to do */}
            <div className="p-5 space-y-5">
              <div className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2 border border-muted-foreground/10">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Things to do</span>
                <div className="flex items-center gap-1 text-[10px] font-extrabold text-primary/80 hover:text-primary cursor-pointer transition-colors">
                  ACTIONS <span className="text-[8px]">▼</span>
                </div>
              </div>

              <div className="flex justify-center -my-2">
                <Badge variant="outline" className="bg-success/5 text-success border-success/30 font-bold px-3 py-0 scale-90">
                  CURRENT TASK
                </Badge>
              </div>

              <div className="relative p-4 bg-primary/5 rounded-xl border border-primary/20 shadow-sm transition-all hover:shadow-md group">
                <div className="absolute -left-1 top-4 w-1 h-8 bg-primary rounded-full" />
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20">
                    <Plus className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Add a new activity</p>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">Plan your next step to stay ahead of events and maintain momentum with this contact.</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-dashed border-muted"></div></div>
                <Badge variant="outline" className="relative bg-background text-muted-foreground border-muted font-bold text-[10px] px-4">
                  TODAY
                </Badge>
              </div>

              <div className="p-4 bg-muted/30 rounded-xl border border-muted/50 transition-all hover:bg-muted/40">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 border border-muted-foreground/20">
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground">Status Update</p>
                    <p className="text-sm text-foreground italic">"You are now adding a new signing party contact to the system."</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold mt-2">Just Now</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-20 flex items-center justify-center gap-4 p-4 bg-background/80 backdrop-blur-md border-t shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
        <Button 
          className="bg-green-600 hover:bg-green-500 text-white font-black px-12 h-11 tracking-tighter shadow-lg shadow-green-600/20" 
          onClick={handleSave}
          disabled={createSigningParty.isPending}
        >
          {createSigningParty.isPending ? "SAVING..." : "SAVE"}
        </Button>
        <Button 
          variant="ghost" 
          onClick={handleCancel}
          className="font-bold text-muted-foreground hover:text-foreground h-11"
          disabled={createSigningParty.isPending}
        >
          CANCEL
        </Button>
        <div className="absolute right-8 hidden xl:flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] text-primary/70">{formData.contactType.replace('_', ' ')}</Badge>
        </div>
      </div>
    </div>
  );
}
