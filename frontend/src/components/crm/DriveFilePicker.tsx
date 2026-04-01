import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Folder,
  File,
  Image,
  FileText,
  FileSpreadsheet,
  Video,
  Music,
  Archive,
  ChevronRight,
  Loader2,
  Check,
} from "lucide-react";
import { useConnectedDrives } from "@/hooks/useDrives";
import { useOneDriveConnection } from "@/hooks/useOneDriveConnection";
import { googleDriveService, DriveFile } from "@/services/googleDriveService";
import { oneDriveService, OneDriveFile } from "@/services/oneDriveService";
import { toast } from "sonner";

interface PickedFile {
  provider: string;
  driveConnectionId: string;
  fileId: string;
  fileName: string;
  mimeType: string;
  fileSize?: number;
  webViewLink?: string;
  thumbnailLink?: string;
}

interface DriveFilePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFilesSelected: (files: PickedFile[]) => void;
}

interface BreadcrumbItem {
  id: string;
  name: string;
}

export function DriveFilePicker({ open, onOpenChange, onFilesSelected }: DriveFilePickerProps) {
  const { data: drives } = useConnectedDrives();
  const { data: oneDriveConn } = useOneDriveConnection();

  const googleDrives = (drives || []).filter(d => d.drive_type === "google_drive" && d.access_token);
  const hasOneDrive = !!oneDriveConn;

  const [activeTab, setActiveTab] = useState<string>(googleDrives.length > 0 ? "google" : "onedrive");
  const [files, setFiles] = useState<(DriveFile | OneDriveFile)[]>([]);
  const [loading, setLoading] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([{ id: "root", name: "Root" }]);
  const [selectedFiles, setSelectedFiles] = useState<PickedFile[]>([]);
  const [activeDriveId, setActiveDriveId] = useState<string>("");

  const loadGoogleFiles = async (driveId: string, folderId: string = "root") => {
    try {
      setLoading(true);
      setActiveDriveId(driveId);
      const response = await googleDriveService.listFiles(driveId, folderId);
      setFiles(response.files);
    } catch (error: any) {
      toast.error(error.message || "Failed to load files");
    } finally {
      setLoading(false);
    }
  };

  const loadOneDriveFiles = async (folderId: string = "root") => {
    if (!oneDriveConn) return;
    try {
      setLoading(true);
      setActiveDriveId(oneDriveConn.id);
      const response = await oneDriveService.listFiles(oneDriveConn.id, folderId);
      setFiles(response.files);
    } catch (error: any) {
      toast.error(error.message || "Failed to load files");
    } finally {
      setLoading(false);
    }
  };

  const navigateToFolder = (file: DriveFile | OneDriveFile) => {
    const folderId = file.id;
    setBreadcrumbs(prev => [...prev, { id: folderId, name: file.name }]);
    if (activeTab === "google") {
      loadGoogleFiles(activeDriveId, folderId);
    } else {
      loadOneDriveFiles(folderId);
    }
  };

  const navigateToBreadcrumb = (index: number) => {
    const item = breadcrumbs[index];
    setBreadcrumbs(prev => prev.slice(0, index + 1));
    if (activeTab === "google") {
      loadGoogleFiles(activeDriveId, item.id);
    } else {
      loadOneDriveFiles(item.id);
    }
  };

  const isFolder = (file: DriveFile | OneDriveFile): boolean => {
    if ("isFolder" in file) return file.isFolder;
    return file.mimeType === "application/vnd.google-apps.folder";
  };

  const toggleFileSelection = (file: DriveFile | OneDriveFile) => {
    if (isFolder(file)) {
      navigateToFolder(file);
      return;
    }

    const picked: PickedFile = {
      provider: activeTab === "google" ? "google_drive" : "onedrive",
      driveConnectionId: activeDriveId,
      fileId: file.id,
      fileName: file.name,
      mimeType: file.mimeType,
      fileSize: file.size ? parseInt(file.size) : undefined,
      webViewLink: "webViewLink" in file ? file.webViewLink : undefined,
      thumbnailLink: "thumbnailLink" in file ? file.thumbnailLink : undefined,
    };

    setSelectedFiles(prev => {
      const exists = prev.find(f => f.fileId === file.id && f.provider === picked.provider);
      if (exists) return prev.filter(f => !(f.fileId === file.id && f.provider === picked.provider));
      return [...prev, picked];
    });
  };

  const isSelected = (file: DriveFile | OneDriveFile) => {
    const provider = activeTab === "google" ? "google_drive" : "onedrive";
    return selectedFiles.some(f => f.fileId === file.id && f.provider === provider);
  };

  const handleConfirm = () => {
    onFilesSelected(selectedFiles);
    setSelectedFiles([]);
    setFiles([]);
    setBreadcrumbs([{ id: "root", name: "Root" }]);
    onOpenChange(false);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setFiles([]);
    setBreadcrumbs([{ id: "root", name: "Root" }]);
    setSelectedFiles([]);
  };

  const getFileIcon = (mimeType: string, folder: boolean) => {
    if (folder) return <Folder className="h-4 w-4 text-amber-500" />;
    if (mimeType.startsWith("image/")) return <Image className="h-4 w-4 text-emerald-500" />;
    if (mimeType.startsWith("video/")) return <Video className="h-4 w-4 text-purple-500" />;
    if (mimeType.startsWith("audio/")) return <Music className="h-4 w-4 text-pink-500" />;
    if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return <FileSpreadsheet className="h-4 w-4 text-green-600" />;
    if (mimeType === "application/pdf") return <FileText className="h-4 w-4 text-red-500" />;
    if (mimeType.includes("document") || mimeType.includes("word")) return <FileText className="h-4 w-4 text-blue-500" />;
    if (mimeType.includes("zip") || mimeType.includes("archive")) return <Archive className="h-4 w-4 text-muted-foreground" />;
    return <File className="h-4 w-4 text-muted-foreground" />;
  };

  const noProviders = googleDrives.length === 0 && !hasOneDrive;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Attach Files from Drive</DialogTitle>
        </DialogHeader>

        {noProviders ? (
          <div className="py-8 text-center text-muted-foreground">
            <p>No drives connected. Connect Google Drive or OneDrive first.</p>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col min-h-0">
            <TabsList className="w-full">
              {googleDrives.length > 0 && <TabsTrigger value="google" className="flex-1">Google Drive</TabsTrigger>}
              {hasOneDrive && <TabsTrigger value="onedrive" className="flex-1">OneDrive</TabsTrigger>}
            </TabsList>

            <TabsContent value="google" className="flex-1 flex flex-col min-h-0 mt-2">
              {files.length === 0 && !loading && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Select a drive:</p>
                  {googleDrives.map(drive => (
                    <Button
                      key={drive.id}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        setBreadcrumbs([{ id: "root", name: drive.display_name }]);
                        loadGoogleFiles(drive.id);
                      }}
                    >
                      <Folder className="h-4 w-4 mr-2 text-amber-500" />
                      {drive.display_name}
                    </Button>
                  ))}
                </div>
              )}
              {renderFileList()}
            </TabsContent>

            <TabsContent value="onedrive" className="flex-1 flex flex-col min-h-0 mt-2">
              {files.length === 0 && !loading && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    setBreadcrumbs([{ id: "root", name: "OneDrive" }]);
                    loadOneDriveFiles();
                  }}
                >
                  <Folder className="h-4 w-4 mr-2 text-blue-500" />
                  OneDrive ({oneDriveConn?.microsoft_email})
                </Button>
              )}
              {renderFileList()}
            </TabsContent>
          </Tabs>
        )}

        {selectedFiles.length > 0 && (
          <div className="flex items-center justify-between pt-3 border-t">
            <span className="text-sm text-muted-foreground">{selectedFiles.length} file(s) selected</span>
            <Button onClick={handleConfirm}>Attach Selected</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  function renderFileList() {
    return (
      <>
        {/* Breadcrumbs */}
        {files.length > 0 && (
          <div className="flex items-center gap-1 text-xs mb-2 overflow-x-auto">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.id} className="flex items-center">
                {index > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground mx-0.5" />}
                <button
                  onClick={() => navigateToBreadcrumb(index)}
                  className={`hover:underline ${index === breadcrumbs.length - 1 ? "font-medium" : "text-muted-foreground"}`}
                >
                  {crumb.name}
                </button>
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : files.length > 0 ? (
          <div className="overflow-y-auto max-h-[40vh] divide-y border rounded-md">
            {files.map(file => {
              const folder = isFolder(file);
              const selected = isSelected(file);
              return (
                <div
                  key={file.id}
                  className={`flex items-center gap-3 p-2.5 cursor-pointer transition-colors hover:bg-muted/50 ${selected ? "bg-primary/5" : ""}`}
                  onClick={() => toggleFileSelection(file)}
                >
                  {!folder && (
                    <div className={`h-4 w-4 rounded border flex items-center justify-center ${selected ? "bg-primary border-primary" : "border-muted-foreground/30"}`}>
                      {selected && <Check className="h-3 w-3 text-primary-foreground" />}
                    </div>
                  )}
                  {getFileIcon(file.mimeType, folder)}
                  <span className="text-sm truncate flex-1">{file.name}</span>
                  {folder && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                </div>
              );
            })}
          </div>
        ) : null}
      </>
    );
  }
}
