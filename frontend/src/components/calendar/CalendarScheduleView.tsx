import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type CalendarEvent } from "@/hooks/useCalendarEvents";
import { format, isToday, isTomorrow, isThisWeek } from "date-fns";

interface CalendarScheduleViewProps {
  onConnectClick: () => void;
  hasConnectedCalendar: boolean;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

const calendarIcons = [
  { name: "Google Calendar", icon: "📅", color: "text-red-500" },
  { name: "iCloud Calendar", icon: "🍎", color: "text-foreground" },
  { name: "Office365 Calendar", icon: "📆", color: "text-red-500" },
];

export function CalendarScheduleView({ onConnectClick, hasConnectedCalendar, events, onEventClick }: CalendarScheduleViewProps) {
  // Show event list if we have events
  if (events.length > 0) {
    // Group events by date
    const grouped: Record<string, CalendarEvent[]> = {};
    for (const ev of events) {
      const dateKey = format(new Date(ev.start_time), 'yyyy-MM-dd');
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(ev);
    }

    const sortedDates = Object.keys(grouped).sort();

    const getDateLabel = (dateStr: string) => {
      const d = new Date(dateStr + 'T00:00:00');
      if (isToday(d)) return 'Today';
      if (isTomorrow(d)) return 'Tomorrow';
      return format(d, 'EEEE, MMMM d, yyyy');
    };

    return (
      <div className="bg-white dark:bg-slate-900">
        <div className="max-h-[600px] overflow-y-auto">
          {sortedDates.map(dateStr => (
            <div key={dateStr} className="border-b border-slate-200 dark:border-slate-700 last:border-b-0">
              <div className="px-6 py-3 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  {getDateLabel(dateStr)}
                </h3>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {grouped[dateStr].map(ev => (
                  <div
                    key={ev.id}
                    onClick={() => onEventClick(ev)}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer transition-all duration-200"
                  >
                    <div className={`w-4 h-4 rounded-full flex-shrink-0 shadow-sm ${ev.color || 'bg-blue-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate mb-1">
                        {ev.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <span className="font-medium">
                          {ev.is_all_day ? 'All day' : `${format(new Date(ev.start_time), 'h:mm a')} – ${format(new Date(ev.end_time), 'h:mm a')}`}
                        </span>
                        {ev.location && (
                          <>
                            <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                            <span className="truncate">📍 {ev.location}</span>
                          </>
                        )}
                      </div>
                      {ev.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 truncate">
                          {ev.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (hasConnectedCalendar) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 bg-white dark:bg-slate-900">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center mb-6 shadow-lg">
          <CalendarDays className="h-10 w-10 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          Your calendar is synchronized
        </h3>
        <p className="text-slate-600 dark:text-slate-400 text-center mb-8 max-w-md">
          No upcoming events found. Create a new event to get started with your schedule.
        </p>
        <Button 
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/25"
          onClick={() => {/* Handle create event */}}
        >
          Create New Event
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 bg-white dark:bg-slate-900">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center mb-6 shadow-lg">
        <CalendarDays className="h-10 w-10 text-slate-600 dark:text-slate-400" />
      </div>
      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
        Connect your calendars
      </h3>
      <p className="text-slate-600 dark:text-slate-400 text-center mb-8 max-w-md">
        Sync with your existing calendars to keep all events in one place and never miss an important meeting.
      </p>
      
      <div className="flex items-center gap-8 mb-8">
        {calendarIcons.map((cal) => (
          <div key={cal.name} className="flex flex-col items-center gap-2 text-center">
            <div className="w-12 h-12 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm">
              <span className="text-2xl">{cal.icon}</span>
            </div>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              {cal.name.split(' ')[0]}
            </span>
          </div>
        ))}
      </div>
      
      <Button 
        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/25 px-8"
        onClick={onConnectClick}
      >
        Connect Calendar
      </Button>
    </div>
  );
}
