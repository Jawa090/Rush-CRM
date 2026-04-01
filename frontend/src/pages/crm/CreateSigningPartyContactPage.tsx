import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Pencil, Calendar, Search, Plus, Bold, Italic, Underline, Strikethrough, List, ListOrdered, Link, AtSign } from "lucide-react";
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

const tabs = ["General", "History", "Market", "More"];
const activityTabs = ["Activity", "Comment", "Message", "Booking", "Task", "More"];

export default function CreateSigningPartyContactPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("General");
  const [activeActivityTab, setActiveActivityTab] = useState("Activity");

  const handleCancel = () => {
    navigate("/crm/customers/signing-parties/contacts");
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    navigate("/crm/customers/signing-parties/contacts");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-card">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-destructive/10 hover:bg-destructive/20"
            onClick={handleCancel}
          >
            <X className="h-4 w-4 text-destructive" />
          </Button>
          <h1 className="text-lg font-semibold">New contact</h1>
          <Pencil className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 px-4 py-2 border-b bg-card">
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
      <div className="flex gap-6 p-4">
        {/* Left Column - Form */}
        <div className="flex-1 space-y-4 max-w-md">
          {/* About Contact Section */}
          <div className="bg-card rounded-lg border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">About Contact</span>
                <Pencil className="h-3 w-3 text-muted-foreground" />
              </div>
              <Button variant="link" className="text-muted-foreground text-xs p-0 h-auto">
                cancel
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Salutation</Label>
                <Select>
                  <SelectTrigger>
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
                <Label className="text-xs text-muted-foreground">Last name</Label>
                <Input placeholder="Contact #" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Name</Label>
                <Input />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Second name</Label>
                <Input />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Photo</Label>
                <Button variant="outline" className="w-full justify-center">
                  ADD IMAGE
                </Button>
                <p className="text-xs text-muted-foreground">File size must not exceed 3 Mb.</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Date of birth</Label>
                <div className="relative">
                  <Input />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Position</Label>
                <Input />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Phone</Label>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1 border rounded-md px-2 min-w-[100px]">
                    <span className="text-sm">🇵🇰</span>
                    <span className="text-sm">+92</span>
                  </div>
                  <Select defaultValue="work">
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="work">Work Phone</SelectItem>
                      <SelectItem value="mobile">Mobile</SelectItem>
                      <SelectItem value="home">Home</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Add</Label>
                <Label className="text-xs text-muted-foreground block">E-mail</Label>
                <div className="flex gap-2">
                  <Input className="flex-1" />
                  <Select defaultValue="work">
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="work">Work</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Add</Label>
                <Label className="text-xs text-muted-foreground block">Website</Label>
                <div className="flex gap-2">
                  <Input className="flex-1" />
                  <Select defaultValue="corporate">
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="corporate">Corporate</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Add</Label>
                <Label className="text-xs text-muted-foreground block">Messenger</Label>
                <div className="flex gap-2">
                  <Input className="flex-1" />
                  <Select defaultValue="facebook">
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="telegram">Telegram</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Add</Label>
                <Label className="text-xs text-muted-foreground block">Company</Label>
                <Label className="text-xs text-muted-foreground block">Contact companies</Label>
                <div className="relative">
                  <Input placeholder="Company name, phone or email" />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                <Button variant="ghost" className="text-muted-foreground text-sm p-0 h-auto">
                  <Plus className="h-3 w-3 mr-1" />
                  Add participant
                </Button>
              </div>

              <Button variant="ghost" className="text-muted-foreground text-sm p-0 h-auto">
                <Plus className="h-3 w-3 mr-1" />
                Add participant
              </Button>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Address</Label>
                  <span className="text-xs text-muted-foreground">expand</span>
                </div>
                <div className="relative">
                  <Input />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Add</Label>
                  <span className="text-xs text-muted-foreground">details</span>
                </div>
                <Label className="text-xs text-muted-foreground block">Details</Label>
                <Button variant="link" className="text-primary text-sm p-0 h-auto">
                  Add
                </Button>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <span className="text-xs text-muted-foreground">Select field</span>
                <span className="text-xs text-muted-foreground">Create field</span>
                <Button variant="link" className="text-destructive text-xs p-0 h-auto ml-auto">
                  Delete section
                </Button>
              </div>
            </div>
          </div>

          {/* More Section */}
          <div className="bg-card rounded-lg border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">More</span>
                <Pencil className="h-3 w-3 text-muted-foreground" />
              </div>
              <Button variant="link" className="text-muted-foreground text-xs p-0 h-auto">
                cancel
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Contact type</Label>
                <Select defaultValue="clients">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clients">Clients</SelectItem>
                    <SelectItem value="partners">Partners</SelectItem>
                    <SelectItem value="vendors">Vendors</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Source</Label>
                <Select defaultValue="call">
                  <SelectTrigger>
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

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Source information</Label>
                <Textarea className="min-h-[80px]" />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="available" defaultChecked />
                <Label htmlFor="available" className="text-sm">Available to everyone</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="export" defaultChecked />
                <Label htmlFor="export" className="text-sm">Included in export</Label>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Responsible person</Label>
                  <span className="text-xs text-muted-foreground uppercase">Change</span>
                </div>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-muted">A</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-primary">ahsan.khan@rushcorporation.com</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Observers</Label>
                <Button variant="ghost" className="text-muted-foreground text-sm p-0 h-auto">
                  <Plus className="h-3 w-3 mr-1" />
                  Add observer
                </Button>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Comment</Label>
                <div className="border rounded-md">
                  <div className="flex items-center gap-1 p-2 border-b">
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Bold className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Italic className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Underline className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Strikethrough className="h-3.5 w-3.5" />
                    </Button>
                    <div className="w-px h-4 bg-border mx-1" />
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <List className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <ListOrdered className="h-3.5 w-3.5" />
                    </Button>
                    <div className="w-px h-4 bg-border mx-1" />
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Link className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <AtSign className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <Textarea className="border-0 focus-visible:ring-0 min-h-[60px]" />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <span className="text-xs text-muted-foreground">Select field</span>
                <span className="text-xs text-muted-foreground">Create field</span>
                <Button variant="link" className="text-destructive text-xs p-0 h-auto ml-auto">
                  Delete section
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Add section</span>
            <span>Market</span>
            <span className="flex items-center gap-1">
              <span>👤</span>
              Use standard layout
            </span>
          </div>
        </div>

        {/* Right Column - Activity Panel */}
        <div className="flex-1 max-w-lg">
          <div className="bg-card rounded-lg border">
            {/* Activity Tabs */}
            <div className="flex items-center gap-1 p-2 border-b">
              <div className="w-8 h-8 rounded bg-primary flex items-center justify-center mr-2">
                <span className="text-primary-foreground text-sm">📋</span>
              </div>
              {activityTabs.map((tab) => (
                <Button
                  key={tab}
                  variant="ghost"
                  onClick={() => setActiveActivityTab(tab)}
                  className={cn(
                    "px-2 py-1 text-xs font-medium rounded",
                    activeActivityTab === tab
                      ? "bg-muted"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab === "Booking" && <span className="text-[10px] text-destructive mr-1">NEW</span>}
                  {tab}
                </Button>
              ))}
            </div>

            {/* Things to do */}
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                <span className="text-sm text-muted-foreground">Things to do</span>
                <span className="text-xs text-muted-foreground">actions ▾</span>
              </div>

              <div className="flex justify-center">
                <Badge className="bg-success text-success-foreground">Things to do</Badge>
              </div>

              <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Plus className="h-3 w-3 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Add a new activity</p>
                  <p className="text-xs text-muted-foreground">Plan your next step to stay ahead of events.</p>
                </div>
              </div>

              <div className="flex justify-center">
                <Badge variant="outline" className="bg-success text-success-foreground border-success">
                  Today
                </Badge>
              </div>

              <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-foreground text-xs">i</span>
                </div>
                <p className="text-sm text-muted-foreground">You are now adding a contact...</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 flex items-center justify-center gap-4 p-4 bg-background border-t">
        <Button className="bg-success hover:bg-success/90 text-success-foreground px-8" onClick={handleSave}>
          SAVE
        </Button>
        <Button variant="ghost" onClick={handleCancel}>
          CANCEL
        </Button>
      </div>
    </div>
  );
}
