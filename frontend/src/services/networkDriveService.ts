import { api } from "@/lib/api";

const API_URL = import.meta.env.VITE_API_URL || "/api";

async function callNetworkDriveFunction(
  body: Record<string, unknown>
): Promise<Response> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_URL}/drives/network-drive`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  return response;
}

export interface NetworkFile {
  id: string;
  name: string;
  type: "file" | "folder";
  size?: number;
  modified?: string;
  path: string;
}

export interface NetworkDriveCredentials {
  username?: string;
  password?: string;
  domain?: string;
  privateKey?: string;
  port?: number;
}

export const networkDriveService = {
  async testConnection(
    protocol: string,
    path: string,
    credentials?: NetworkDriveCredentials
  ): Promise<{ success: boolean; message: string }> {
    const response = await callNetworkDriveFunction({
      action: "connect",
      protocol,
      path,
      credentials,
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to connect");
    return data;
  },

  async listFiles(
    driveId: string,
    protocol: string,
    path: string,
    credentials?: NetworkDriveCredentials
  ): Promise<{ files: NetworkFile[]; supported: boolean; message?: string }> {
    const response = await callNetworkDriveFunction({
      driveId,
      action: "list",
      protocol,
      path,
      credentials,
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to list files");
    
    const files: NetworkFile[] = (data.files || []).map((file: any, index: number) => ({
      id: `${path}/${file.name}-${index}`,
      name: file.name,
      type: file.type || "file",
      size: file.size,
      modified: file.modified,
      path: `${path}/${file.name}`,
    }));
    
    return { 
      files, 
      supported: data.supported !== false,
      message: data.message 
    };
  },

  async createFolder(
    driveId: string,
    protocol: string,
    path: string,
    credentials?: NetworkDriveCredentials
  ): Promise<{ success: boolean }> {
    const response = await callNetworkDriveFunction({
      driveId,
      action: "mkdir",
      protocol,
      path,
      targetPath: path,
      credentials,
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to create folder");
    return data;
  },

  async delete(
    driveId: string,
    protocol: string,
    path: string,
    credentials?: NetworkDriveCredentials
  ): Promise<{ success: boolean }> {
    const response = await callNetworkDriveFunction({
      driveId,
      action: "delete",
      protocol,
      path,
      targetPath: path,
      credentials,
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to delete");
    return data;
  },

  async rename(
    driveId: string,
    protocol: string,
    currentPath: string,
    newName: string,
    credentials?: NetworkDriveCredentials
  ): Promise<{ success: boolean }> {
    const parentPath = currentPath.substring(0, currentPath.lastIndexOf("/"));
    const newPath = `${parentPath}/${newName}`;
    
    const response = await callNetworkDriveFunction({
      driveId,
      action: "rename",
      protocol,
      path: currentPath,
      targetPath: currentPath,
      newName: newPath,
      credentials,
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to rename");
    return data;
  },

  async download(
    driveId: string,
    protocol: string,
    path: string,
    fileName: string,
    credentials?: NetworkDriveCredentials
  ): Promise<void> {
    const response = await callNetworkDriveFunction({
      driveId,
      action: "download",
      protocol,
      path,
      targetPath: path,
      credentials,
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to download");
    
    if (data.content) {
      const binaryString = atob(data.content);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const blob = new Blob([bytes], { type: data.contentType || "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      throw new Error("Download not supported for this protocol");
    }
  },
};
