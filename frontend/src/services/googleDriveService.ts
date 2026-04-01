import { api } from "@/lib/api";

const API_URL = import.meta.env.VITE_API_URL || "/api";

async function callDriveFunction(
  functionName: string,
  action: string,
  body: Record<string, unknown>
): Promise<Response> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_URL}/drives/google-drive/${action}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ functionName, ...body }),
  });
  return response;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  iconLink?: string;
  thumbnailLink?: string;
  webViewLink?: string;
  parents?: string[];
}

export interface ListFilesResponse {
  files: DriveFile[];
  nextPageToken?: string;
}

export const googleDriveService = {
  async getAuthUrl(redirectUri: string, driveId: string, ownership: string): Promise<string> {
    const response = await callDriveFunction("google-drive-auth", "get-auth-url", {
      redirectUri,
      driveId,
      ownership,
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to get auth URL");
    return data.authUrl;
  },

  async exchangeCode(code: string, redirectUri: string, driveId: string): Promise<void> {
    const response = await callDriveFunction("google-drive-auth", "exchange-code", {
      code,
      redirectUri,
      driveId,
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to exchange code");
  },

  async listFiles(driveId: string, folderId?: string, pageToken?: string): Promise<ListFilesResponse> {
    const response = await callDriveFunction("google-drive-files", "list", {
      driveId,
      folderId: folderId || "root",
      pageToken,
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to list files");
    return data;
  },

  async createFolder(driveId: string, name: string, parentId?: string): Promise<DriveFile> {
    const response = await callDriveFunction("google-drive-files", "create-folder", {
      driveId,
      name,
      parentId: parentId || "root",
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to create folder");
    return data;
  },

  async rename(driveId: string, fileId: string, newName: string): Promise<DriveFile> {
    const response = await callDriveFunction("google-drive-files", "rename", {
      driveId,
      fileId,
      name: newName,
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to rename");
    return data;
  },

  async delete(driveId: string, fileId: string): Promise<void> {
    const response = await callDriveFunction("google-drive-files", "delete", {
      driveId,
      fileId,
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to delete");
  },

  async move(driveId: string, fileId: string, newParentId: string, currentParentId?: string): Promise<DriveFile> {
    const response = await callDriveFunction("google-drive-files", "move", {
      driveId,
      fileId,
      newParentId,
      currentParentId,
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to move");
    return data;
  },

  async getUploadUrl(driveId: string, name: string, mimeType?: string, parentId?: string): Promise<string> {
    const response = await callDriveFunction("google-drive-files", "get-upload-url", {
      driveId,
      name,
      mimeType,
      parentId: parentId || "root",
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to get upload URL");
    return data.uploadUrl;
  },

  async getDownloadInfo(driveId: string, fileId: string): Promise<{ downloadUrl: string; accessToken: string; fileName: string; mimeType: string }> {
    const response = await callDriveFunction("google-drive-files", "download", {
      driveId,
      fileId,
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to get download info");
    return data;
  },

  async downloadFile(driveId: string, fileId: string): Promise<void> {
    const info = await googleDriveService.getDownloadInfo(driveId, fileId);
    
    const response = await fetch(info.downloadUrl, {
      headers: { Authorization: `Bearer ${info.accessToken}` },
    });
    
    if (!response.ok) throw new Error("Failed to download file");
    
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = info.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};
