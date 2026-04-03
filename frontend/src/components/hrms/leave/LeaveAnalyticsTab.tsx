import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { BarChart3, TrendingUp, Users, Calendar, XCircle } from "lucide-react";

export default function LeaveAnalyticsTab() {
  const { data: analyticsResp, isLoading } = useQuery({
    queryKey: ["leave-analytics"],
    queryFn: () => api.get("/leave/analytics/stats"),
  });

  const analytics = (analyticsResp as any)?.data || {};
  const stats = analytics.stats || {};
  const byType = analytics.byType || [];
  const byMonth = analytics.byMonth || [];
  const topEmployees = analytics.topEmployees || [];

  const maxDays = Math.max(...byType.map((t: any) => parseFloat(t.days_taken) || 0), 1);

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold">{stats.total_requests || 0}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending || 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved || 0}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected || 0}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Days Taken</p>
                <p className="text-2xl font-bold">{parseFloat(stats.total_days_taken || 0).toFixed(1)}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Leave Type */}
        <Card>
          <CardHeader>
            <CardTitle>Leave Usage by Type</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center text-gray-500 py-8">Loading...</p>
            ) : byType.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No data available</p>
            ) : (
              <div className="space-y-4">
                {byType.map((type: any) => {
                  const daysTaken = parseFloat(type.days_taken) || 0;
                  const percentage = (daysTaken / maxDays) * 100;
                  
                  return (
                    <div key={type.name} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{type.name}</span>
                        <span className="text-gray-600">
                          {daysTaken.toFixed(1)} days ({type.request_count || 0} requests)
                        </span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-300"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: type.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* By Month */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center text-gray-500 py-8">Loading...</p>
            ) : byMonth.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No data available</p>
            ) : (
              <div className="space-y-3">
                {byMonth.map((month: any) => {
                  const daysTaken = parseFloat(month.days_taken) || 0;
                  
                  return (
                    <div key={month.month} className="flex items-center gap-3">
                      <div className="w-12 text-sm font-medium text-gray-600">{month.month}</div>
                      <div className="flex-1">
                        <div className="h-8 bg-gray-100 rounded overflow-hidden">
                          <div
                            className="h-full bg-blue-500 flex items-center px-2 text-white text-xs font-medium transition-all duration-300"
                            style={{ width: `${Math.min((daysTaken / 50) * 100, 100)}%` }}
                          >
                            {daysTaken > 0 && `${daysTaken.toFixed(1)}d`}
                          </div>
                        </div>
                      </div>
                      <div className="w-16 text-right text-xs text-gray-600">
                        {month.request_count || 0} req
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Employees */}
      <Card>
        <CardHeader>
          <CardTitle>Top Employees by Leave Taken</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-gray-500 py-8">Loading...</p>
          ) : topEmployees.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No data available</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Employee</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Department</th>
                    <th className="text-center py-3 px-4 font-semibold text-sm text-gray-700">Requests</th>
                    <th className="text-right py-3 px-4 font-semibold text-sm text-gray-700">Days Taken</th>
                  </tr>
                </thead>
                <tbody>
                  {topEmployees.map((emp: any, idx: number) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm">{emp.employee_name}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{emp.department || "N/A"}</td>
                      <td className="py-3 px-4 text-sm text-center">{emp.request_count || 0}</td>
                      <td className="py-3 px-4 text-sm text-right font-semibold">
                        {parseFloat(emp.days_taken || 0).toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
