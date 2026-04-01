import { useState } from "react";
import { format } from "date-fns";
import {
  Send, MoreHorizontal, Pencil, Trash2,
  MessageSquare, Clock, CalendarDays, CheckSquare, Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  useActivities, useComments, useCreateComment,
  useCreateActivity, useDeleteComment, useUpdateComment
} from "@/hooks/useCrmInteractions";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface InteractionPanelProps {
  entityType: string;
  entityId: string;
}

const tabs = [
  { id: "activity", label: "Activity", icon: Activity },
  { id: "comment", label: "Comment", icon: MessageSquare },
  { id: "message", label: "Message", icon: Send },
  { id: "booking", label: "Booking", icon: CalendarDays },
  { id: "task", label: "Task", icon: CheckSquare },
];

export function InteractionPanel({ entityType, entityId }: InteractionPanelProps) {
  const [activeTab, setActiveTab] = useState("activity");
  const [commentText, setCommentText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const { user, profile } = useAuth();

  const { data: activities = [] } = useActivities(entityType, entityId);
  const { data: comments = [] } = useComments(entityType, entityId);
  const createComment = useCreateComment();
  const createActivity = useCreateActivity();
  const deleteComment = useDeleteComment();
  const updateComment = useUpdateComment();

  const handleSubmitComment = () => {
    if (!commentText.trim()) return;
    createComment.mutate({
      entity_type: entityType,
      entity_id: entityId,
      content: commentText,
    });
    setCommentText("");
  };

  const handleEditSave = (id: string) => {
    updateComment.mutate({
      id, content: editText, entity_type: entityType, entity_id: entityId,
    });
    setEditingId(null);
  };

  // Merge activities and comments into a single timeline
  // Since we use crm_activities for both now, we filter them to avoid duplicates
  const timeline = [
    ...activities.filter(a => a.activity_type !== 'comment').map(a => ({
      id: a.id,
      type: 'activity' as const,
      content: a.title || a.description || a.activity_type,
      detail: a.description,
      activityType: a.activity_type,
      createdAt: a.created_at,
      userId: a.user_id,
      userName: a.user_name,
    })),
    ...comments.map(c => ({
      id: c.id,
      type: 'comment' as const,
      content: c.content || c.description, // Support both formats
      detail: null,
      activityType: 'comment',
      createdAt: c.created_at,
      userId: c.user_id,
      userName: c.user_name,
      isEdited: c.is_edited,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const filteredTimeline = activeTab === "activity"
    ? timeline
    : activeTab === "comment"
    ? timeline.filter(t => t.type === 'comment')
    : [];

  return (
    <div className="bg-card rounded-lg border flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex items-center gap-1 p-2 border-b overflow-x-auto">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "text-xs px-2 py-1 h-7 gap-1 shrink-0",
              activeTab === tab.id ? "bg-muted text-foreground" : "text-muted-foreground"
            )}
          >
            <tab.icon className="h-3 w-3" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Input area for comment/message */}
      {(activeTab === "comment" || activeTab === "message" || activeTab === "activity") && (
        <div className="p-3 border-b">
          <div className="flex gap-2">
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {profile?.full_name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder={activeTab === "message" ? "Write a message..." : "Add a comment..."}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="min-h-[60px] text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmitComment();
                }}
              />
              <div className="flex justify-end mt-2">
                <Button
                  size="sm"
                  onClick={handleSubmitComment}
                  disabled={!commentText.trim() || createComment.isPending}
                  className="gap-1"
                >
                  <Send className="h-3 w-3" />
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Placeholder for booking/task */}
      {(activeTab === "booking" || activeTab === "task") && (
        <div className="p-8 text-center text-muted-foreground text-sm">
          <div className="flex flex-col items-center gap-2">
            {activeTab === "booking" ? (
              <CalendarDays className="h-8 w-8 text-muted-foreground/50" />
            ) : (
              <CheckSquare className="h-8 w-8 text-muted-foreground/50" />
            )}
            <p>{activeTab === "booking" ? "Calendar booking" : "Task management"} coming soon.</p>
            <p className="text-xs">This feature will be available in a future update.</p>
          </div>
        </div>
      )}

      {/* Timeline */}
      <ScrollArea className="flex-1 max-h-[500px]">
        <div className="p-3 space-y-3">
          {filteredTimeline.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              No activity yet
            </div>
          )}
          {filteredTimeline.map((item) => (
            <div key={item.id} className="flex gap-2 group">
              <div className="relative">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className={cn(
                    "text-xs",
                    item.type === 'activity' ? "bg-chart-1/10 text-chart-1" : "bg-primary/10 text-primary"
                  )}>
                    {item.type === 'activity' ? <Activity className="h-3 w-3" /> : (item.userName?.charAt(0) || "U")}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute left-1/2 top-7 bottom-0 w-px bg-border -translate-x-1/2" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    {editingId === item.id ? (
                      <div className="space-y-1">
                        <Textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="min-h-[50px] text-sm"
                        />
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                          <Button size="sm" onClick={() => handleEditSave(item.id)}>Save</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm">{item.content}</p>
                        {item.detail && item.type === 'activity' && (
                          <p className="text-xs text-muted-foreground mt-0.5">{item.detail}</p>
                        )}
                        {'isEdited' in item && item.isEdited && (
                          <span className="text-[10px] text-muted-foreground">(edited)</span>
                        )}
                      </>
                    )}
                  </div>
                  {item.type === 'comment' && item.userId === user?.id && editingId !== item.id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setEditingId(item.id); setEditText(item.content || ""); }}>
                          <Pencil className="h-3 w-3 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => deleteComment.mutate({ id: item.id, entity_type: entityType, entity_id: entityId })}
                        >
                          <Trash2 className="h-3 w-3 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {format(new Date(item.createdAt), "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
