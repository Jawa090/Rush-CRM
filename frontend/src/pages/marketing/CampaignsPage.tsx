import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Mail, MessageSquare, Share2, Search, MoreHorizontal, Trash2, Edit, Send, TestTube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useMarketingCampaigns, useCreateCampaign, useUpdateCampaign, useDeleteCampaign, useMarketingLists } from "@/hooks/useMarketingData";
import { marketingApi } from "@/lib/api";
import { format } from "date-fns";
import { toast } from "sonner";

const channelIcons: Record<string, React.ReactNode> = {
  email: <Mail className="h-4 w-4" />,
  sms: <MessageSquare className="h-4 w-4" />,
  whatsapp: <MessageSquare className="h-4 w-4" />,
  social: <Share2 className="h-4 w-4" />,
};

const statusColors: Record<string, string> = {
  draft: "outline",
  scheduled: "secondary",
  active: "default",
  paused: "secondary",
  completed: "secondary",
};

export default function CampaignsPage() {
  const navigate = useNavigate();
  const { data: campaigns = [], isLoading } = useMarketingCampaigns();
  const { data: lists = [] } = useMarketingLists();
  const createCampaign = useCreateCampaign();
  const updateCampaign = useUpdateCampaign();
  const deleteCampaign = useDeleteCampaign();
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showTestEmail, setShowTestEmail] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [testEmail, setTestEmail] = useState("");
  const [sending, setSending] = useState(false);

  const [form, setForm] = useState({
    name: "", description: "", campaign_type: "email", channel: "email",
    subject_line: "", from_name: "", from_email: "", list_id: "",
  });

  const filtered = campaigns.filter((c: any) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreate = () => {
    createCampaign.mutate({
      name: form.name,
      description: form.description || null,
      campaign_type: form.campaign_type,
      channel: form.channel,
      subject_line: form.subject_line || null,
      from_name: form.from_name || null,
      from_email: form.from_email || null,
      list_id: form.list_id || null,
    } as any, {
      onSuccess: () => {
        setShowCreate(false);
        setForm({ name: "", description: "", campaign_type: "email", channel: "email", subject_line: "", from_name: "", from_email: "", list_id: "" });
      },
    });
  };

  const handleSendCampaign = async (campaign: any) => {
    if (!campaign.list_id) {
      toast.error("Campaign must have a target list to send");
      return;
    }

    if (!campaign.subject || !campaign.content) {
      toast.error("Campaign must have subject and content");
      return;
    }

    if (!confirm(`Send campaign "${campaign.name}" to all contacts in the list?`)) {
      return;
    }

    setSending(true);
    try {
      const result = await marketingApi.sendCampaign(campaign.id);
      toast.success(result.message || "Campaign sent successfully");
      // Refresh campaigns
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "Failed to send campaign");
    } finally {
      setSending(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      toast.error("Please enter a test email address");
      return;
    }

    setSending(true);
    try {
      await marketingApi.sendTestEmail(selectedCampaign.id, testEmail);
      toast.success(`Test email sent to ${testEmail}`);
      setShowTestEmail(false);
      setTestEmail("");
    } catch (error: any) {
      toast.error(error.message || "Failed to send test email");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">Campaigns</h1>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/marketing/campaigns/builder")} variant="outline" className="gap-2">
            <Mail className="h-4 w-4" /> Visual Builder
          </Button>
          <Button onClick={() => navigate("/marketing/campaigns/create")} className="gap-2">
            <Plus className="h-4 w-4" /> New Campaign
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search campaigns..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading campaigns...</div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Mail className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p>No campaigns found. Create your first campaign to start engaging your audience.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Sent</TableHead>
                <TableHead className="text-right">Opened</TableHead>
                <TableHead className="text-right">Clicked</TableHead>
                <TableHead className="text-right">Conversions</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{c.name}</p>
                      {c.subject_line && <p className="text-xs text-muted-foreground truncate max-w-[200px]">{c.subject_line}</p>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 capitalize">
                      {channelIcons[c.channel] || <Mail className="h-4 w-4" />}
                      <span className="text-sm">{c.channel || 'email'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={(statusColors[c.status] || "outline") as any} className="capitalize">{c.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{(c.sent_count || 0).toLocaleString()}</TableCell>
                  <TableCell className="text-right">{(c.opened_count || 0).toLocaleString()}</TableCell>
                  <TableCell className="text-right">{(c.clicked_count || 0).toLocaleString()}</TableCell>
                  <TableCell className="text-right">{(c.total_conversions || 0).toLocaleString()}</TableCell>                  <TableCell className="text-sm text-muted-foreground">{format(new Date(c.created_at), "MMM d, yyyy")}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => handleSendCampaign(c)}
                          disabled={sending || c.status === 'sent'}
                        >
                          <Send className="h-4 w-4 mr-2" /> Send Campaign
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedCampaign(c);
                            setShowTestEmail(true);
                          }}
                        >
                          <TestTube className="h-4 w-4 mr-2" /> Send Test Email
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateCampaign.mutate({ id: c.id, status: c.status === "active" ? "paused" : "active" })}>
                          {c.status === "active" ? "Pause" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => deleteCampaign.mutate(c.id)}>
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create Campaign Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>New Campaign</DialogTitle>
            <DialogDescription>Set up a new marketing campaign across any channel.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Campaign Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Q1 Product Launch" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Channel</Label>
                <Select value={form.channel} onValueChange={(v) => setForm({ ...form, channel: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.campaign_type} onValueChange={(v) => setForm({ ...form, campaign_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email Blast</SelectItem>
                    <SelectItem value="sms">SMS Blast</SelectItem>
                    <SelectItem value="multi_channel">Multi-Channel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {form.channel === "email" && (
              <>
                <div className="space-y-2">
                  <Label>Subject Line</Label>
                  <Input value={form.subject_line} onChange={(e) => setForm({ ...form, subject_line: e.target.value })} placeholder="Your email subject" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>From Name</Label>
                    <Input value={form.from_name} onChange={(e) => setForm({ ...form, from_name: e.target.value })} placeholder="Your Company" />
                  </div>
                  <div className="space-y-2">
                    <Label>From Email</Label>
                    <Input value={form.from_email} onChange={(e) => setForm({ ...form, from_email: e.target.value })} placeholder="hello@company.com" />
                  </div>
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label>Target List</Label>
              <Select value={form.list_id} onValueChange={(v) => setForm({ ...form, list_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select a list..." /></SelectTrigger>
                <SelectContent>
                  {lists.map((l) => (
                    <SelectItem key={l.id} value={l.id}>{l.name} ({l.member_count})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Campaign description..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!form.name.trim() || createCampaign.isPending}>
              {createCampaign.isPending ? "Creating..." : "Create Campaign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Email Dialog */}
      <Dialog open={showTestEmail} onOpenChange={setShowTestEmail}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Test Email</DialogTitle>
            <DialogDescription>
              Send a test email to verify your campaign before sending to your entire list
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Test Email Address</Label>
              <Input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
              />
            </div>
            {selectedCampaign && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">Campaign: {selectedCampaign.name}</p>
                <p className="text-xs text-muted-foreground">
                  Subject: {selectedCampaign.subject || 'No subject'}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTestEmail(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendTestEmail} disabled={sending || !testEmail}>
              {sending ? "Sending..." : "Send Test"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
