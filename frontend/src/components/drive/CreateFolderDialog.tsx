import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FolderOpen } from "lucide-react";

interface CreateFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateFolder: (name: string, color: string) => void;
}

const folderColors = [
  { value: "folder-blue", label: "Blue", color: "hsl(210 100% 50%)" },
  { value: "folder-sky", label: "Sky", color: "hsl(var(--primary))" },
  { value: "folder-violet", label: "Violet", color: "hsl(270 100% 60%)" },
  { value: "folder-amber", label: "Amber", color: "hsl(40 100% 50%)" },
];

export function CreateFolderDialog({ open, onOpenChange, onCreateFolder }: CreateFolderDialogProps) {
  const [folderName, setFolderName] = useState("");
  const [selectedColor, setSelectedColor] = useState("folder-blue");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (folderName.trim()) {
      onCreateFolder(folderName.trim(), selectedColor);
      setFolderName("");
      setSelectedColor("folder-blue");
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setFolderName("");
    setSelectedColor("folder-blue");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-blue-600" />
            Create New Folder
          </DialogTitle>
          <DialogDescription>
            Create a new folder to organize your files. Choose a name and color for easy identification.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="folder-name">Folder Name</Label>
              <Input
                id="folder-name"
                placeholder="Enter folder name..."
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="folder-color">Folder Color</Label>
              <Select value={selectedColor} onValueChange={setSelectedColor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a color" />
                </SelectTrigger>
                <SelectContent>
                  {folderColors.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: color.color }}
                        />
                        {color.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Preview */}
            <div className="grid gap-2">
              <Label>Preview</Label>
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                <div 
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: folderColors.find(c => c.value === selectedColor)?.color }}
                >
                  <FolderOpen className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-medium">{folderName || "New Folder"}</p>
                  <p className="text-sm text-muted-foreground">0 files</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!folderName.trim()}>
              Create Folder
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}