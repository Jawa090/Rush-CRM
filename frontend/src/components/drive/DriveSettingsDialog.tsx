import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface DriveSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DriveSettingsDialog({ open, onOpenChange }: DriveSettingsDialogProps) {
  const [showHiddenFiles, setShowHiddenFiles] = useState(false);
  const [defaultView, setDefaultView] = useState("grid");
  const [recycleBinDays, setRecycleBinDays] = useState("30");
  const [autoSync, setAutoSync] = useState(true);

  const handleSave = () => {
    const settings = { showHiddenFiles, defaultView, recycleBinDays, autoSync };
    localStorage.setItem("drive_settings", JSON.stringify(settings));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Drive Settings</DialogTitle>
          <DialogDescription>
            Configure your drive preferences and display options.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Hidden Files</Label>
              <p className="text-xs text-muted-foreground">
                Display files that start with a dot
              </p>
            </div>
            <Switch
              checked={showHiddenFiles}
              onCheckedChange={setShowHiddenFiles}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto Sync</Label>
              <p className="text-xs text-muted-foreground">
                Automatically sync connected drives
              </p>
            </div>
            <Switch
              checked={autoSync}
              onCheckedChange={setAutoSync}
            />
          </div>

          <div className="space-y-2">
            <Label>Default View</Label>
            <Select value={defaultView} onValueChange={setDefaultView}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">Grid View</SelectItem>
                <SelectItem value="list">List View</SelectItem>
                <SelectItem value="compact">Compact View</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Recycle Bin Retention</Label>
            <Select value={recycleBinDays} onValueChange={setRecycleBinDays}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="14">14 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="60">60 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Files in recycle bin will be permanently deleted after this period
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
