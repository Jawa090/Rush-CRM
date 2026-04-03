import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Users, Clock } from "lucide-react";
import { api } from "@/lib/api";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isWithinInterval, parseISO, startOfWeek, endOfWeek } from "date-fns";

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function LeaveCalendarTab() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  // Get calendar range (including days from prev/next month to fill grid)
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Fetch calendar data
  const { data: calendarResp, isLoading } = useQuery({
    queryKey: ["leave-calendar", format(monthStart, "yyyy-MM-dd"), format(monthEnd, "yyyy-MM-dd")],
    queryFn: () => api.get("/leave/calendar/view", {
      params: {
        startDate: format(monthStart, "yyyy-MM-dd"),
        endDate: format(monthEnd, "yyyy-MM-dd"),
      },
    }),
  });

  const leaves = (calendarResp as any)?.data || [];

  const getLeavesForDay = (day: Date) => {
    return leaves.filter((leave: any) => {
      const start = parseISO(leave.start_date);
      const end = parseISO(leave.end_date);
      return isWithinInterval(day, { start, end });
    });
  };

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDay(new Date());
  };

  const selectedDayLeaves = selectedDay ? getLeavesForDay(selectedDay) : [];
  const totalLeavesToday = leaves.filter((leave: any) => {
    const start = parseISO(leave.start_date);
    const end = parseISO(leave.end_date);
    const today = new Date();
    return isWithinInterval(today, { start, end });
  }).length;

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">
                  {format(currentDate, "MMMM yyyy")}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">Team Leave Calendar</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleToday}>
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Today
                </Button>
                <div className="flex items-center border rounded-lg">
                  <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handlePrevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="w-px h-6 bg-gray-200" />
                  <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleNextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">On Leave Today</p>
                <p className="text-2xl font-bold">{totalLeavesToday}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3 animate-spin" />
                <p className="text-gray-500">Loading calendar...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="text-center font-semibold text-sm text-gray-700 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((day) => {
                    const dayLeaves = getLeavesForDay(day);
                    const isToday = isSameDay(day, new Date());
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isSelected = selectedDay && isSameDay(day, selectedDay);

                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => setSelectedDay(day)}
                        className={`
                          min-h-[100px] border rounded-lg p-2 text-left transition-all duration-200
                          ${isSelected ? "ring-2 ring-blue-500 border-blue-500 bg-blue-50" : "border-gray-200"}
                          ${isToday && !isSelected ? "border-blue-400 bg-blue-50/50" : ""}
                          ${!isCurrentMonth ? "opacity-40 bg-gray-50" : "bg-white hover:bg-gray-50 hover:border-gray-300"}
                          ${dayLeaves.length > 0 ? "hover:shadow-md" : ""}
                        `}
                      >
                        <div className="h-full flex flex-col">
                          <div className={`
                            text-sm font-semibold mb-1.5 flex items-center justify-between
                            ${isToday ? "text-blue-600" : isCurrentMonth ? "text-gray-900" : "text-gray-500"}
                          `}>
                            <span>{format(day, "d")}</span>
                            {dayLeaves.length > 0 && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">
                                {dayLeaves.length}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex-1 space-y-1 overflow-hidden">
                            {dayLeaves.slice(0, 2).map((leave: any) => (
                              <div
                                key={leave.id}
                                className="text-xs px-2 py-1 rounded font-medium truncate shadow-sm"
                                style={{ 
                                  backgroundColor: leave.leave_type_color,
                                  color: "white"
                                }}
                                title={`${leave.employee_name} - ${leave.leave_type_name}`}
                              >
                                {leave.employee_name.split(" ")[0]}
                              </div>
                            ))}
                            {dayLeaves.length > 2 && (
                              <div className="text-xs text-gray-600 px-2 py-1 bg-gray-100 rounded font-medium">
                                +{dayLeaves.length - 2} more
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected Day Details */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              {selectedDay ? format(selectedDay, "EEEE, MMMM d") : "Select a day"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedDay ? (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Click on a day to view leave details</p>
              </div>
            ) : selectedDayLeaves.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No leaves on this day</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <Users className="h-4 w-4" />
                  <span>{selectedDayLeaves.length} employee{selectedDayLeaves.length > 1 ? "s" : ""} on leave</span>
                </div>
                
                {selectedDayLeaves.map((leave: any) => (
                  <div
                    key={leave.id}
                    className="p-3 border rounded-lg hover:shadow-md transition-shadow bg-white"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarFallback 
                          className="text-white font-semibold text-sm"
                          style={{ backgroundColor: leave.leave_type_color }}
                        >
                          {getInitials(leave.employee_name)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm mb-1">{leave.employee_name}</p>
                        <Badge 
                          variant="outline" 
                          className="text-xs mb-2"
                          style={{ 
                            borderColor: leave.leave_type_color,
                            color: leave.leave_type_color 
                          }}
                        >
                          {leave.leave_type_name}
                        </Badge>
                        
                        <div className="text-xs text-gray-600 space-y-1">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" />
                            <span>
                              {format(parseISO(leave.start_date), "MMM d")} - {format(parseISO(leave.end_date), "MMM d")}
                            </span>
                          </div>
                          <div>
                            {leave.days_requested} day{leave.days_requested > 1 ? "s" : ""}
                            {leave.half_day && " (Half Day)"}
                          </div>
                          {leave.department && (
                            <div className="text-gray-500">{leave.department}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Leave Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Summary - {format(currentDate, "MMMM yyyy")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-gray-500 py-8">Loading...</p>
          ) : leaves.length === 0 ? (
            <div className="text-center py-8">
              <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No approved leaves for this month</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {leaves.map((leave: any) => (
                <div
                  key={leave.id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:shadow-md transition-all bg-white"
                >
                  <div
                    className="w-1 h-16 rounded-full shrink-0"
                    style={{ backgroundColor: leave.leave_type_color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback 
                          className="text-white text-xs font-semibold"
                          style={{ backgroundColor: leave.leave_type_color }}
                        >
                          {getInitials(leave.employee_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-semibold text-sm truncate">{leave.employee_name}</span>
                    </div>
                    <Badge 
                      variant="outline" 
                      className="text-xs mb-1"
                      style={{ 
                        borderColor: leave.leave_type_color,
                        color: leave.leave_type_color 
                      }}
                    >
                      {leave.leave_type_name}
                    </Badge>
                    <div className="text-xs text-gray-600">
                      {format(parseISO(leave.start_date), "MMM d")} - {format(parseISO(leave.end_date), "MMM d")}
                      {" • "}
                      {leave.days_requested}d
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
