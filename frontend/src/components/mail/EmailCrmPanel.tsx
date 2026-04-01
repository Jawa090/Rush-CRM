import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  UserPlus,
  Briefcase,
  Target,
  Link2,
  Plus,
  ExternalLink,
  Unlink,
  Activity,
  Search,
} from "lucide-react";
import { api } from '@/lib/api';
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";

interface EmailCrmPanelProps {
  email: any;
}

const entityIcons: Record<string, any> = {
  contact: UserPlus,
  lead: Target,
  deal: Briefcase,
  company: ExternalLink,
};

const entityColors: Record<string, string> = {
  contact: "bg-blue-500/10 text-blue-600",
  lead: "bg-amber-500/10 text-amber-600",
  deal: "bg-emerald-500/10 text-emerald-600",
  company: "bg-purple-500/10 text-purple-600",
};

export function EmailCrmPanel({ email }: EmailCrmPanelProps) {
  const { user } = useAuth();
  const { organization } = useOrganization();
  const queryClient = useQueryClient();
  const [convertDialog, setConvertDialog] = useState<string | null>(null);
  const [convertForm, setConvertForm] = useState({ title: "", notes: "" });
  const [converting, setConverting] = useState(false);
  const [linkSearch, setLinkSearch] = useState("");

  // Linked entities
  const { data: linkedEntities = [] } = useQuery({
    queryKey: ["email-crm-links", email.id],
    queryFn: async () => {
      const data = await api.get<any[]>('/email/crm-links', { email_id: email.id });
      const enriched = await Promise.all(
        (data || []).map(async (link: any) => {
          let entityName = 'Unknown';
          try {
            if (link.entity_type === 'contact') { const c = await api.get<any>(`/contacts/${link.entity_id}`); entityName = c ? `${c.first_name} ${c.last_name || ''}`.trim() : 'Unknown Contact'; }
            else if (link.entity_type === 'company') { const c = await api.get<any>(`/companies/${link.entity_id}`); entityName = c?.name || 'Unknown Company'; }
            else if (link.entity_type === 'lead') { const l = await api.get<any>(`/leads/${link.entity_id}`); entityName = l?.title || 'Unknown Lead'; }
            else if (link.entity_type === 'deal') { const d = await api.get<any>(`/deals/${link.entity_id}`); entityName = d?.title || 'Unknown Deal'; }
          } catch {}
          return { ...link, entityName };
        })
      );
      return enriched;
    },
    enabled: !!email.id,
  });

  // Auto-match contacts by email address
  const { data: matchedContacts = [] } = useQuery({
    queryKey: ["email-contact-match", email.from_address],
    queryFn: async () => {
      if (!email.from_address || !organization) return [];
      const data = await api.get<any[]>('/contacts', { search: email.from_address, limit: '5' });
      return (data as any)?.data || data || [];
    },
    enabled: !!email.from_address && !!organization,
  });

  // Activity log
  const { data: activities = [] } = useQuery({
    queryKey: ["email-activities", email.id],
    queryFn: async () => {
      const data = await api.get<any[]>('/activities/email/' + email.id).catch(() => []);
      return data || [];
    },
    enabled: !!email.id,
  });

  const handleConvert = async (entityType: string) => {
    if (!user || !organization) return;
    setConverting(true);
    try {
      let entityId: string | null = null;

      if (entityType === 'contact') {
        const data = await api.post<any>('/contacts', { first_name: email.from_name || email.from_address.split('@')[0], email: email.from_address });
        entityId = data.id;
      } else if (entityType === 'lead') {
        const data = await api.post<any>('/leads', { title: convertForm.title || email.subject || 'New Lead from Email', source: 'email' });
        entityId = data.id;
      } else if (entityType === 'deal') {
        const data = await api.post<any>('/deals', { title: convertForm.title || email.subject || 'New Deal from Email' });
        entityId = data.id;
      }
      if (entityId) {
        await api.post('/email/crm-links', { email_id: email.id, entity_type: entityType, entity_id: entityId, link_type: 'converted' });
      }

      toast.success(`Created new ${entityType} from email`);
      setConvertDialog(null);
      setConvertForm({ title: "", notes: "" });
      queryClient.invalidateQueries({ queryKey: ["email-crm-links"] });
      queryClient.invalidateQueries({ queryKey: ["email-activities"] });
    } catch (err: any) {
      toast.error(err.message || `Failed to create ${entityType}`);
    } finally {
      setConverting(false);
    }
  };

  const handleUnlink = async (linkId: string) => {
    await api.delete(`/email/crm-links/${linkId}`);
    toast.success('Unlinked from CRM record');
    queryClient.invalidateQueries({ queryKey: ['email-crm-links'] });
  };

  return (
    <Card className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Link2 className="h-4 w-4 text-primary" />
          CRM Context
        </h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 text-xs">
              <Plus className="h-3 w-3 mr-1" /> Convert
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setConvertForm({ title: "", notes: "" }); setConvertDialog("contact"); }}>
              <UserPlus className="h-4 w-4 mr-2" /> Create Contact
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setConvertForm({ title: email.subject || "", notes: "" }); setConvertDialog("lead"); }}>
              <Target className="h-4 w-4 mr-2" /> Create Lead
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setConvertForm({ title: email.subject || "", notes: "" }); setConvertDialog("deal"); }}>
              <Briefcase className="h-4 w-4 mr-2" /> Create Deal
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Auto-matched contacts */}
      {matchedContacts.length > 0 && linkedEntities.filter(l => l.entity_type === "contact").length === 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            Auto-matched
          </p>
          {matchedContacts.map((c: any) => (
            <div key={c.id} className="flex items-center justify-between p-2 rounded-lg bg-blue-500/5 border border-blue-500/10">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-blue-500/10 text-blue-600">
                  <UserPlus className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-xs font-medium">{c.first_name} {c.last_name || ""}</p>
                  <p className="text-[10px] text-muted-foreground">{c.email}</p>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] h-4">Contact</Badge>
            </div>
          ))}
        </div>
      )}

      {/* Linked entities */}
      {linkedEntities.length > 0 ? (
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            Linked Records
          </p>
          {linkedEntities.map((link: any) => {
            const Icon = entityIcons[link.entity_type] || Link2;
            return (
              <div key={link.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50 group">
                <div className="flex items-center gap-2">
                  <div className={`p-1 rounded ${entityColors[link.entity_type] || ""}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium">{link.entityName}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">
                      {link.entity_type} · {link.link_type}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleUnlink(link.id)}
                >
                  <Unlink className="h-3 w-3 text-muted-foreground" />
                </Button>
              </div>
            );
          })}
        </div>
      ) : matchedContacts.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-2">
          No CRM records linked
        </p>
      ) : null}

      {/* Activity log */}
      {activities.length > 0 && (
        <div className="space-y-2 pt-2 border-t">
          <h4 className="text-xs font-medium flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5" /> Activity
          </h4>
          <ScrollArea className="max-h-[120px]">
            <div className="space-y-1.5">
              {activities.map((act: any) => (
                <div key={act.id} className="text-[11px] text-muted-foreground">
                  <span className="font-medium text-foreground">{act.title}</span>
                  <span className="ml-1">
                    {format(new Date(act.created_at), "MMM d, h:mm a")}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Convert Dialog */}
      <Dialog open={!!convertDialog} onOpenChange={(o) => !o && setConvertDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="capitalize">
              Create {convertDialog} from Email
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {convertDialog !== "contact" && (
              <div className="space-y-1">
                <Label className="text-xs">Title</Label>
                <Input
                  value={convertForm.title}
                  onChange={(e) => setConvertForm({ ...convertForm, title: e.target.value })}
                  placeholder={`${convertDialog} title`}
                />
              </div>
            )}
            <div className="space-y-1">
              <Label className="text-xs">Notes</Label>
              <Textarea
                value={convertForm.notes}
                onChange={(e) => setConvertForm({ ...convertForm, notes: e.target.value })}
                placeholder="Additional notes..."
                className="min-h-[80px]"
              />
            </div>
            <div className="text-xs text-muted-foreground p-2 rounded bg-muted/50">
              From: {email.from_name || email.from_address}
              <br />
              Subject: {email.subject}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConvertDialog(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => convertDialog && handleConvert(convertDialog)}
              disabled={converting}
              className="gradient-primary text-primary-foreground"
            >
              {converting ? "Creating..." : `Create ${convertDialog}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
