import { useState, useRef, useCallback } from "react";
import { Upload, FileText, Trash2, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useUpdateDeal } from "@/hooks/useCrmMutations";
import { toast } from "sonner";

interface BlueprintFile {
  name: string;
  url: string;
  path: string;
  uploaded_at: string;
  uploaded_by: string;
  size?: number;
}

interface DealBlueprintsSectionProps {
  dealId: string;
  blueprints: BlueprintFile[];
  editing: boolean;
}

export function DealBlueprintsSection({ dealId, blueprints, editing }: DealBlueprintsSectionProps) {
  const { profile, user } = useAuth();
  const updateDeal = useUpdateDeal();
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    if (!profile?.org_id || !user) return;
    setUploading(true);

    try {
      const newBlueprints: BlueprintFile[] = [...blueprints];

      for (const file of Array.from(files)) {
        const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const path = `${profile.org_id}/${dealId}/${safeName}`;

        toast.error(`Failed to upload ${file.name}: file upload requires storage integration`);
        continue;

        newBlueprints.push({
          name: file.name,
          url: '',
          path,
          uploaded_at: new Date().toISOString(),
          uploaded_by: user.id,
          size: file.size,
        });
      }

      updateDeal.mutate({ id: dealId, project_blueprints: newBlueprints }, {
        onSuccess: () => toast.success('Blueprints uploaded'),
        onError: (e) => toast.error('Failed to save: ' + e.message),
      });
    } catch (err: any) {
      toast.error('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  }, [blueprints, dealId, profile, user, updateDeal]);

  const handleDelete = async (index: number) => {
    const file = blueprints[index];
    // Delete from storage
    const updated = blueprints.filter((_, i) => i !== index);
    updateDeal.mutate({ id: dealId, project_blueprints: updated }, { onSuccess: () => toast.success('Blueprint removed') });
  };

  const handleDownload = async (file: BlueprintFile) => {
    if (file.url) window.open(file.url, '_blank');
    else toast.error('No download URL available');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Project Blueprints</Label>
      
      {/* Drop zone - always show in edit mode or when no files */}
      {editing && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
          }`}
        >
          <Upload className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {uploading ? 'Uploading...' : 'Drop your files here'}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && uploadFiles(e.target.files)}
          />
        </div>
      )}

      {/* File list */}
      {blueprints.length > 0 && (
        <div className="space-y-1.5">
          {blueprints.map((file, i) => (
            <div key={i} className="flex items-center gap-2 p-2 rounded-md bg-muted/50 group">
              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{file.name}</p>
                {file.size && <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>}
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => handleDownload(file)}>
                <Download className="h-3.5 w-3.5" />
              </Button>
              {editing && (
                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive" onClick={() => handleDelete(i)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {!editing && blueprints.length === 0 && (
        <p className="text-sm text-muted-foreground">No blueprints uploaded</p>
      )}
    </div>
  );
}
