import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, MapPin, Clock, Users } from "lucide-react";
import { useCalendarEvents, type CreateEventInput } from "@/hooks/useCalendarEvents";

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: Date;
  defaultHour?: number;
}

const eventColors = [
  { value: "bg-sky-500", label: "Blue" },
  { value: "bg-emerald-500", label: "Green" },
  { value: "bg-amber-500", label: "Yellow" },
  { value: "bg-rose-500", label: "Red" },
  { value: "bg-violet-500", label: "Purple" },
  { value: "bg-orange-500", label: "Orange" },
];

export function CreateEventDialog({ open, onOpenChange, defaultDate, defaultHour }: CreateEventDialogProps) {
  const { createEvent } = useCalendarEvents();

  const getDefaultStart = () => {
    const d = defaultDate ? new Date(defaultDate) : new Date();
    const hour = defaultHour ?? d.getHours() + 1;
    d.setHours(hour, 0, 0, 0);
    return d;
  };

  const getDefaultEnd = () => {
    const d = getDefaultStart();
    d.setHours(d.getHours() + 1);
    return d;
  };

  const formatDateTimeLocal = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startTime, setStartTime] = useState(formatDateTimeLocal(getDefaultStart()));
  const [endTime, setEndTime] = useState(formatDateTimeLocal(getDefaultEnd()));
  const [isAllDay, setIsAllDay] = useState(false);
  const [color, setColor] = useState("bg-sky-500");
  const [attendeeEmail, setAttendeeEmail] = useState("");
  const [attendees, setAttendees] = useState<{ email: string; name?: string }[]>([]);

  const handleAddAttendee = () => {
    if (attendeeEmail && !attendees.some(a => a.email === attendeeEmail)) {
      setAttendees([...attendees, { email: attendeeEmail }]);
      setAttendeeEmail("");
    }
  };

  const handleRemoveAttendee = (email: string) => {
    setAttendees(attendees.filter(a => a.email !== email));
  };

  const handleSubmit = () => {
    if (!title.trim()) return;

    const input: CreateEventInput = {
      title: title.trim(),
      description: description || undefined,
      location: location || undefined,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      allDay: isAllDay,
      color,
    };

    createEvent.mutate(input, {
      onSuccess: () => {
        resetForm();
        onOpenChange(false);
      },
    });
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setLocation("");
    setStartTime(formatDateTimeLocal(getDefaultStart()));
    setEndTime(formatDateTimeLocal(getDefaultEnd()));
    setIsAllDay(false);
    setColor("bg-sky-500");
    setAttendeeEmail("");
    setAttendees([]);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">New Event</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Title */}
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Event title" />
          </div>

          {/* All Day */}
          <div className="flex items-center gap-2">
            <Checkbox id="allDay" checked={isAllDay} onCheckedChange={(c) => setIsAllDay(c as boolean)} />
            <Label htmlFor="allDay" className="text-sm font-normal cursor-pointer">All day event</Label>
          </div>

          {/* Date/Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Start</Label>
              <Input
                type={isAllDay ? "date" : "datetime-local"}
                value={isAllDay ? startTime.split('T')[0] : startTime}
                onChange={e => setStartTime(isAllDay ? e.target.value + 'T00:00' : e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> End</Label>
              <Input
                type={isAllDay ? "date" : "datetime-local"}
                value={isAllDay ? endTime.split('T')[0] : endTime}
                onChange={e => setEndTime(isAllDay ? e.target.value + 'T23:59' : e.target.value)}
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Location</Label>
            <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="Add location" />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Add description" rows={3} />
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2">
              {eventColors.map(c => (
                <button
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  className={`w-7 h-7 rounded-full ${c.value} transition-all ${color === c.value ? 'ring-2 ring-offset-2 ring-primary' : 'opacity-60 hover:opacity-100'}`}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Attendees */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> Invite People</Label>
            <div className="flex gap-2">
              <Input
                value={attendeeEmail}
                onChange={e => setAttendeeEmail(e.target.value)}
                placeholder="Enter email address"
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddAttendee(); } }}
              />
              <Button type="button" variant="outline" size="icon" onClick={handleAddAttendee}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {attendees.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {attendees.map(a => (
                  <div key={a.email} className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full text-xs">
                    <span>{a.email}</span>
                    <button onClick={() => handleRemoveAttendee(a.email)} className="hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            className="bg-success hover:bg-success/90 text-success-foreground"
            onClick={handleSubmit}
            disabled={!title.trim() || createEvent.isPending}
          >
            {createEvent.isPending ? 'Creating...' : 'Create Event'}
          </Button>
          <Button variant="ghost" onClick={() => { resetForm(); onOpenChange(false); }}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
