import { api } from "@/lib/api";

const API_URL = import.meta.env.VITE_API_URL || "/api";

async function callDriveFunction(
  action: string,
  body: Record<string, unknown>
): Promise<Response> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_URL}/drives/onedrive/${action}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  return response;
}

export interface OneDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  webViewLink?: string;
  downloadUrl?: string;
  isFolder: boolean;
  childCount?: number;
}

export interface ListFilesResponse {
  files: OneDriveFile[];
  nextPageToken?: string | null;
}

export const oneDriveService = {
  async getAuthUrl(): Promise<string> {
    const response = await callOneDriveFunction("get-auth-url", {});
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to get auth URL");
    return data.authUrl;
  },

  async exchangeCode(code: string): Promise<void> {
    const response = await callOneDriveFunction("exchange-code", { code });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to exchange code");
  },

  async listFiles(connectionId: string, folderId?: string, pageToken?: string): Promise<ListFilesResponse> {
    const response = await callOneDriveFunction("list-files", {
      connectionId,
      folderId: folderId || "root",
      pageToken,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to list files");
    return data;
  },

  async createFolder(connectionId: string, name: string, parentId?: string): Promise<void> {
    const response = await callOneDriveFunction("create-folder", {
      connectionId,
      name,
      parentId: parentId || "root",
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to create folder");
  },

  async rename(connectionId: string, fileId: string, newName: string): Promise<void> {
    const response = await callOneDriveFunction("rename", {
      connectionId,
      fileId,
      name: newName,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to rename");
  },

  async deleteFile(connectionId: string, fileId: string): Promise<void> {
    const response = await callOneDriveFunction("delete", {
      connectionId,
      fileId,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to delete");
  },

  async downloadFile(connectionId: string, fileId: string): Promise<void> {
    const response = await callOneDriveFunction("download-file", {
      connectionId,
      fileId,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to get download info");

    const fileRes = await fetch(data.downloadUrl);
    if (!fileRes.ok) throw new Error("Failed to download file");

    const blob = await fileRes.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = data.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  async getUploadUrl(connectionId: string, fileName: string, mimeType: string, folderId?: string): Promise<{ uploadUrl: string; accessToken: string }> {
    const response = await callOneDriveFunction("upload-file", {
      connectionId,
      fileName,
      mimeType,
      folderId: folderId || "root",
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to get upload URL");
    return data;
  },

  async search(connectionId: string, query: string): Promise<OneDriveFile[]> {
    const response = await callOneDriveFunction("search", {
      connectionId,
      query,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Search failed");
    return data.files;
  },
};

async function callOneDriveFunction(
  action: string,
  body: Record<string, unknown>
): Promise<Response> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_URL}/drives/onedrive/${action}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  return response;
}
