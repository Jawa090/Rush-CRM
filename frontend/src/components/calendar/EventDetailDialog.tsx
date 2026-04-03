import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, Clock, Users, Trash2, Pencil, Check, X } from "lucide-react";
import { type CalendarEvent, useCalendarEvents, useEventAttendees, type EventAttendee } from "@/hooks/useCalendarEvents";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

interface EventDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: CalendarEvent | null;
}

export function EventDetailDialog({ open, onOpenChange, event }: EventDetailDialogProps) {
  const { profile } = useAuth();
  const { updateEvent, deleteEvent } = useCalendarEvents();
  const { data: attendees } = useEventAttendees(event?.id ?? null);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isAllDay, setIsAllDay] = useState(false);

  const formatDateTimeLocal = useCallback((d: Date) => {
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }, []);

  const isOwner = event ? event.created_by === profile?.id : false;
  const startDate = event ? new Date(event.start_time) : new Date();
  const endDate = event ? new Date(event.end_time) : new Date();


  useEffect(() => {
    if (open && event) {
      setTitle(event.title);
      setDescription(event.description || "");
      setLocation(event.location || "");
      setStartTime(formatDateTimeLocal(new Date(event.start_time)));
      setEndTime(formatDateTimeLocal(new Date(event.end_time)));
      setIsAllDay(event.is_all_day);
    }
    if (!open) {
      setEditing(false);
    }
  }, [open, event, formatDateTimeLocal]);

  const isValidDate = (d: Date) => !isNaN(d.getTime());

  const startEditing = () => {
    if (!event) return;
    setTitle(event.title);
    setDescription(event.description || "");
    setLocation(event.location || "");
    setStartTime(formatDateTimeLocal(new Date(event.start_time)));
    setEndTime(formatDateTimeLocal(new Date(event.end_time)));
    setIsAllDay(event.is_all_day);
    setEditing(true);
  };

  const handleSave = () => {
    if (!event) return;
    updateEvent.mutate({
      id: event.id,
      title,
      description: description || undefined,
      location: location || undefined,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      allDay: isAllDay,
    }, {
      onSuccess: () => setEditing(false),
    });
  };

  const handleDelete = () => {
    if (!event) return;
    deleteEvent.mutate(event.id, {
      onSuccess: () => onOpenChange(false),
    });
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      accepted: "bg-success/20 text-success",
      pending: "bg-warning/20 text-warning",
      declined: "bg-destructive/20 text-destructive",
      tentative: "bg-muted text-muted-foreground",
    };
    return <span className={`text-xs px-2 py-0.5 rounded-full ${styles[status] || styles.pending}`}>{status}</span>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {!event ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <DialogHeader className="flex flex-row items-start justify-between">
              <div className="flex items-center gap-3">
                {event.color && <div className={`w-4 h-4 rounded-full ${event.color}`} />}
                <DialogTitle className="text-xl">
                  {editing ? (
                    <Input value={title} onChange={e => setTitle(e.target.value)} className="text-lg font-semibold" />
                  ) : event.title}
                </DialogTitle>
              </div>
            </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Time */}
          <div className="space-y-3">
            {editing && (
              <div className="flex items-center gap-2 mb-2">
                <Checkbox id="allDay" checked={isAllDay} onCheckedChange={(c) => setIsAllDay(c as boolean)} />
                <Label htmlFor="allDay" className="text-sm font-normal cursor-pointer">All day event</Label>
              </div>
            )}
            
            <div className="flex items-start gap-3 text-sm">
              <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="flex-1">
                {editing ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Start</Label>
                      <Input
                        type={isAllDay ? "date" : "datetime-local"}
                        value={isAllDay ? startTime.split('T')[0] : startTime}
                        onChange={e => setStartTime(isAllDay ? e.target.value + 'T00:00' : e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">End</Label>
                      <Input
                        type={isAllDay ? "date" : "datetime-local"}
                        value={isAllDay ? endTime.split('T')[0] : endTime}
                        onChange={e => setEndTime(isAllDay ? e.target.value + 'T23:59' : e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <p>{isValidDate(startDate) ? format(startDate, 'EEEE, MMMM d, yyyy') : 'No Date'}</p>
                    <p className="text-muted-foreground">
                      {event.is_all_day 
                        ? 'All day' 
                        : (isValidDate(startDate) && isValidDate(endDate)
                            ? `${format(startDate, 'h:mm a')} – ${format(endDate, 'h:mm a')}`
                            : 'No Time')
                      }
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Location */}
          {(editing || event.location) && (
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
              {editing ? (
                <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="Location" />
              ) : (
                <p>{event.location}</p>
              )}
            </div>
          )}

          {/* Description */}
          {(editing || event.description) && (
            <div className="text-sm">
              {editing ? (
                <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" rows={3} />
              ) : (
                <p className="text-muted-foreground">{event.description}</p>
              )}
            </div>
          )}

          {/* Attendees */}
          {attendees && attendees.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>Attendees ({attendees.length})</span>
              </div>
              <div className="space-y-1.5 ml-6">
                {attendees.map((a: EventAttendee) => (
                  <div key={a.id} className="flex items-center justify-between text-sm">
                    <span>{a.name || a.email}{a.is_organizer && <span className="text-xs text-muted-foreground ml-1">(organizer)</span>}</span>
                    {statusBadge(a.status)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Provider badge */}
          {event.external_provider && event.external_provider !== 'internal' && (
            <div className="text-xs text-muted-foreground">
              Synced from {event.external_provider}
            </div>
          )}
        </div>

        {/* Actions */}
        {isOwner && (
          <div className="flex gap-2 pt-4 border-t">
            {editing ? (
              <>
                <Button className="bg-success hover:bg-success/90 text-success-foreground" onClick={handleSave} disabled={updateEvent.isPending}>
                  <Check className="h-4 w-4 mr-1" /> Save
                </Button>
                <Button variant="ghost" onClick={() => setEditing(false)}>
                  <X className="h-4 w-4 mr-1" /> Cancel
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={startEditing}>
                  <Pencil className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button variant="outline" className="text-destructive hover:bg-destructive/10" onClick={handleDelete} disabled={deleteEvent.isPending}>
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              </>
            )}
          </div>
        )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
