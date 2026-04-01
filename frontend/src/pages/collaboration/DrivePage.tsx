import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FolderOpen,
  File,
  Image,
  FileText,
  MoreVertical,
  Plus,
  Search,
  Trash2,
  Settings,
  List,
  Grid3X3,
  LayoutGrid,
  ChevronDown,
  FolderPlus,
  FileUp,
  Cloud,
  Server,
  Loader2,
  ArrowLeft,
  Upload,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ConnectCompanyDriveDialog } from "@/components/drive/ConnectCompanyDriveDialog";
import { ConnectPersonalDriveDialog } from "@/components/drive/ConnectPersonalDriveDialog";
import { DriveSettingsDialog } from "@/components/drive/DriveSettingsDialog";
import { CompanyDrivesList } from "@/components/drive/CompanyDrivesList";
import { PersonalDrivesList } from "@/components/drive/PersonalDrivesList";
import { DriveBrowser } from "@/components/drive/DriveBrowser";
import { NetworkDriveBrowser } from "@/components/drive/NetworkDriveBrowser";
import { OneDriveBrowser } from "@/components/drive/OneDriveBrowser";
import { CreateFolderDialog } from "@/components/drive/CreateFolderDialog";
import { useConnectedDrives, ConnectedDrive } from "@/hooks/useDrives";
import { useDriveFolders, useDriveFiles, useDriveSearch, formatFileSize, formatDate, getFileTypeFromMime } from "@/hooks/useDriveData";
import { googleDriveService } from "@/services/googleDriveService";
import { toast } from "sonner";

type ViewMode = "list" | "grid" | "compact";

const folderColors: Record<string, string> = {
  "folder-sky": "hsl(var(--primary))",
  "folder-blue": "hsl(210 100% 50%)",
  "folder-violet": "hsl(270 100% 60%)",
  "folder-amber": "hsl(40 100% 50%)",
};

