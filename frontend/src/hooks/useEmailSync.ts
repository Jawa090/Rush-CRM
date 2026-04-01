import { useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useEmailSync() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [syncing, setSyncing] = useState<Record<string, boolean>>({});

  const syncMailbox = useCallback(
    async (mailboxId: string, fullSync = false) => {
      if (!user) return;
      setSyncing((prev) => ({ ...prev, [mailboxId]: true }));

      try {
        const response = await api.post("/email/sync", {
          action: "sync",
          mailbox_id: mailboxId,
          full_sync: fullSync,
        });

        queryClient.invalidateQueries({ queryKey: ["emails"] });
        queryClient.invalidateQueries({ queryKey: ["email-counts"] });
        queryClient.invalidateQueries({ queryKey: ["email-crm-links"] });
        toast.success(`Synced ${response.messages_synced || 0} messages`);
        return response;
      } catch (err: any) {
        const msg = err.message || "Sync failed";
        if (msg.includes("Connection reset") || msg.includes("timed out")) {
          throw new Error("Mail server connection was interrupted. Please try again.");
        }
        toast.error(msg);
        throw err;
      } finally {
        setSyncing((prev) => ({ ...prev, [mailboxId]: false }));
      }
    },
    [user, queryClient]
  );

  const refreshToken = useCallback(
    async (mailboxId: string) => {
      if (!user) return;
      try {
        const response = await api.post("/email/sync", {
          action: "refresh_token",
          mailbox_id: mailboxId,
        });
        return response;
      } catch (err: any) {
        toast.error(err.message || "Token refresh failed");
      }
    },
    [user]
  );

  const getHealth = useCallback(async () => {
    if (!user) return null;
    try {
      const response = await api.post("/email/sync", { action: "health" });
      return response;
    } catch {
      return null;
    }
  }, [user]);

  return { syncMailbox, refreshToken, getHealth, syncing };
}
