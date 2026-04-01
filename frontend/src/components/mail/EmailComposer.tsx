import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send, Paperclip, ChevronDown, ChevronUp, X } from "lucide-react";
import { api } from '@/lib/api';
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface EmailComposerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mailboxes: any[];
  replyTo?: any;
  forwardEmail?: any;
}

export function EmailComposer({ open, onOpenChange, mailboxes, replyTo, forwardEmail }: EmailComposerProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [sending, setSending] = useState(false);

  const [form, setForm] = useState({
    mailbox_id: mailboxes[0]?.id || "",
    to: replyTo?.from_address || "",
    cc: "",
    bcc: "",
    subject: replyTo
      ? `Re: ${replyTo.subject}`
      : forwardEmail
      ? `Fwd: ${forwardEmail.subject}`
      : "",
    body: forwardEmail
      ? `\n\n---------- Forwarded message ----------\nFrom: ${forwardEmail.from_address}\nSubject: ${forwardEmail.subject}\n\n${forwardEmail.body_text || ""}`
      : "",
  });

  const handleSend = async () => {
    if (!user) return;
    if (!form.to || !form.subject) {
      toast.error("To and Subject are required");
      return;
    }

    setSending(true);
    try {
      // Send via edge function (real Gmail API / Graph API)
      const data = await api.post<any>('/email/send', {
          mailbox_id: form.mailbox_id,
          to: form.to,
          cc: form.cc || undefined,
          bcc: form.bcc || undefined,
          subject: form.subject,
          body: form.body,
          in_reply_to: replyTo?.message_id || undefined,
          thread_id: replyTo?.thread_id || undefined,
      });
      if (data?.error) throw new Error(data.error);

      toast.success("Email sent successfully");
      queryClient.invalidateQueries({ queryKey: ["emails"] });
      queryClient.invalidateQueries({ queryKey: ["email-counts"] });
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to send email");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{replyTo ? "Reply" : forwardEmail ? "Forward" : "New Email"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {mailboxes.length > 1 && (
            <div className="space-y-1">
              <Label className="text-xs">From</Label>
              <Select value={form.mailbox_id} onValueChange={(v) => setForm({ ...form, mailbox_id: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mailboxes.map((mb) => (
                    <SelectItem key={mb.id} value={mb.id}>
                      {mb.email_address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-xs">To</Label>
              <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setShowCcBcc(!showCcBcc)}>
                {showCcBcc ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
                CC/BCC
              </Button>
            </div>
            <Input
              placeholder="recipient@example.com"
              value={form.to}
              onChange={(e) => setForm({ ...form, to: e.target.value })}
            />
          </div>

          {showCcBcc && (
            <>
              <div className="space-y-1">
                <Label className="text-xs">CC</Label>
                <Input
                  placeholder="cc@example.com"
                  value={form.cc}
                  onChange={(e) => setForm({ ...form, cc: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">BCC</Label>
                <Input
                  placeholder="bcc@example.com"
                  value={form.bcc}
                  onChange={(e) => setForm({ ...form, bcc: e.target.value })}
                />
              </div>
            </>
          )}

          <div className="space-y-1">
            <Label className="text-xs">Subject</Label>
            <Input
              placeholder="Email subject"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <Textarea
              placeholder="Write your message..."
              className="min-h-[200px] resize-y"
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" title="Attach file">
              <Paperclip className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
            <Button onClick={handleSend} disabled={sending} className="gradient-primary text-primary-foreground">
              <Send className="mr-2 h-4 w-4" />
              {sending ? "Sending..." : "Send"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
