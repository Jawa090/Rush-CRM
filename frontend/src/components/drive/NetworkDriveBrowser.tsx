import { useState, useEffect, useMemo } from "react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Folder,
  File,
  Image,
  FileText,
  FileSpreadsheet,
  Presentation,
  Video,
  Music,
  Archive,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  FolderPlus,
  Download,
  Trash2,
  Edit,
  Loader2,
  RefreshCw,
  AlertCircle,
  Server,
  Lock,
  Info,
} from "lucide-react";
import { networkDriveService, NetworkFile, NetworkDriveCredentials } from "@/services/networkDriveService";
import { toast } from "sonner";
import { useCustomDialog } from "@/contexts/DialogContext";
import { ConnectedDrive } from "@/hooks/useDrives";
import { Label } from "@/components/ui/label";

interface NetworkDriveBrowserProps {
  drive: ConnectedDrive;
  onClose: () => void;
}

interface BreadcrumbItem {
  path: string;
  name: string;
}

const protocolToType: Record<string, string> = {
  network_smb: "smb",
  network_nfs: "nfs",
  network_webdav: "webdav",
  network_sftp: "sftp",
};

export function NetworkDriveBrowser({ drive, onClose }: NetworkDriveBrowserProps) {
  const [files, setFiles] = useState<NetworkFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState(drive.network_path || "");
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [credentials, setCredentials] = useState<NetworkDriveCredentials | null>(null);
  const [showCredentialsDialog, setShowCredentialsDialog] = useState(false);
  const { confirm } = useCustomDialog();
  const [tempCredentials, setTempCredentials] = useState<NetworkDriveCredentials>({});
  const [notSupported, setNotSupported] = useState(false);
  const [notSupportedMessage, setNotSupportedMessage] = useState("");
  
  // Dialog states
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<NetworkFile | null>(null);
  const [newName, setNewName] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const protocol = protocolToType[drive.drive_type] || "smb";

  useEffect(() => {
    // Initialize breadcrumbs from network path
    if (drive.network_path) {
      setBreadcrumbs([{ path: drive.network_path, name: drive.display_name }]);
      // Check if we need credentials for non-WebDAV protocols
      if (protocol !== "webdav") {
        setShowCredentialsDialog(true);
      } else {
        loadFiles(drive.network_path);
      }
    }
  }, [drive]);

  const loadFiles = async (path: string) => {
    try {
      setLoading(true);
      setNotSupported(false);
      const response = await networkDriveService.listFiles(
        drive.id,
        protocol,
        path,
        credentials || undefined
      );
      
      if (!response.supported) {
        setNotSupported(true);
        setNotSupportedMessage(response.message || `${protocol.toUpperCase()} file listing requires native protocol support.`);
        setFiles([]);
      } else {
        setFiles(response.files);
      }
    } catch (error: any) {
      console.error("Error loading files:", error);
      toast.error(error.message || "Failed to load files");
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCredentialsSubmit = () => {
    setCredentials(tempCredentials);
    setShowCredentialsDialog(false);
    loadFiles(currentPath);
  };

  const navigateToFolder = (file: NetworkFile) => {
    const newPath = file.path;
    setBreadcrumbs(prev => [...prev, { path: newPath, name: file.name }]);
    setCurrentPath(newPath);
    loadFiles(newPath);
  };

  const navigateToBreadcrumb = (index: number) => {
    const item = breadcrumbs[index];
    setBreadcrumbs(prev => prev.slice(0, index + 1));
    setCurrentPath(item.path);
    loadFiles(item.path);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    
    try {
      setActionLoading(true);
      await networkDriveService.createFolder(
        drive.id,
        protocol,
        `${currentPath}/${newFolderName}`,
        credentials || undefined
      );
      toast.success("Folder created");
      setNewFolderDialogOpen(false);
      setNewFolderName("");
      loadFiles(currentPath);
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
      await networkDriveService.rename(
        drive.id,
        protocol,
        renameTarget.path,
        newName,
        credentials || undefined
      );
      toast.success("Renamed successfully");
      setRenameDialogOpen(false);
      setRenameTarget(null);
      setNewName("");
      loadFiles(currentPath);
    } catch (error: any) {
      toast.error(error.message || "Failed to rename");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (file: NetworkFile) => {
    if (!await confirm(`Are you sure you want to delete "${file.name}"?`, { variant: 'destructive', title: 'Delete Item' })) return;
    
    try {
      await networkDriveService.delete(drive.id, protocol, file.path, credentials || undefined);
      toast.success("Deleted successfully");
      loadFiles(currentPath);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete");
    }
  };

  const handleDownload = async (file: NetworkFile) => {
    try {
      toast.info("Downloading...");
      await networkDriveService.download(drive.id, protocol, file.path, file.name, credentials || undefined);
      toast.success("Download complete");
    } catch (error: any) {
      toast.error(error.message || "Failed to download");
    }
  };

  const getFileIcon = (file: NetworkFile) => {
    if (file.type === "folder") {
      return <Folder className="h-5 w-5 text-amber-500" />;
    }
    
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    
    if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext)) {
      return <Image className="h-5 w-5 text-emerald-500" />;
    }
    if (["mp4", "mov", "avi", "mkv", "webm"].includes(ext)) {
      return <Video className="h-5 w-5 text-purple-500" />;
    }
    if (["mp3", "wav", "flac", "aac", "ogg"].includes(ext)) {
      return <Music className="h-5 w-5 text-pink-500" />;
    }
    if (["xlsx", "xls", "csv"].includes(ext)) {
      return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
    }
    if (["pptx", "ppt"].includes(ext)) {
      return <Presentation className="h-5 w-5 text-orange-500" />;
    }
    if (ext === "pdf") {
      return <FileText className="h-5 w-5 text-red-500" />;
    }
    if (["doc", "docx", "txt", "rtf", "md"].includes(ext)) {
      return <FileText className="h-5 w-5 text-blue-500" />;
    }
    if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) {
      return <Archive className="h-5 w-5 text-gray-500" />;
    }
    
    return <File className="h-5 w-5 text-muted-foreground" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "-";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={onClose}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Server className="h-5 w-5 text-orange-500" />
              <CardTitle className="text-lg">{drive.display_name}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowCredentialsDialog(true)}>
                <Lock className="h-4 w-4 mr-1" />
                Credentials
              </Button>
              <Button variant="outline" size="sm" onClick={() => loadFiles(currentPath)}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
              {!notSupported && (
                <Button variant="outline" size="sm" onClick={() => setNewFolderDialogOpen(true)}>
                  <FolderPlus className="h-4 w-4 mr-1" />
                  New Folder
                </Button>
              )}
            </div>
          </div>
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1 text-sm mt-2 overflow-x-auto">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.path} className="flex items-center">
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
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : notSupported ? (
            <div className="p-6 space-y-4">
              <Alert variant="default">
                <Info className="h-4 w-4" />
                <AlertTitle>Protocol Not Supported for Browser Access</AlertTitle>
                <AlertDescription className="space-y-3">
                  <p>
                    <strong>{protocol.toUpperCase()}</strong> requires native OS-level integration that isn't available in web browsers.
                  </p>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="font-medium mb-2">Recommended alternatives:</p>
                    <ul className="list-disc ml-6 space-y-1 text-sm">
                      <li><strong>WebDAV</strong> — Works fully in-browser. Many file servers (Synology, Nextcloud, Windows IIS) support WebDAV.</li>
                      <li><strong>Local mount</strong> — Mount the {protocol.toUpperCase()} share on your system, then access via local file manager.</li>
                    </ul>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    To use WebDAV, remove this drive and add a new one selecting "WebDAV (Recommended)".
                  </p>
                </AlertDescription>
              </Alert>
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
                  onDoubleClick={() => file.type === "folder" && navigateToFolder(file)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getFileIcon(file)}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(file.modified)} • {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {file.type === "folder" ? (
                        <DropdownMenuItem onClick={() => navigateToFolder(file)}>
                          <Folder className="h-4 w-4 mr-2" />
                          Open
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => handleDownload(file)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => {
                        setRenameTarget(file);
                        setNewName(file.name);
                        setRenameDialogOpen(true);
                      }}>
                        <Edit className="h-4 w-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => handleDelete(file)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Credentials Dialog */}
      <Dialog open={showCredentialsDialog} onOpenChange={setShowCredentialsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Network Credentials</DialogTitle>
            <DialogDescription>
              Enter your credentials to access the {protocol.toUpperCase()} share.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="username"
                value={tempCredentials.username || ""}
                onChange={(e) => setTempCredentials(prev => ({ ...prev, username: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="password"
                value={tempCredentials.password || ""}
                onChange={(e) => setTempCredentials(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>
            {protocol === "smb" && (
              <div className="space-y-2">
                <Label htmlFor="domain">Domain (optional)</Label>
                <Input
                  id="domain"
                  placeholder="WORKGROUP"
                  value={tempCredentials.domain || ""}
                  onChange={(e) => setTempCredentials(prev => ({ ...prev, domain: e.target.value }))}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCredentialsDialog(false);
              if (!credentials) {
                onClose();
              }
            }}>
              Cancel
            </Button>
            <Button onClick={handleCredentialsSubmit}>
              Connect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            <Button variant="outline" onClick={() => setNewFolderDialogOpen(false)}>
              Cancel
            </Button>
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
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRename} disabled={actionLoading || !newName.trim()}>
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Rename"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
