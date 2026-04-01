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
  FileCode,
} from "lucide-react";

/**
 * Unified file icon resolver for all drive providers.
 * Maps mime types to consistent icons and colors.
 */
export function getUnifiedFileIcon(mimeType: string, isFolder: boolean) {
  if (isFolder || mimeType === "application/vnd.google-apps.folder" || mimeType === "application/vnd.ms-folder") {
    return <Folder className="h-5 w-5 text-amber-500" />;
  }
  if (mimeType.startsWith("image/") || mimeType === "application/vnd.google-apps.photo") {
    return <Image className="h-5 w-5 text-emerald-500" />;
  }
  if (mimeType.startsWith("video/")) {
    return <Video className="h-5 w-5 text-purple-500" />;
  }
  if (mimeType.startsWith("audio/")) {
    return <Music className="h-5 w-5 text-pink-500" />;
  }
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel") || mimeType === "application/vnd.google-apps.spreadsheet") {
    return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
  }
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint") || mimeType === "application/vnd.google-apps.presentation") {
    return <Presentation className="h-5 w-5 text-orange-500" />;
  }
  if (mimeType === "application/pdf") {
    return <FileText className="h-5 w-5 text-red-500" />;
  }
  if (
    mimeType.includes("document") ||
    mimeType.includes("word") ||
    mimeType.startsWith("text/") ||
    mimeType === "application/vnd.google-apps.document"
  ) {
    return <FileText className="h-5 w-5 text-blue-500" />;
  }
  if (mimeType.includes("zip") || mimeType.includes("archive") || mimeType.includes("compressed")) {
    return <Archive className="h-5 w-5 text-gray-500" />;
  }
  if (mimeType.includes("json") || mimeType.includes("xml") || mimeType.includes("javascript") || mimeType.includes("html")) {
    return <FileCode className="h-5 w-5 text-slate-500" />;
  }
  return <File className="h-5 w-5 text-muted-foreground" />;
}

/**
 * Unified file size formatter.
 * Outputs: "0 B", "1.2 KB", "3.4 MB", "1.1 GB"
 */
export function formatFileSize(bytes?: string | number | null): string {
  if (bytes == null || bytes === "") return "—";
  const size = typeof bytes === "string" ? parseInt(bytes, 10) : bytes;
  if (isNaN(size) || size < 0) return "—";
  if (size === 0) return "0 B";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

/**
 * Unified relative date formatter.
 * Outputs: "Just now", "Today 2:30 PM", "Yesterday", "5 days ago", "Jan 15, 2026"
 */
export function formatRelativeDate(dateString?: string | null): string {
  if (!dateString) return "—";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "—";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  const timeStr = date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

  // Same calendar day
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (diffMins < 1) return "Just now";
  if (isToday) return `Today ${timeStr}`;
  if (isYesterday) return `Yesterday ${timeStr}`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  }

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
