import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MailboxIntegration } from "@/components/mail/MailboxIntegration";
import { WebmailView } from "@/components/mail/WebmailView";

export default function MailPage() {
  const { user } = useAuth();
  const [view, setView] = useState<"integration" | "webmail">("integration");

  const { data: mailboxes = [], isLoading } = useQuery({
    queryKey: ["connected-mailboxes", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("connected_mailboxes")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Auto-switch to webmail if user has connected mailboxes
  if (view === "integration" && mailboxes.length > 0) {
    return (
      <MailboxIntegration
        onMailboxConnected={() => setView("webmail")}
      />
    );
  }

  if (view === "webmail" && mailboxes.length > 0) {
    return (
      <WebmailView
        mailboxes={mailboxes}
        onBackToIntegration={() => setView("integration")}
      />
    );
  }

  return (
    <MailboxIntegration
      onMailboxConnected={() => setView("webmail")}
    />
  );
}
