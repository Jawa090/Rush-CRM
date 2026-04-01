import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock, User, MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { leadsApi } from "@/lib/api";
import { format, isSameDay, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";

interface CalendarEvent {
  id: string;
  title: string;
  leadName: string;
  type: "call" | "meeting" | "demo" | "follow-up";
  time: string;
  duration: string;
  location?: string;
  date: string;
}

export function LeadsCalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const navigate = useNavigate();

  // Fetch real leads data
  const { data: leadsResponse, isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: () => leadsApi.getAll({ limit: 100 }),
  });

  const leads = leadsResponse?.data || [];

  // Convert leads to calendar events based on follow_up_date or created_at
  const getEventsFromLeads = (): CalendarEvent[] => {
    return leads.map(lead => ({
      id: lead.id.toString(),
      title: `Follow up: ${lead.title || lead.first_name + ' ' + lead.last_name}`,
      leadName: `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Unknown Lead',
      type: lead.status === 'new' ? 'call' : 
            lead.status === 'qualified' ? 'demo' :
            lead.status === 'proposal' ? 'meeting' : 'follow-up',
      time: '09:00', // Default time, could be enhanced with actual time data
      duration: '30 min',
      location: lead.source === 'website' ? 'Phone Call' : 'Meeting',
      date: lead.follow_up_date || lead.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]
    }));
  };

  const events = getEventsFromLeads();

  // Group events by date
  const eventsByDate: Record<string, CalendarEvent[]> = {};
  events.forEach(event => {
    if (!eventsByDate[event.date]) {
      eventsByDate[event.date] = [];
    }
    eventsByDate[event.date].push(event);
  });

  const eventTypeColors = {
    call: "bg-chart-1 border-chart-1",
    meeting: "bg-chart-2 border-chart-2",
    demo: "bg-chart-3 border-chart-3",
    "follow-up": "bg-chart-4 border-chart-4",
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];
    
    // Previous month days
    for (let i = 0; i < startingDay; i++) {
      const prevDate = new Date(year, month, -startingDay + i + 1);
      days.push({ date: prevDate, isCurrentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    return days;
  };

  const formatDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const selectedDateKey = formatDateKey(selectedDate);
  const selectedEvents = eventsByDate[selectedDateKey] || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </CardTitle>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/crm/leads/create')}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Lead
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map(({ date, isCurrentMonth }, index) => {
                const dateKey = formatDateKey(date);
                const dayEvents = eventsByDate[dateKey] || [];
                const isSelected = dateKey === selectedDateKey;
                const isToday = dateKey === formatDateKey(new Date());

                return (
                  <div
                    key={index}
                    className={`
                      min-h-24 p-2 border rounded-lg cursor-pointer transition-colors
                      ${isCurrentMonth ? 'bg-card' : 'bg-muted/30'}
                      ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border'}
                      hover:border-primary/50
                    `}
                    onClick={() => setSelectedDate(date)}
                  >
                    <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary' : isCurrentMonth ? '' : 'text-muted-foreground'}`}>
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className={`text-xs px-1.5 py-0.5 rounded truncate text-white cursor-pointer hover:opacity-80 ${eventTypeColors[event.type]}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/crm/leads/${event.id}`);
                          }}
                        >
                          {event.time} {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-muted-foreground px-1">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Day Events */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedEvents.length > 0 ? (
              selectedEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/crm/leads/${event.id}`)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full ${eventTypeColors[event.type]}`} />
                    <span className="font-medium text-sm">{event.title}</span>
                    <Badge variant="outline" className="ml-auto text-xs">
                      {event.type}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3" />
                      {event.leadName}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      {event.time} • {event.duration}
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No events scheduled
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Legend</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(eventTypeColors).map(([type, color]) => (
              <div key={type} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${color}`} />
                <span className="text-sm capitalize">{type}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
