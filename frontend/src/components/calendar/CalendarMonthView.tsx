import { type CalendarEvent } from "@/hooks/useCalendarEvents";

interface CalendarMonthViewProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onSlotClick?: (date: Date) => void;
}

export function CalendarMonthView({ selectedDate, onDateSelect, events, onEventClick, onSlotClick }: CalendarMonthViewProps) {
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: { date: Date; isCurrentMonth: boolean }[] = [];
    for (let i = 0; i < startingDay; i++) {
      days.push({ date: new Date(year, month, -startingDay + i + 1), isCurrentMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    return days;
  };

  const days = getDaysInMonth(selectedDate);
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();

  const getEventsForDay = (date: Date) => {
    return events.filter(e => {
      const eStart = new Date(e.start_time);
      return isSameDay(eStart, date);
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900">
      {/* Header with day names */}
      <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
        {dayNames.map((day) => (
          <div key={day} className="p-4 text-center text-sm font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days.map(({ date, isCurrentMonth }, idx) => {
          const isToday = isSameDay(date, today);
          const dayEvents = getEventsForDay(date);

          return (
            <div
              key={idx}
              onClick={() => { onDateSelect(date); onSlotClick?.(date); }}
              className={`
                min-h-[100px] p-3 border-r border-b border-slate-200 dark:border-slate-700 last:border-r-0 cursor-pointer transition-all duration-200
                ${!isCurrentMonth ? 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'}
                ${isToday && isCurrentMonth ? 'bg-blue-50 dark:bg-blue-950/30' : ''}
              `}
            >
              <div className="flex items-start justify-between mb-2">
                {/* Month indicator for first week of previous/next month */}
                {idx < 7 && !isCurrentMonth && (
                  <span className="text-xs text-slate-500 dark:text-slate-500 font-medium">
                    {date.toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                )}
                
                {/* Date number */}
                <span className={`
                  text-sm font-medium transition-all duration-200
                  ${isToday ? 'w-7 h-7 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30' : ''}
                  ${!isCurrentMonth ? 'text-slate-400 dark:text-slate-600' : 'text-slate-900 dark:text-slate-100'}
                `}>
                  {date.getDate()}
                </span>
              </div>
              
              {/* Events */}
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map(ev => (
                  <div
                    key={ev.id}
                    onClick={(e) => { e.stopPropagation(); onEventClick(ev); }}
                    className={`text-xs leading-tight px-2 py-1 rounded-md text-white cursor-pointer hover:opacity-90 transition-opacity shadow-sm ${ev.color || 'bg-blue-500'}`}
                    title={ev.title}
                  >
                    <div className="truncate font-medium">{ev.title}</div>
                    {ev.location && (
                      <div className="truncate opacity-90 text-[10px]">{ev.location}</div>
                    )}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 pl-2 font-medium">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