export default function DrivePage() {
  const { userRole } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date_changed");
  const [companyDriveDialogOpen, setCompanyDriveDialogOpen] = useState(false);
  const [personalDriveDialogOpen, setPersonalDriveDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [createFolderDialogOpen, setCreateFolderDialogOpen] = useState(false);
  const [browsingDrive, setBrowsingDrive] = useState<ConnectedDrive | null>(null);
  const [processingOAuth, setProcessingOAuth] = useState(false);

  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: allDrives } = useConnectedDrives();
  const isAdmin = userRole?.role === "admin" || userRole?.role === "super_admin";

  // Use real data hooks
  const { folders, createFolder, deleteFolder } = useDriveFolders(selectedFolder);
  const { files, uploadFile, deleteFile } = useDriveFiles(selectedFolder, true);
  const searchResults = useDriveSearch(searchQuery);

  // Use search results if searching, otherwise use regular files
  const displayFiles = searchQuery.length >= 2 ? searchResults.data?.filter(item => item.type === 'file') || [] : files;
  const displayFolders = searchQuery.length >= 2 ? searchResults.data?.filter(item => item.type === 'folder') || [] : folders;

  const handleFolderClick = (folderId: string, folderName: string) => {
    setSelectedFolder(folderId);
    toast.success(`Opening ${folderName} folder`);
  };

  const handleBackToRoot = () => {
    setSelectedFolder(null);
    toast.info("Back to My Drive");
  };

  const handleFileClick = (fileName: string) => {
    toast.success(`Opening ${fileName}`);
  };

  const handleFileUpload = () => {
    if (!selectedFolder) {
      toast.error("Please select a folder first by clicking on it!");
      return;
    }
    
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        const folderName = folders.find(f => f.id === selectedFolder)?.name || 'Selected folder';
        Array.from(files).forEach(file => {
          uploadFile.mutate({ file, folderId: selectedFolder || undefined });
        });
        toast.success(`Uploading ${files.length} file(s) to ${folderName}`);
      }
    };
    input.click();
  };

  const handleCreateFolder = () => {
    setCreateFolderDialogOpen(true);
  };

  const handleCreateFolderSubmit = (name: string, color: string) => {
    createFolder.mutate({
      name: name,
      parent_folder_id: selectedFolder || undefined,
      color: color
    });
  };

  const handleRecycleBin = () => {
    toast.info("Recycle Bin - Deleted files will appear here");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (!selectedFolder) {
      toast.error("Please select a folder first by clicking on it!");
      return;
    }
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      const folderName = folders.find(f => f.id === selectedFolder)?.name || 'Selected folder';
      droppedFiles.forEach(file => {
        uploadFile.mutate({ file, folderId: selectedFolder || undefined });
      });
      toast.success(`Uploading ${droppedFiles.length} file(s) to ${folderName}`);
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'u':
            e.preventDefault();
            handleFileUpload();
            break;
          case 'n':
            e.preventDefault();
            handleCreateFolder();
            break;
          case 'f':
            e.preventDefault();
            (document.querySelector('input[placeholder="Filter and search"]') as HTMLInputElement)?.focus();
            break;
        }
      }
      if (e.key === 'Escape') {
        setSelectedFolder(null);
        setSearchQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle OAuth callback
  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    
    if (code && state) {
      handleOAuthCallback(code, state);
    }
  }, [searchParams]);

  const handleOAuthCallback = async (code: string, encodedState: string) => {
    try {
      setProcessingOAuth(true);
      const state = JSON.parse(atob(encodedState));
      const redirectUri = `${window.location.origin}/collaboration/drive`;
      
      await googleDriveService.exchangeCode(code, redirectUri, state.driveId);
      
      toast.success("Google Drive connected successfully!");
      
      // Clear URL params
      setSearchParams({});
    } catch (error: any) {
      console.error("OAuth callback error:", error);
      toast.error(error.message || "Failed to complete Google Drive connection");
    } finally {
      setProcessingOAuth(false);
    }
  };

  const handleBrowseDrive = (drive: ConnectedDrive) => {
    const isNetworkDriveType = ["network_smb", "network_nfs", "network_webdav"].includes(drive.drive_type);
    
    // Network drives are always considered connected
    if (!isNetworkDriveType && !drive.access_token && drive.drive_type === "google_drive") {
      toast.error("This drive is not yet connected. Please authenticate first.");
      return;
    }
    // For OneDrive, we need a connection in onedrive_connections table
    // The connected_drives record just tracks it in the UI
    setBrowsingDrive(drive);
  };

  const isNetworkDrive = (drive: ConnectedDrive) => 
    ["network_smb", "network_nfs", "network_webdav"].includes(drive.drive_type);

  const getFileIcon = (mimeType: string) => {
    const fileType = getFileTypeFromMime(mimeType);
    switch (fileType) {
      case "image":
        return <Image className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />;
      case "pdf":
        return <FileText className="h-5 w-5 text-red-600 dark:text-red-400" />;
      case "document":
        return <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      case "presentation":
        return <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />;
      case "spreadsheet":
        return <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case "video":
        return <File className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
      case "text":
        return <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
      default:
        return <File className="h-5 w-5 text-primary" />;
    }
  };

  // Sort folders and files based on sortBy
  const sortedFolders = [...displayFolders].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "date_created":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "date_changed":
        return new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime();
      default:
        return 0;
    }
  });

  const sortedFiles = [...displayFiles].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "size":
        return (b.file_size || 0) - (a.file_size || 0);
      case "date_created":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "date_changed":
        return new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime();
      default:
        return 0;
    }
  });

  const sortOptions = [
    { value: "date_changed", label: "By date changed" },
    { value: "date_created", label: "By date created" },
    { value: "name", label: "By name" },
    { value: "size", label: "By size" },
  ];

  // Show drive browser if browsing a drive
  if (browsingDrive) {
    return (
      <div className="h-[calc(100vh-120px)]">
        {isNetworkDrive(browsingDrive) ? (
          <NetworkDriveBrowser drive={browsingDrive} onClose={() => setBrowsingDrive(null)} />
        ) : browsingDrive.drive_type === "onedrive" ? (
          <OneDriveBrowser 
            displayName={browsingDrive.display_name}
            onClose={() => setBrowsingDrive(null)} 
          />
        ) : (
          <DriveBrowser drive={browsingDrive} onClose={() => setBrowsingDrive(null)} />
        )}
      </div>
    );
  }

  return (
    <div 
      className={`space-y-4 ${isDragOver ? 'bg-blue-50 dark:bg-blue-950/20' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragOver && (
        <div className="fixed inset-0 bg-blue-500/20 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg border-2 border-dashed border-blue-500">
            <div className="text-center">
              <FileUp className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              {selectedFolder ? (
                <>
                  <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                    Drop files here to upload
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Files will be uploaded to: {folders.find(f => f.id === selectedFolder)?.name}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                    Select a folder first!
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Click on a folder before uploading files
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* OAuth Processing Overlay */}
      {processingOAuth && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Connecting to Google Drive...</span>
            </div>
          </Card>
        </div>
      )}

      {/* Header with Title, Add Button, and Search */}
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-foreground">My Drive</h1>
        
        {/* Add Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-primary-foreground">
              <Plus className="h-4 w-4 mr-1" />
              Add
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem onSelect={handleFileUpload}>
              <FileUp className="h-4 w-4 mr-2" />
              {selectedFolder ? "Upload to Current Folder" : "Upload File (Select folder first)"}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleCreateFolder}>
              <FolderPlus className="h-4 w-4 mr-2" />
              Create Folder
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <FileText className="h-4 w-4 mr-2" />
                Google Docs
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onSelect={() => window.open('https://docs.new', '_blank', 'noopener,noreferrer')}>Document</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => window.open('https://sheets.new', '_blank', 'noopener,noreferrer')}>Spreadsheet</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => window.open('https://slides.new', '_blank', 'noopener,noreferrer')}>Presentation</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <FileText className="h-4 w-4 mr-2" />
                MS Office Online
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onSelect={() => window.open('https://word.new', '_blank', 'noopener,noreferrer')}>Word Document</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => window.open('https://excel.new', '_blank', 'noopener,noreferrer')}>Excel Spreadsheet</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => window.open('https://powerpoint.new', '_blank', 'noopener,noreferrer')}>PowerPoint</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            {isAdmin && (
              <DropdownMenuItem onClick={() => setCompanyDriveDialogOpen(true)}>
                <Server className="h-4 w-4 mr-2" />
                Connect Company Drive
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => setPersonalDriveDialogOpen(true)}>
              <Cloud className="h-4 w-4 mr-2" />
              Connect Personal Drive
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter and search"
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1" />

        {/* Recycle Bin & Settings */}
        <Button variant="outline" className="gap-2" onClick={handleRecycleBin}>
          <Trash2 className="h-4 w-4" />
          Recycle Bin
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setSettingsDialogOpen(true)}>
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      {/* Secondary Header - Breadcrumb, Info, Sort, View Toggle */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span 
            className="font-medium text-foreground cursor-pointer hover:underline"
            onClick={handleBackToRoot}
          >
            My Drive
          </span>
          {selectedFolder && (
            <>
              <span>/</span>
              <span className="font-medium text-blue-600 dark:text-blue-400">
                {folders.find(f => f.id === selectedFolder)?.name || 'Unknown Folder'}
              </span>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground">
            Files deleted to the Recycle Bin are kept for 30 days
          </span>
          
          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1">
                {sortOptions.find(o => o.value === sortBy)?.label}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {sortOptions.map((option) => (
                <DropdownMenuItem 
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View Toggle */}
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8 rounded-none rounded-l-md"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "compact" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8 rounded-none border-x"
              onClick={() => setViewMode("compact")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8 rounded-none rounded-r-md"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      {/* Main Content Area */}
      {!selectedFolder ? (
        // Show root folders when no folder is selected
        <div className="space-y-6">
          {sortedFolders.length > 0 ? (
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-3">Folders</h2>
              {viewMode === "grid" ? (
                <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {sortedFolders.map((folder) => (
                    <Card 
                      key={folder.id} 
                      className="cursor-pointer hover:shadow-md transition-all group relative overflow-hidden"
                      onClick={() => handleFolderClick(folder.id, folder.name)}
                    >
                      <CardContent className="p-0">
                        <div className="relative">
                          {/* Folder visual */}
                          <div 
                            className="h-24 rounded-t-lg relative"
                            style={{ backgroundColor: folderColors[folder.color] || folderColors['folder-blue'] }}
                          >
                            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background/20 to-transparent" />
                            <div className="absolute top-2 left-2 w-8 h-2 bg-white/30 rounded-full" />
                          </div>
                          {/* Folder tab */}
                          <div 
                            className="absolute top-0 left-0 w-12 h-4 rounded-t-md -translate-y-1"
                            style={{ backgroundColor: folderColors[folder.color] || folderColors['folder-blue'] }}
                          />
                        </div>
                        <div className="p-3 bg-card">
                          <p className="font-medium text-sm truncate">{folder.name}</p>
                          <p className="text-xs text-muted-foreground">{folder.file_count} files • {formatFileSize(folder.total_size)}</p>
                        </div>
                        {/* Menu button */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleFolderClick(folder.id, folder.name)}>
                              Open
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.success(`Renaming ${folder.name}`)}>
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.success(`Sharing ${folder.name}`)}>
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => deleteFolder.mutate(folder.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {sortedFolders.map((folder) => (
                        <div 
                          key={folder.id} 
                          className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => handleFolderClick(folder.id, folder.name)}
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className="p-2 rounded-lg"
                              style={{ backgroundColor: folderColors[folder.color] || folderColors['folder-blue'] }}
                            >
                              <FolderOpen className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <div>
                              <p className="font-medium">{folder.name}</p>
                              <p className="text-sm text-muted-foreground">{folder.file_count} files • {formatFileSize(folder.total_size)}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No folders found matching your search.</p>
              </CardContent>
            </Card>
          )}

          {/* Connected Drives */}
          <div className="grid gap-4 md:grid-cols-2">
            <CompanyDrivesList onBrowse={handleBrowseDrive} />
            <PersonalDrivesList onBrowse={handleBrowseDrive} />
          </div>

          {/* Instructions */}
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FolderOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    How to use your Drive
                  </h3>
                  <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                    <p>• <strong>Click on any folder</strong> to open it and see its contents</p>
                    <p>• <strong>Upload files</strong> by clicking a folder first, then using the upload button</p>
                    <p>• <strong>Create new folders</strong> using the "Add" button above</p>
                    <p>• <strong>Organize your files</strong> by moving them into appropriate folders</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        // Show folder contents when a folder is selected
        <div className="space-y-6">
          {/* Folder Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setSelectedFolder(null)}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold">
                  {folders.find(f => f.id === selectedFolder)?.name || 'Folder'}
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload Files
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              >
                {viewMode === "grid" ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Files Display */}
          {sortedFiles.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                {sortedFiles.map((file) => (
                  <Card 
                    key={file.id} 
                    className="cursor-pointer hover:shadow-md transition-all group"
                    onClick={() => handleFileClick(file.name)}
                  >
                    <CardContent className="p-3">
                      <div className="flex flex-col items-center text-center space-y-2">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                          <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="w-full">
                          <p className="font-medium text-sm truncate" title={file.name}>
                            {file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.file_size)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {sortedFiles.map((file) => (
                      <div 
                        key={file.id} 
                        className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => handleFileClick(file.name)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatFileSize(file.file_size)} • {formatDate(file.created_at)}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          ) : (
            <Card className="border-dashed border-2">
              <CardContent className="p-12 text-center">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <FolderOpen className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">This folder is empty</h3>
                    <p className="text-muted-foreground mb-4">
                      Upload files to get started organizing your content
                    </p>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Upload Your First File
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Status Bar */}
      <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/30 px-4 py-2 rounded-lg">
        <div className="flex items-center gap-4">
          {selectedFolder ? (
            <>
              <span>Viewing folder: {folders.find(f => f.id === selectedFolder)?.name}</span>
              <span>{sortedFiles.length} files</span>
            </>
          ) : (
            <>
              <span>{sortedFolders.length} folders</span>
              {searchQuery && <span>Filtered by: "{searchQuery}"</span>}
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span>
            {selectedFolder 
              ? "Upload files to this folder using the upload button" 
              : "Click on folders to view and upload files"
            }
          </span>
        </div>
      </div>

      {/* Dialogs */}
      <CreateFolderDialog
        open={createFolderDialogOpen}
        onOpenChange={setCreateFolderDialogOpen}
        onCreateFolder={handleCreateFolderSubmit}
      />
      <ConnectCompanyDriveDialog 
        open={companyDriveDialogOpen} 
        onOpenChange={setCompanyDriveDialogOpen} 
      />
      <ConnectPersonalDriveDialog 
        open={personalDriveDialogOpen} 
        onOpenChange={setPersonalDriveDialogOpen}
        connectedDrives={(allDrives ?? []).filter(d => d.ownership === "personal").map(d => d.drive_type)}
      />
      <DriveSettingsDialog 
        open={settingsDialogOpen} 
        onOpenChange={setSettingsDialogOpen} 
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = e.target.files;
          if (files && files.length > 0 && selectedFolder) {
            const folderName = folders.find(f => f.id === selectedFolder)?.name || 'Selected folder';
            Array.from(files).forEach(file => {
              uploadFile.mutate({ file, folderId: selectedFolder });
            });
            toast.success(`Uploading ${files.length} file(s) to ${folderName}`);
          } else if (!selectedFolder) {
            toast.error("Please select a folder first by clicking on it!");
          }
          // Reset the input value so the same file can be selected again
          e.target.value = '';
        }}
      />
    </div>
  );
}