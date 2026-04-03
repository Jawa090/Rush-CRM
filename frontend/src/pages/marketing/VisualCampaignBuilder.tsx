import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Send } from "lucide-react";
import { useCreateCampaign, useMarketingLists } from "@/hooks/useMarketingData";
import EmailBuilder from "@/components/marketing/EmailBuilder";
import { toast } from "sonner";

export default function VisualCampaignBuilder() {
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
  });

  const [emailDesign, setEmailDesign] = useState<any>(null);
  const [emailHtml, setEmailHtml] = useState("");

  const handleSaveDesign = (design: any, html: string) => {
    setEmailDesign(design);
    setEmailHtml(html);
    toast.success("Email design saved");
  };

  const handlePreview = (html: string) => {
    const previewWindow = window.open("", "_blank");
    if (previewWindow) {
      previewWindow.document.write(html);
      previewWindow.document.close();
    }
  };

  const handleSaveCampaign = async (status: "draft" | "scheduled") => {
    if (!form.name || !form.subject || !emailHtml) {
      toast.error("Please fill in all required fields and design your email");
      return;
    }

    try {
      await createCampaign.mutateAsync({
        name: form.name,
        description: form.description,
        type: form.campaign_type,
        campaign_type: form.campaign_type,
        subject: form.subject,
        content: emailHtml,
        list_id: form.list_id || null,
        status,
        channel: form.channel,
        from_name: form.from_name,
        from_email: form.from_email,
        design: emailDesign, // Store design for future editing
      } as any);

      toast.success(`Campaign ${status === "draft" ? "saved" : "scheduled"} successfully`);
      navigate("/marketing/campaigns");
    } catch (error) {
      toast.error("Failed to create campaign");
      console.error("Campaign creation error:", error);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b bg-white">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/marketing/campaigns")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Visual Email Builder</h1>
            <p className="text-sm text-muted-foreground">
              Drag and drop to create beautiful emails
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSaveCampaign("draft")}>
            <Save className="h-4 w-4 mr-2" /> Save Draft
          </Button>
          <Button onClick={() => handleSaveCampaign("scheduled")}>
            <Send className="h-4 w-4 mr-2" /> Schedule
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Settings Sidebar */}
        <div className="w-80 border-r bg-white overflow-y-auto p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Campaign Settings</h3>
            </div>

            <div className="space-y-2">
              <Label>Campaign Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Summer Sale 2024"
              />
            </div>

            <div className="space-y-2">
              <Label>Subject Line *</Label>
              <Input
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Your compelling subject..."
              />
            </div>

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
                value={form.from_email}
                onChange={(e) => setForm({ ...form, from_email: e.target.value })}
                placeholder="hello@company.com"
              />
            </div>

            <div className="space-y-2">
              <Label>Target List</Label>
              <Select value={form.list_id} onValueChange={(v) => setForm({ ...form, list_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a list..." />
                </SelectTrigger>
                <SelectContent>
                  {lists.map((l: any) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.name} ({l.member_count || 0})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Campaign description..."
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Email Builder */}
        <div className="flex-1 min-h-0 p-6">
          <EmailBuilder
            initialDesign={emailDesign}
            onSave={handleSaveDesign}
            onPreview={handlePreview}
          />
        </div>
      </div>
    </div>
  );
}
