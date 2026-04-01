import { type CalendarEvent } from "@/hooks/useCalendarEvents";
import { format } from "date-fns";

interface CalendarWeekViewProps {
  selectedDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onSlotClick?: (date: Date, hour: number) => void;
}

const hours = Array.from({ length: 13 }, (_, i) => i + 7); // 7 AM to 7 PM

export function CalendarWeekView({ selectedDate, events, onEventClick, onSlotClick }: CalendarWeekViewProps) {
  const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });
  };

  const weekDays = getWeekDays(selectedDate);
  const today = new Date();
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();

  const formatHour = (hour: number) => {
    if (hour === 12) return '12 PM';
    if (hour > 12) return `${hour - 12} PM`;
    return `${hour} AM`;
  };

  const getEventsForDayHour = (date: Date, hour: number) => {
    return events.filter(e => {
      const s = new Date(e.start_time);
      return isSameDay(s, date) && s.getHours() === hour;
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900">
      {/* Header with days */}
      <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
        <div className="p-3 border-r border-slate-200 dark:border-slate-700" />
        {weekDays.map((date, idx) => {
          const isToday = isSameDay(date, today);
          return (
            <div key={idx} className={`p-3 text-center border-r border-slate-200 dark:border-slate-700 last:border-r-0 transition-colors ${isToday ? 'bg-blue-50 dark:bg-blue-950/30' : ''}`}>
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                {dayNames[idx]}
              </div>
              <div className={`text-lg font-semibold transition-all ${isToday ? 'w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30' : 'text-slate-900 dark:text-white'}`}>
                {date.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time slots */}
      <div className="divide-y divide-slate-200 dark:divide-slate-700">
        {hours.map((hour) => (
          <div key={hour} className="grid grid-cols-[80px_repeat(7,1fr)] min-h-[60px] hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
            <div className="text-xs text-slate-500 dark:text-slate-400 p-3 border-r border-slate-200 dark:border-slate-700 flex items-start font-medium">
              {formatHour(hour)}
            </div>
            {weekDays.map((date, idx) => {
              const isToday = isSameDay(date, today);
              const slotEvents = getEventsForDayHour(date, hour);
              return (
                <div
                  key={idx}
                  onClick={() => onSlotClick?.(date, hour)}
                  className={`border-r border-slate-200 dark:border-slate-700 last:border-r-0 hover:bg-slate-100 dark:hover:bg-slate-700/30 cursor-pointer transition-colors p-1 ${isToday ? 'bg-blue-50/50 dark:bg-blue-950/10' : ''}`}
                >
                  <div className="space-y-1">
                    {slotEvents.map(ev => (
                      <div
                        key={ev.id}
                        onClick={(e) => { e.stopPropagation(); onEventClick(ev); }}
                        className={`text-[10px] leading-tight px-2 py-1 rounded-md text-white truncate cursor-pointer hover:opacity-90 transition-opacity shadow-sm ${ev.color || 'bg-blue-500'}`}
                        title={`${format(new Date(ev.start_time), 'h:mm a')} - ${ev.title}`}
                      >
                        <div className="font-medium">{format(new Date(ev.start_time), 'h:mm a')}</div>
                        <div className="truncate">{ev.title}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
