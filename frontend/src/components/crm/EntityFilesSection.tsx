import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  File,
  FileText,
  FileSpreadsheet,
  Image,
  Video,
  Music,
  Archive,
  Folder,
  Download,
  Trash2,
  Loader2,
  Upload,
} from "lucide-react";
import { useEntityDriveFiles, useLinkDriveFile, useUnlinkDriveFile } from "@/hooks/useEntityDriveFiles";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface EntityFilesSectionProps {
  entityType: string;
  entityId: string;
}

export function EntityFilesSection({ entityType, entityId }: EntityFilesSectionProps) {
  const { data: files, isLoading } = useEntityDriveFiles(entityType, entityId);
  const linkFile = useLinkDriveFile();
  const unlinkFile = useUnlinkDriveFile();
  const { profile, user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;
    if (!profile?.org_id || !user?.id) {
      toast.error("You must be authenticated to upload files");
      return;
    }

    setUploading(true);
    try {
      for (const file of Array.from(selectedFiles)) {
        toast.info(`File storage not yet implemented - ${file.name}`);
      }
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDownload = async (file: { provider: string; file_id: string; file_name: string }) => {
    try {
      toast.info("Downloading...");
      if (file.provider === "local") {
        toast.info("Local file download not yet implemented");
      } else if (file.provider === "google_drive") {
        const { googleDriveService } = await import("@/services/googleDriveService");
        await googleDriveService.downloadFile(file.file_id, file.file_id);
        toast.success("Download complete");
      } else {
        const { oneDriveService } = await import("@/services/oneDriveService");
        await oneDriveService.downloadFile(file.file_id, file.file_id);
        toast.success("Download complete");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to download");
    }
  };

  const handleUnlink = async (file: { id: string; provider: string; file_id: string }) => {
    unlinkFile.mutate({ id: file.id, entityType, entityId });
  };

  const getFileIcon = (mimeType: string | null) => {
    if (!mimeType) return <File className="h-4 w-4 text-muted-foreground" />;
    if (mimeType.startsWith("image/")) return <Image className="h-4 w-4 text-emerald-500" />;
    if (mimeType.startsWith("video/")) return <Video className="h-4 w-4 text-purple-500" />;
    if (mimeType.startsWith("audio/")) return <Music className="h-4 w-4 text-pink-500" />;
    if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return <FileSpreadsheet className="h-4 w-4 text-green-600" />;
    if (mimeType === "application/pdf") return <FileText className="h-4 w-4 text-red-500" />;
    if (mimeType.includes("document") || mimeType.includes("word")) return <FileText className="h-4 w-4 text-blue-500" />;
    if (mimeType.includes("zip") || mimeType.includes("archive")) return <Archive className="h-4 w-4 text-muted-foreground" />;
    if (mimeType.includes("folder")) return <Folder className="h-4 w-4 text-amber-500" />;
    return <File className="h-4 w-4 text-muted-foreground" />;
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  return (
    <Collapsible defaultOpen>
      <div className="border border-border rounded-lg bg-card">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Files {files && files.length > 0 && `(${files.length})`}
          </span>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : files && files.length > 0 ? (
              <div className="space-y-1">
                {files.map(file => (
                  <div key={file.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 group">
                    {getFileIcon(file.mime_type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {file.file_size ? formatSize(file.file_size) : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleDownload(file)}
                        title="Download"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => handleUnlink(file)}
                        title="Remove file"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No files attached</p>
            )}

            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2"
              onClick={handleUploadClick}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-1" />
              )}
              {uploading ? "Uploading..." : "Upload Document"}
            </Button>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
