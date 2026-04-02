import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Send, Eye, Save, Sparkles, Mail } from "lucide-react";
import { useCreateCampaign, useMarketingLists } from "@/hooks/useMarketingData";
import { emailTemplates, personalizationTokens } from "@/data/emailTemplates";
import { toast } from "sonner";

export default function CreateCampaignPage() {
  const navigate = useNavigate();
  const createCampaign = useCreateCampaign();
  const { data: lists = [] } = useMarketingLists();

  const [form, setForm] = useState({
    name: "",
    description: "",
    channel: "email",
    campaign_type: "email",
    subject: "",
    from_name: "",
    from_email: "",
    list_id: "",
    content: "",
  });

  const [showTemplates, setShowTemplates] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showTokens, setShowTokens] = useState(false);

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ["link", "image"],
      ["clean"],
    ],
  };

  const handleTemplateSelect = (template: typeof emailTemplates[0]) => {
    setForm({
      ...form,
      subject: template.subject,
      content: template.htmlContent,
    });
    setShowTemplates(false);
    toast.success(`Template "${template.name}" applied`);
  };

  const insertToken = (token: string) => {
    setForm({ ...form, subject: form.subject + token });
    setShowTokens(false);
  };

  const handleSave = async (status: "draft" | "scheduled") => {
    if (!form.name || !form.subject || !form.content) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createCampaign.mutateAsync({
        name: form.name,
        description: form.description,
        type: form.campaign_type,
        campaign_type: form.campaign_type,
        subject: form.subject,
        content: form.content,
        list_id: form.list_id || null,
        status,
        channel: form.channel,
        from_name: form.from_name,
        from_email: form.from_email,
      } as any);
      
      toast.success(`Campaign ${status === "draft" ? "saved" : "scheduled"} successfully`);
      
      // Navigate immediately - cache will auto-refresh
      navigate("/marketing/campaigns");
    } catch (error) {
      toast.error("Failed to create campaign");
      console.error("Campaign creation error:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/marketing/campaigns")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create Email Campaign</h1>
            <p className="text-sm text-muted-foreground">Design and send professional email campaigns</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPreview(true)}>
            <Eye className="h-4 w-4 mr-2" /> Preview
          </Button>
          <Button variant="outline" onClick={() => handleSave("draft")}>
            <Save className="h-4 w-4 mr-2" /> Save Draft
          </Button>
          <Button onClick={() => handleSave("scheduled")}>
            <Send className="h-4 w-4 mr-2" /> Schedule Send
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Campaign Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Campaign Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Campaign Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Summer Newsletter 2026"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Internal description for your team"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>From Name</Label>
                  <Input
                    value={form.from_name}
                    onChange={(e) => setForm({ ...form, from_name: e.target.value })}
                    placeholder="Your Company"
                  />
                </div>
                <div className="space-y-2">
                  <Label>From Email</Label>
                  <Input
                    type="email"
                    value={form.from_email}
                    onChange={(e) => setForm({ ...form, from_email: e.target.value })}
                    placeholder="hello@company.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Content */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Email Content</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowTemplates(true)}>
                  <Sparkles className="h-4 w-4 mr-2" /> Use Template
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowTokens(true)}>
                  Add Token
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Subject Line *</Label>
                <Input
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="Your compelling subject line..."
                />
                <p className="text-xs text-muted-foreground">
                  Use personalization tokens like {`{{first_name}}`} for better engagement
                </p>
              </div>

              <div className="space-y-2">
                <Label>Email Body *</Label>
                <div className="border rounded-lg overflow-hidden">
                  <ReactQuill
                    theme="snow"
                    value={form.content}
                    onChange={(value) => setForm({ ...form, content: value })}
                    modules={quillModules}
                    placeholder="Write your email content here..."
                    style={{ minHeight: "400px" }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Audience */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Audience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select List</Label>
                <Select value={form.list_id} onValueChange={(v) => setForm({ ...form, list_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a list..." />
                  </SelectTrigger>
                  <SelectContent>
                    {lists.map((list: any) => (
                      <SelectItem key={list.id} value={list.id}>
                        {list.name} ({list.member_count || 0})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {form.list_id && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Recipients</p>
                  <p className="text-2xl font-bold">
                    {lists.find((l: any) => l.id === form.list_id)?.member_count || 0}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Campaign Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Channel</Label>
                <Select value={form.channel} onValueChange={(v) => setForm({ ...form, channel: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="social">Social Media</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Campaign Type</Label>
                <Select value={form.campaign_type} onValueChange={(v) => setForm({ ...form, campaign_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Regular Email</SelectItem>
                    <SelectItem value="newsletter">Newsletter</SelectItem>
                    <SelectItem value="promotional">Promotional</SelectItem>
                    <SelectItem value="transactional">Transactional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-600" />
                <span className="text-blue-900">Email Best Practices</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-800 space-y-2">
              <p>• Keep subject lines under 50 characters</p>
              <p>• Personalize with recipient's name</p>
              <p>• Include a clear call-to-action</p>
              <p>• Test on mobile devices</p>
              <p>• Always include unsubscribe link</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Template Library Dialog */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Choose Email Template</DialogTitle>
            <DialogDescription>
              Select a professionally designed template to get started quickly
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Templates</TabsTrigger>
              <TabsTrigger value="Onboarding">Onboarding</TabsTrigger>
              <TabsTrigger value="Newsletter">Newsletter</TabsTrigger>
              <TabsTrigger value="Promotion">Promotion</TabsTrigger>
              <TabsTrigger value="Event">Event</TabsTrigger>
            </TabsList>
            {["all", "Onboarding", "Newsletter", "Promotion", "Event"].map((category) => (
              <TabsContent key={category} value={category} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {emailTemplates
                    .filter((t) => category === "all" || t.category === category)
                    .map((template) => (
                      <Card
                        key={template.id}
                        className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => handleTemplateSelect(template)}
                      >
                        <CardContent className="pt-6">
                          <div className="text-4xl mb-3">{template.thumbnail}</div>
                          <h3 className="font-semibold mb-1">{template.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                          <Badge variant="secondary">{template.category}</Badge>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Personalization Tokens Dialog */}
      <Dialog open={showTokens} onOpenChange={setShowTokens}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Personalization Tokens</DialogTitle>
            <DialogDescription>
              Click on any token to insert it into your subject line
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {personalizationTokens.map((item) => (
              <div
                key={item.token}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted cursor-pointer"
                onClick={() => insertToken(item.token)}
              >
                <div>
                  <p className="font-mono text-sm font-medium">{item.token}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <Button size="sm" variant="ghost">Insert</Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-b pb-4">
              <p className="text-sm text-muted-foreground">From</p>
              <p className="font-medium">{form.from_name || "Your Company"} &lt;{form.from_email || "hello@company.com"}&gt;</p>
            </div>
            <div className="border-b pb-4">
              <p className="text-sm text-muted-foreground">Subject</p>
              <p className="font-medium">{form.subject || "Your subject line"}</p>
            </div>
            <div className="border rounded-lg p-4 bg-white">
              <div dangerouslySetInnerHTML={{ __html: form.content || "<p>Your email content will appear here...</p>" }} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
