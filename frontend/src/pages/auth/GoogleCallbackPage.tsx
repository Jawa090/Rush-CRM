import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export default function GoogleCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [message, setMessage] = useState("Connecting your Google account...");

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const error = searchParams.get("error");
      const stateParam = searchParams.get("state");

      let provider = "calendar";
      if (stateParam) {
        try {
          const stateData = JSON.parse(atob(stateParam));
          if (stateData.provider === "gmail-mail") {
            provider = "gmail-mail";
          }
        } catch {
          // Default to calendar
        }
      }

      const isMail = provider === "gmail-mail";
      const redirectPath = isMail ? "/collaboration/mail" : "/collaboration/calendar";

      if (error) {
        setStatus("error");
        setMessage(`Google authorization failed: ${error}`);
        setTimeout(() => navigate(redirectPath), 3000);
        return;
      }

      if (!code) {
        setStatus("error");
        setMessage("No authorization code received.");
        setTimeout(() => navigate(redirectPath), 3000);
        return;
      }

      try {
        const endpoint = isMail
          ? "/integrations/gmail/exchange-code"
          : "/integrations/google-calendar/exchange-code";

        const bodyPayload = isMail
          ? { code }
          : { code, redirectUri: `${window.location.origin}/auth/google/callback` };

        const data = await api.post<any>(endpoint, bodyPayload);

        setStatus("success");
        const successMsg = isMail
          ? "Gmail connected! Syncing your emails..."
          : "Google Calendar connected successfully!";
        setMessage(successMsg);
        toast({
          title: isMail ? "Gmail Connected" : "Calendar Connected",
          description: successMsg,
        });

        if (isMail && data?.mailbox?.id) {
          try {
            await api.post("/email/sync", {
              action: "sync",
              mailbox_id: data.mailbox.id,
              full_sync: true,
            });
          } catch {
            // Sync will happen on next manual trigger
          }
        }

        setTimeout(() => navigate(redirectPath), 1500);
      } catch (err: any) {
        console.error("Callback error:", err);
        setStatus("error");
        setMessage(err.message || "Failed to connect.");
        setTimeout(() => navigate(isMail ? "/collaboration/mail" : "/collaboration/calendar"), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4 p-8">
        {status === "processing" && (
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        )}
        {status === "success" && (
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        {status === "error" && (
          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}
        <p className="text-lg font-medium text-foreground">{message}</p>
        <p className="text-sm text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
