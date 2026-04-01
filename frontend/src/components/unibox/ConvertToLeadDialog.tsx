import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { UniboxEmail } from "@/hooks/useUniboxEmails";

interface ConvertToLeadDialogProps {
  email: UniboxEmail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConvert: (data: {
    title: string;
    company_name: string;
    company_email: string;
    company_phone: string;
    interaction_notes: string;
  }) => void;
  isConverting: boolean;
}

function extractCompanyFromDomain(email: string): string {
  const domain = email.split("@")[1];
  if (!domain) return "";
  const name = domain.split(".")[0];
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function extractPhone(text: string | null): string {
  if (!text) return "";
  const match = text.match(/(\+?\d[\d\s\-()]{8,}\d)/);
  return match ? match[0].trim() : "";
}

export function ConvertToLeadDialog({
  email,
  open,
  onOpenChange,
  onConvert,
  isConverting,
}: ConvertToLeadDialogProps) {
  const [title, setTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [notes, setNotes] = useState("");

  // Reset and prefill when email changes
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && email) {
      setTitle(email.subject || "Untitled Lead");
      setCompanyName(email.sender_name || extractCompanyFromDomain(email.sender_email));
      setCompanyEmail(email.sender_email);
      setCompanyPhone(email.phone || extractPhone(email.body_text));
      const timestamp = new Date(email.received_at).toISOString();
      setNotes(`[${timestamp}] Email received via Instantly.ai Unibox:\n\n${email.body_text || ""}`);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Convert to Lead</DialogTitle>
          <DialogDescription>
            Create a new lead from this Unibox email. Review and edit the details below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Lead Name</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Company Name</Label>
            <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Contact Email</Label>
              <Input value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} placeholder="Optional" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Interaction Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={5} />
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>Auto-set: Stage → Unassigned | Source → Unibox Email | Priority → Medium</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              onConvert({
                title,
                company_name: companyName,
                company_email: companyEmail,
                company_phone: companyPhone,
                interaction_notes: notes,
              })
            }
            disabled={isConverting || !title.trim()}
          >
            {isConverting ? "Converting..." : "Create Lead"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
