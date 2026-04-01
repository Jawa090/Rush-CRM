import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, HelpCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface CalendarSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const timezones = [
  { value: "utc+5", label: "(UTC +05:00) Asia/Karachi" },
  { value: "utc+5.5", label: "(UTC +05:30) Asia/Kolkata" },
  { value: "utc+0", label: "(UTC +00:00) Europe/London" },
  { value: "utc-5", label: "(UTC -05:00) America/New_York" },
  { value: "utc-8", label: "(UTC -08:00) America/Los_Angeles" },
  { value: "utc+1", label: "(UTC +01:00) Europe/Paris" },
  { value: "utc+8", label: "(UTC +08:00) Asia/Singapore" },
  { value: "utc+9", label: "(UTC +09:00) Asia/Tokyo" },
];

export function CalendarSettingsDialog({ open, onOpenChange }: CalendarSettingsDialogProps) {
  const [timezone, setTimezone] = useState("utc+5");
  const [invitationCalendar, setInvitationCalendar] = useState("default");
  const [crmCalendar, setCrmCalendar] = useState("default");
  const [showDeclinedEvents, setShowDeclinedEvents] = useState(false);
  const [showTasks, setShowTasks] = useState(true);
  const [syncTaskCalendar, setSyncTaskCalendar] = useState(false);
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
  const [dontSendIfAllocated, setDontSendIfAllocated] = useState(false);
  const [showWeekNumber, setShowWeekNumber] = useState(false);
  const [invitationEmail, setInvitationEmail] = useState("");

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your calendar settings have been updated.",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Personal Section */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Personal</h3>
            
            {/* Timezone */}
            <div className="space-y-2 mb-4">
              <Label className="text-sm text-muted-foreground">Your time zone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Invitation Calendar */}
            <div className="space-y-2 mb-4">
              <Label className="text-sm text-muted-foreground">Invitation Calendar</Label>
              <Select value={invitationCalendar} onValueChange={setInvitationCalendar}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select calendar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">user@example.com</SelectItem>
                  <SelectItem value="work">work@company.com</SelectItem>
                  <SelectItem value="personal">personal@email.com</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* CRM Calendar */}
            <div className="space-y-2 mb-6">
              <Label className="text-sm text-muted-foreground">CRM Calendar</Label>
              <Select value={crmCalendar} onValueChange={setCrmCalendar}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select calendar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">user@example.com</SelectItem>
                  <SelectItem value="work">work@company.com</SelectItem>
                  <SelectItem value="crm">crm@company.com</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Checkbox 
                id="showDeclined" 
                checked={showDeclinedEvents}
                onCheckedChange={(checked) => setShowDeclinedEvents(checked as boolean)}
              />
              <Label htmlFor="showDeclined" className="text-sm font-normal cursor-pointer">
                Show events you have declined
              </Label>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox 
                id="showTasks" 
                checked={showTasks}
                onCheckedChange={(checked) => setShowTasks(checked as boolean)}
              />
              <Label htmlFor="showTasks" className="text-sm font-normal cursor-pointer">
                Show tasks
              </Label>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox 
                id="syncTaskCalendar" 
                checked={syncTaskCalendar}
                onCheckedChange={(checked) => setSyncTaskCalendar(checked as boolean)}
              />
              <Label htmlFor="syncTaskCalendar" className="text-sm font-normal cursor-pointer flex items-center gap-2">
                Sync task calendar
                <Lock className="h-3.5 w-3.5 text-warning" />
              </Label>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox 
                id="showCompleted" 
                checked={showCompletedTasks}
                onCheckedChange={(checked) => setShowCompletedTasks(checked as boolean)}
              />
              <Label htmlFor="showCompleted" className="text-sm font-normal cursor-pointer">
                Show completed tasks
              </Label>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox 
                id="dontSendIfAllocated" 
                checked={dontSendIfAllocated}
                onCheckedChange={(checked) => setDontSendIfAllocated(checked as boolean)}
              />
              <Label htmlFor="dontSendIfAllocated" className="text-sm font-normal cursor-pointer">
                Don't send invitation if the time is already allocated
              </Label>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox 
                id="showWeekNumber" 
                checked={showWeekNumber}
                onCheckedChange={(checked) => setShowWeekNumber(checked as boolean)}
              />
              <Label htmlFor="showWeekNumber" className="text-sm font-normal cursor-pointer">
                Show week number
              </Label>
            </div>
          </div>

          {/* Send invitations from email */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-sm text-muted-foreground">Send invitations from email</Label>
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="relative">
              <Input 
                value={invitationEmail}
                onChange={(e) => setInvitationEmail(e.target.value)}
                placeholder="not specified"
                className="pr-10"
              />
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center gap-3 pt-4 border-t">
          <Button 
            className="bg-success hover:bg-success/90 text-success-foreground"
            onClick={handleSave}
          >
            SAVE
          </Button>
          <Button 
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            CLOSE
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
