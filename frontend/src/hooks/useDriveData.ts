import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { driveApi } from '@/lib/api';
import { toast } from 'sonner';

export interface DriveFolder {
  id: string;
  org_id: string;
  created_by: string;
  name: string;
  parent_folder_id: string | null;
  color: string;
  path: string;
  created_at: string;
  updated_at: string;
  created_by_name: string;
  file_count: number;
  total_size: number;
}

export interface DriveFile {
  id: string;
  org_id: string;
  created_by: string;
  folder_id: string | null;
  name: string;
  original_name: string;
  file_type: string;
  file_size: number;
  mime_type: string;
  file_path: string;
  file_url: string | null;
  is_deleted: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  created_by_name: string;
  folder_name: string | null;
}

export interface DriveActivity {
  id: string;
  org_id: string;
  user_id: string;
  file_id: string | null;
  folder_id: string | null;
  activity_type: string;
  activity_data: any;
  created_at: string;
  user_name: string;
  file_name: string | null;
  folder_name: string | null;
}

// Hook for folders
export function useDriveFolders(parentId?: string) {
  const queryClient = useQueryClient();

  const foldersQuery = useQuery({
    queryKey: ['drive-folders', parentId],
    queryFn: () => driveApi.getFolders(parentId),
  });

  const createFolder = useMutation({
    mutationFn: (data: { name: string; parent_folder_id?: string; color?: string }) =>
      driveApi.createFolder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drive-folders'] });
      toast.success('Folder created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create folder');
    },
  });

  const deleteFolder = useMutation({
    mutationFn: (id: string) => driveApi.deleteFolder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drive-folders'] });
      toast.success('Folder deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete folder');
    },
  });

  return {
    folders: foldersQuery.data || [],
    isLoading: foldersQuery.isLoading,
    error: foldersQuery.error,
    createFolder,
    deleteFolder,
    refetch: foldersQuery.refetch,
  };
}

// Hook for files
export function useDriveFiles(folderId?: string, recent?: boolean) {
  const queryClient = useQueryClient();

  const filesQuery = useQuery({
    queryKey: ['drive-files', folderId, recent],
    queryFn: () => driveApi.getFiles(folderId, recent),
  });

  const uploadFile = useMutation({
    mutationFn: ({ file, folderId }: { file: File; folderId?: string }) => {
      console.log('Uploading file:', file.name, 'to folder:', folderId);
      return driveApi.uploadFile(file, folderId);
    },
    onSuccess: (data) => {
      console.log('Upload successful:', data);
      queryClient.invalidateQueries({ queryKey: ['drive-files'] });
      queryClient.invalidateQueries({ queryKey: ['drive-folders'] }); // Update folder file counts
      toast.success('File uploaded successfully');
    },
    onError: (error: any) => {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload file');
    },
  });

  const deleteFile = useMutation({
    mutationFn: (id: string) => driveApi.deleteFile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drive-files'] });
      queryClient.invalidateQueries({ queryKey: ['drive-folders'] }); // Update folder file counts
      toast.success('File moved to trash');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete file');
    },
  });

  return {
    files: filesQuery.data || [],
    isLoading: filesQuery.isLoading,
    error: filesQuery.error,
    uploadFile,
    deleteFile,
    refetch: filesQuery.refetch,
  };
}

// Hook for activities
export function useDriveActivities() {
  return useQuery({
    queryKey: ['drive-activities'],
    queryFn: () => driveApi.getActivities(),
  });
}

// Hook for search
export function useDriveSearch(query: string) {
  return useQuery({
    queryKey: ['drive-search', query],
    queryFn: () => driveApi.search(query),
    enabled: query.length >= 2,
  });
}

// Utility functions
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}

export function getFileTypeFromMime(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.includes('document') || mimeType.includes('word')) return 'document';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentation';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'spreadsheet';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('text/')) return 'text';
  return 'file';
}