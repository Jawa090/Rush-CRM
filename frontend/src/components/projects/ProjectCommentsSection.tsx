import { useState } from "react";
import { Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { api } from '@/lib/api';
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  profile?: { full_name: string; avatar_url: string | null } | null;
}

export function ProjectCommentsSection({ entityType, entityId }: { entityType: string; entityId: string }) {
  const { profile, user } = useAuth();
  const qc = useQueryClient();
  const [content, setContent] = useState("");

  const { data: comments = [] } = useQuery({
    queryKey: ['project_comments', entityType, entityId],
    queryFn: async () => {
      if (!profile?.org_id) return [];
      const data = await api.get<any[]>('/projects/comments', { entity_type: entityType, entity_id: entityId }).catch(() => []);
      return (data || []) as Comment[];
    },
    enabled: !!profile?.org_id && !!entityId,
  });

  const addComment = useMutation({
    mutationFn: async (text: string) => {
      if (!profile?.org_id || !user) throw new Error('No org');
      await api.post('/projects/comments', { content: text, entity_type: entityType, entity_id: entityId });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['project_comments', entityType, entityId] }); setContent(""); },
    onError: (e) => toast.error('Failed: ' + e.message),
  });

  const handleSubmit = () => {
    if (!content.trim()) return;
    addComment.mutate(content.trim());
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <h4 className="text-sm font-semibold">Discussion ({comments.length})</h4>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {comments.map(c => (
          <div key={c.id} className="flex gap-2">
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarFallback className="text-[10px]">{(c.profile?.full_name || "U").slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-medium">{c.profile?.full_name || "Unknown"}</span>
                <span className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}</span>
              </div>
              <p className="text-sm mt-0.5">{c.content}</p>
            </div>
          </div>
        ))}
        {comments.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No comments yet</p>}
      </div>

      <div className="flex gap-2">
        <Textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Add a comment..."
          className="min-h-[60px] text-sm"
          onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit(); }}
        />
        <Button size="icon" className="shrink-0 self-end" onClick={handleSubmit} disabled={!content.trim() || addComment.isPending}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
