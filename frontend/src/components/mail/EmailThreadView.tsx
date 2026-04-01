import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Reply,
  Forward,
  Star,
  Trash2,
  ArrowLeft,
  Paperclip,
  Archive,
  MailOpen,
  ChevronDown,
  ChevronUp,
  Download,
} from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { EmailCrmPanel } from "./EmailCrmPanel";
import { api } from '@/lib/api';
import { useQuery } from "@tanstack/react-query";

interface EmailThreadViewProps {
  email: any;
  threadEmails: any[];
  onBack: () => void;
  onReply: (email: any) => void;
  onForward: (email: any) => void;
  onStar: (id: string) => void;
  onDelete: (id: string) => void;
}

function formatFullDate(dateStr: string | null) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isToday(d)) return `Today at ${format(d, "h:mm a")}`;
  if (isYesterday(d)) return `Yesterday at ${format(d, "h:mm a")}`;
  return format(d, "MMM d, yyyy 'at' h:mm a");
}

function MessageCard({
  msg,
  isExpanded,
  onToggle,
  onReply,
  onForward,
}: {
  msg: any;
  isExpanded: boolean;
  onToggle: () => void;
  onReply: (email: any) => void;
  onForward: (email: any) => void;
}) {
  const { data: attachments = [] } = useQuery({
    queryKey: ["email-attachments", msg.id],
    queryFn: async () => {
      const data = await api.get<any[]>('/email/attachments', { email_id: msg.id });
      return data || [];
    },
    enabled: !!msg.id && msg.has_attachments,
  });

  return (
    <Card className="overflow-hidden">
      {/* Header - always visible */}
      <div
        className="flex items-start justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {(msg.from_name || msg.from_address || "?")[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-sm truncate">
                {msg.from_name || msg.from_address}
              </p>
              {!isExpanded && (
                <span className="text-xs text-muted-foreground truncate max-w-[300px]">
                  — {msg.snippet || msg.body_text?.substring(0, 60)}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              to {(msg.to_addresses as any[])?.map((t: any) => t.email).join(", ")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground">
            {formatFullDate(msg.received_at || msg.sent_at)}
          </span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Body - collapsible */}
      {isExpanded && (
        <div className="px-4 pb-4">
          <div className="prose prose-sm max-w-none text-foreground ml-12">
            {msg.body_html ? (
              <div dangerouslySetInnerHTML={{ __html: msg.body_html }} />
            ) : (
              <p className="whitespace-pre-wrap">{msg.body_text}</p>
            )}
          </div>

          {/* Attachments */}
          {(attachments.length > 0 || msg.has_attachments) && (
            <div className="mt-4 ml-12 pt-3 border-t">
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-2">
                <Paperclip className="h-3.5 w-3.5" />
                {attachments.length > 0
                  ? `${attachments.length} attachment${attachments.length > 1 ? "s" : ""}`
                  : "Attachments"}
              </p>
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {attachments.map((att: any) => (
                    <div
                      key={att.id}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-muted/30 text-sm group hover:bg-muted/50 transition-colors"
                    >
                      <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="truncate max-w-[150px]">{att.filename}</span>
                      {att.size && (
                        <span className="text-[10px] text-muted-foreground">
                          {(att.size / 1024).toFixed(0)} KB
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 mt-4 ml-12 pt-3 border-t">
            <Button variant="outline" size="sm" onClick={() => onReply(msg)}>
              <Reply className="mr-1.5 h-3.5 w-3.5" /> Reply
            </Button>
            <Button variant="outline" size="sm" onClick={() => onForward(msg)}>
              <Forward className="mr-1.5 h-3.5 w-3.5" /> Forward
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

export function EmailThreadView({
  email,
  threadEmails,
  onBack,
  onReply,
  onForward,
  onStar,
  onDelete,
}: EmailThreadViewProps) {
  const allEmails = threadEmails.length > 0 ? threadEmails : [email];
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set([allEmails[allEmails.length - 1]?.id])
  );

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" className="shrink-0" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold truncate">
              {email.subject || "(No Subject)"}
            </h2>
            {allEmails.length > 1 && (
              <p className="text-xs text-muted-foreground">
                {allEmails.length} messages in thread
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onStar(email.id)}>
                <Star className={`h-4 w-4 ${email.is_starred ? "fill-warning text-warning" : ""}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{email.is_starred ? "Unstar" : "Star"}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(email.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <ScrollArea className="h-[calc(100vh-250px)]">
          <div className="space-y-3 pr-2">
            {allEmails.map((msg) => (
              <MessageCard
                key={msg.id}
                msg={msg}
                isExpanded={expandedIds.has(msg.id)}
                onToggle={() => toggleExpand(msg.id)}
                onReply={onReply}
                onForward={onForward}
              />
            ))}
          </div>
        </ScrollArea>

        {/* CRM Context Sidebar */}
        <div className="space-y-4">
          <EmailCrmPanel email={email} />
        </div>
      </div>
    </div>
  );
}
