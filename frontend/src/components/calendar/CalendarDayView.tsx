import { type CalendarEvent } from "@/hooks/useCalendarEvents";
import { format } from "date-fns";

interface CalendarDayViewProps {
  selectedDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onSlotClick?: (date: Date, hour: number) => void;
}

const hours = Array.from({ length: 15 }, (_, i) => i + 6); // 6 AM to 8 PM

export function CalendarDayView({ selectedDate, events, onEventClick, onSlotClick }: CalendarDayViewProps) {
  const formatHour = (hour: number) => {
    if (hour === 12) return '12 PM';
    if (hour > 12) return `${hour - 12} PM`;
    return `${hour} AM`;
  };

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();

  const getEventsForHour = (hour: number) => {
    return events.filter(e => {
      const s = new Date(e.start_time);
      return isSameDay(s, selectedDate) && s.getHours() === hour;
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="grid grid-cols-[80px_1fr] text-sm border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
        <div className="p-4 border-r border-slate-200 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-400">
          Time
        </div>
        <div className="p-4 font-semibold text-slate-900 dark:text-white">
          {format(selectedDate, 'EEEE, MMMM d, yyyy')}
        </div>
      </div>

      {/* Time slots */}
      <div className="divide-y divide-slate-200 dark:divide-slate-700">
        {hours.map((hour) => {
          const hourEvents = getEventsForHour(hour);
          return (
            <div key={hour} className="grid grid-cols-[80px_1fr] min-h-[70px] hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
              <div className="text-xs text-slate-500 dark:text-slate-400 p-4 border-r border-slate-200 dark:border-slate-700 flex items-start font-medium">
                {formatHour(hour)}
              </div>
              <div
                className="p-2 cursor-pointer"
                onClick={() => onSlotClick?.(selectedDate, hour)}
              >
                <div className="space-y-1">
                  {hourEvents.map(ev => (
                    <div
                      key={ev.id}
                      onClick={(e) => { e.stopPropagation(); onEventClick(ev); }}
                      className={`text-xs px-3 py-2 rounded-lg text-white cursor-pointer hover:opacity-90 transition-all shadow-sm ${ev.color || 'bg-blue-500'}`}
                    >
                      <div className="flex items-center gap-2 font-medium">
                        <span>{format(new Date(ev.start_time), 'h:mm a')} – {format(new Date(ev.end_time), 'h:mm a')}</span>
                        <span className="w-1 h-1 bg-white/60 rounded-full"></span>
                        <span className="truncate">{ev.title}</span>
                      </div>
                      {ev.location && (
                        <div className="mt-1 text-[10px] opacity-90 truncate">
                          📍 {ev.location}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
