import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { dealsApi } from "@/lib/api";
import { format, isSameDay, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function DealsCalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const navigate = useNavigate();

  // Fetch real deals data
  const { data: dealsResponse, isLoading } = useQuery({
    queryKey: ['deals'],
    queryFn: () => dealsApi.getAll({ limit: 100 }),
  });

  const deals = dealsResponse?.data || [];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Get the day of week for the first day (0 = Sunday, 1 = Monday, etc.)
    let startDay = firstDay.getDay();
    // Adjust for Monday start (0 = Monday, 6 = Sunday)
    startDay = startDay === 0 ? 6 : startDay - 1;

    // Add empty cells for days before the first day
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    // Add all days in the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(i);
    }

    return days;
  };

  // Get deals for a specific date
  const getDealsForDate = (day: number) => {
    if (!day) return [];
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return deals.filter(deal => {
      if (!deal.expected_close_date) return false;
      const dealDate = parseISO(deal.expected_close_date);
      return isSameDay(dealDate, targetDate);
    });
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const days = getDaysInMonth(currentDate);
  const today = new Date();
  const isCurrentMonth = 
    today.getMonth() === currentDate.getMonth() && 
    today.getFullYear() === currentDate.getFullYear();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigateMonth(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigateMonth(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <span className="font-semibold text-lg">{monthName}</span>
        </div>
        <Button className="gap-2" size="sm" onClick={() => navigate('/crm/deals/create')}>
          <Plus className="h-4 w-4" />
          Add Deal
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 mb-2">
          {daysOfWeek.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-px bg-border">
          {days.map((day, index) => {
            const dayDeals = getDealsForDate(day);
            return (
              <div
                key={index}
                className={`
                  min-h-[100px] bg-card p-2
                  ${day === null ? 'bg-muted/20' : 'hover:bg-muted/30 cursor-pointer'}
                  ${isCurrentMonth && day === today.getDate() ? 'bg-primary/5' : ''}
                `}
                onClick={() => day && navigate('/crm/deals/create')}
              >
                {day && (
                  <>
                    <span 
                      className={`
                        text-sm font-medium block mb-1
                        ${isCurrentMonth && day === today.getDate() 
                          ? 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center' 
                          : ''
                        }
                      `}
                    >
                      {day}
                    </span>
                    {/* Show deals for this day */}
                    <div className="space-y-1">
                      {dayDeals.slice(0, 2).map((deal) => (
                        <div
                          key={deal.id}
                          className="text-xs p-1 bg-primary/10 text-primary rounded truncate cursor-pointer hover:bg-primary/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/crm/deals/${deal.id}`);
                          }}
                        >
                          ${(deal.value || 0).toLocaleString()} - {deal.title || deal.name}
                        </div>
                      ))}
                      {dayDeals.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{dayDeals.length - 2} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
