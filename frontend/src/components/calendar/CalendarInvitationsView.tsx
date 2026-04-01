import { CalendarDays, Check, X, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCalendarInvitations, useRespondToInvitation, type CalendarEvent, type EventAttendee } from "@/hooks/useCalendarEvents";
import { format } from "date-fns";

export function CalendarInvitationsView() {
  const { data: invitations, isLoading } = useCalendarInvitations();
  const respondMutation = useRespondToInvitation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!invitations || invitations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="w-24 h-24 rounded-full bg-sky-100 dark:bg-sky-950/30 flex items-center justify-center mb-6">
          <CalendarDays className="h-12 w-12 text-sky-400" />
        </div>
        <h3 className="text-xl font-medium text-foreground">
          You don't have any pending invitations.
        </h3>
      </div>
    );
  }

  return (
    <div className="divide-y max-h-[500px] overflow-y-auto">
      {invitations.map((inv) => {
        const event = (inv as any).calendar_events as CalendarEvent;
        if (!event) return null;
        return (
          <div key={inv.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/20">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${event.color || 'bg-sky-500'}`} />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{event.title}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(event.start_time), 'MMM d, yyyy · h:mm a')}
                  {event.location && ` · ${event.location}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0 ml-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-success hover:text-success hover:bg-success/10 h-8"
                onClick={() => respondMutation.mutate({ attendeeId: inv.id, status: 'accepted' })}
                disabled={respondMutation.isPending}
              >
                <Check className="h-4 w-4 mr-1" /> Accept
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground h-8"
                onClick={() => respondMutation.mutate({ attendeeId: inv.id, status: 'tentative' })}
                disabled={respondMutation.isPending}
              >
                <HelpCircle className="h-3.5 w-3.5 mr-1" /> Maybe
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8"
                onClick={() => respondMutation.mutate({ attendeeId: inv.id, status: 'declined' })}
                disabled={respondMutation.isPending}
              >
                <X className="h-4 w-4 mr-1" /> Decline
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
