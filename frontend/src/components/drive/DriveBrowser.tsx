import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Folder,
  File,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  FolderPlus,
  Upload,
  Download,
  Trash2,
  Edit,
  Loader2,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { googleDriveService, DriveFile } from "@/services/googleDriveService";
import { toast } from "sonner";
import { ConnectedDrive } from "@/hooks/useDrives";
import { getUnifiedFileIcon, formatFileSize, formatRelativeDate } from "./driveUtils";
import { DriveFileListSkeleton } from "./DriveFileListSkeleton";

interface DriveBrowserProps {
  drive: ConnectedDrive;
  onClose: () => void;
}

interface BreadcrumbItem {
  id: string;
  name: string;
}

export function DriveBrowser({ drive, onClose }: DriveBrowserProps) {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFolderId, setCurrentFolderId] = useState("root");
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([{ id: "root", name: "Google Drive" }]);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [needsReauth, setNeedsReauth] = useState(false);
  
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<DriveFile | null>(null);
  const [newName, setNewName] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const loadFiles = async (folderId: string = "root", append = false) => {
    try {
      setLoading(true);
      setNeedsReauth(false);
      const response = await googleDriveService.listFiles(
        drive.id,
        folderId,
        append ? nextPageToken : undefined
      );
      
      if (append) {
        setFiles(prev => [...prev, ...response.files]);
      } else {
        setFiles(response.files);
      }
      setNextPageToken(response.nextPageToken);
    } catch (error: any) {
      console.error("Error loading files:", error);
      if (error.message?.includes("REAUTH_REQUIRED") || error.message?.includes("expired") || error.message?.includes("reconnect")) {
        setNeedsReauth(true);
        toast.error("Google Drive access expired. Please reconnect your drive.");
      } else {
        toast.error(error.message || "Failed to load files");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles(currentFolderId);
  }, [currentFolderId, drive.id]);

  const navigateToFolder = (folder: DriveFile) => {
    setBreadcrumbs(prev => [...prev, { id: folder.id, name: folder.name }]);
    setCurrentFolderId(folder.id);
  };

  const navigateToBreadcrumb = (index: number) => {
    const item = breadcrumbs[index];
    setBreadcrumbs(prev => prev.slice(0, index + 1));
    setCurrentFolderId(item.id);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      setActionLoading(true);
      await googleDriveService.createFolder(drive.id, newFolderName, currentFolderId);
      toast.success("Folder created");
      setNewFolderDialogOpen(false);
      setNewFolderName("");
      loadFiles(currentFolderId);
    } catch (error: any) {
      toast.error(error.message || "Failed to create folder");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRename = async () => {
    if (!renameTarget || !newName.trim()) return;
    try {
      setActionLoading(true);
      await googleDriveService.rename(drive.id, renameTarget.id, newName);
      toast.success("Renamed successfully");
      setRenameDialogOpen(false);
      setRenameTarget(null);
      setNewName("");
      loadFiles(currentFolderId);
    } catch (error: any) {
      toast.error(error.message || "Failed to rename");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (file: DriveFile) => {
    if (!confirm(`Are you sure you want to delete "${file.name}"?`)) return;
    try {
      setFiles(prev => prev.filter(f => f.id !== file.id));
      await googleDriveService.delete(drive.id, file.id);
      toast.success("Moved to trash");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete");
      loadFiles(currentFolderId);
    }
  };

  const handleDownload = async (file: DriveFile) => {
    try {
      toast.info("Downloading...");
      await googleDriveService.downloadFile(drive.id, file.id);
      toast.success("Download complete");
    } catch (error: any) {
      toast.error(error.message || "Failed to download");
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      toast.info("Uploading...");
      const uploadUrl = await googleDriveService.getUploadUrl(drive.id, file.name, file.type, currentFolderId);
      const response = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!response.ok) throw new Error("Upload failed");
      toast.success("File uploaded");
      loadFiles(currentFolderId);
    } catch (error: any) {
      toast.error(error.message || "Failed to upload");
    }
    event.target.value = "";
  };

  const isFolder = (file: DriveFile) => file.mimeType === "application/vnd.google-apps.folder";

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-lg">{drive.display_name}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => loadFiles(currentFolderId)}>
              <RefreshCw className="h-4 w-4 mr-1" /> Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={() => setNewFolderDialogOpen(true)}>
              <FolderPlus className="h-4 w-4 mr-1" /> New Folder
            </Button>
            <label>
              <Button variant="default" size="sm" asChild>
                <span><Upload className="h-4 w-4 mr-1" /> Upload</span>
              </Button>
              <input type="file" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
        </div>

        <div className="flex items-center gap-1 text-sm mt-2 overflow-x-auto">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.id} className="flex items-center">
              {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />}
              <button
                onClick={() => navigateToBreadcrumb(index)}
                className={`hover:underline ${index === breadcrumbs.length - 1 ? "font-medium" : "text-muted-foreground"}`}
              >
                {crumb.name}
              </button>
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-auto p-0">
        {loading ? (
          <DriveFileListSkeleton />
        ) : needsReauth ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-4">
            <RefreshCw className="h-12 w-12 opacity-50" />
            <div className="text-center">
              <p className="font-medium text-foreground">Google Drive Access Expired</p>
              <p className="text-sm">Please reconnect your Google Drive to continue.</p>
            </div>
            <Button variant="default" onClick={onClose}>Go Back to Reconnect</Button>
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <Folder className="h-12 w-12 mb-2 opacity-50" />
            <p>This folder is empty</p>
          </div>
        ) : (
          <div className="divide-y">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => {
                  if (isFolder(file)) navigateToFolder(file);
                  else if (file.webViewLink) window.open(file.webViewLink, "_blank");
                }}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getUnifiedFileIcon(file.mimeType, isFolder(file))}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatRelativeDate(file.modifiedTime)} · {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {isFolder(file) ? (
                      <DropdownMenuItem onClick={() => navigateToFolder(file)}>
                        <Folder className="h-4 w-4 mr-2" /> Open
                      </DropdownMenuItem>
                    ) : (
                      <>
                        <DropdownMenuItem onClick={() => handleDownload(file)}>
                          <Download className="h-4 w-4 mr-2" /> Download
                        </DropdownMenuItem>
                        {file.webViewLink && (
                          <DropdownMenuItem onClick={() => window.open(file.webViewLink, "_blank")}>
                            <ExternalLink className="h-4 w-4 mr-2" /> Open in Google Drive
                          </DropdownMenuItem>
                        )}
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => {
                      setRenameTarget(file);
                      setNewName(file.name);
                      setRenameDialogOpen(true);
                    }}>
                      <Edit className="h-4 w-4 mr-2" /> Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(file)}>
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}

            {nextPageToken && (
              <div className="p-4 text-center">
                <Button variant="outline" onClick={() => loadFiles(currentFolderId, true)} disabled={loading}>
                  Load More
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* New Folder Dialog */}
      <Dialog open={newFolderDialogOpen} onOpenChange={setNewFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>Enter a name for the new folder.</DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Folder name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewFolderDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateFolder} disabled={actionLoading || !newFolderName.trim()}>
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename</DialogTitle>
            <DialogDescription>Enter a new name.</DialogDescription>
          </DialogHeader>
          <Input
            placeholder="New name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRename} disabled={actionLoading || !newName.trim()}>
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Rename"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
