import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Calendar, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import RequestLeaveDialog from "./RequestLeaveDialog";

const STATUS_COLORS: Record<string, string> = {
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  cancelled: "bg-gray-50 text-gray-700 border-gray-200",
};

const STATUS_ICONS: Record<string, any> = {
  approved: CheckCircle,
  rejected: XCircle,
  pending: Clock,
  cancelled: AlertCircle,
};

export default function MyLeavesTab() {
  const [requestDialog, setRequestDialog] = useState(false);
  const qc = useQueryClient();

  // Fetch leave balances
  const { data: balancesResp } = useQuery({
    queryKey: ["my-leave-balances"],
    queryFn: () => api.get("/leave/balance/my"),
  });
  const balances = (balancesResp as any)?.data || [];

  // Fetch my leave requests
  const { data: requestsResp, isLoading } = useQuery({
    queryKey: ["my-leave-requests"],
    queryFn: () => api.get("/leave"),
  });
  const requests = (requestsResp as any)?.data || [];

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/leave/${id}`, { status: "cancelled" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-leave-requests"] });
      qc.invalidateQueries({ queryKey: ["my-leave-balances"] });
      qc.invalidateQueries({ queryKey: ["leave-calendar"] });
      qc.invalidateQueries({ queryKey: ["leave-analytics"] });
      toast.success("Leave request cancelled");
    },
    onError: () => toast.error("Failed to cancel request"),
  });

  return (
    <div className="space-y-6">
      {/* Leave Balance Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Leave Balance</h2>
          <Button onClick={() => setRequestDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Request Leave
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {balances.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">No leave balance initialized</p>
              </CardContent>
            </Card>
          ) : (
            balances.map((balance: any) => {
              const usedPercentage = (balance.used / balance.total_allocated) * 100;
              const availablePercentage = (balance.available / balance.total_allocated) * 100;

              return (
                <Card key={balance.id} className="border-l-4" style={{ borderLeftColor: balance.leave_type_color }}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">{balance.leave_type_name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-3xl font-bold">{balance.available}</span>
                      <span className="text-sm text-gray-500">/ {balance.total_allocated} days</span>
                    </div>

                    <Progress value={availablePercentage} className="h-2" />

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-gray-500">Used</p>
                        <p className="font-semibold">{balance.used}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Pending</p>
                        <p className="font-semibold">{balance.pending}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Available</p>
                        <p className="font-semibold text-green-600">{balance.available}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Leave Requests */}
      <div>
        <h2 className="text-lg font-semibold mb-4">My Leave Requests</h2>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">Loading...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="p-8 text-center">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No leave requests yet</p>
                <Button onClick={() => setRequestDialog(true)} variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Request Your First Leave
                </Button>
              </div>
            ) : (
              <div className="divide-y">
                {requests.map((request: any) => {
                  const Icon = STATUS_ICONS[request.status] || Clock;
                  const duration = differenceInDays(new Date(request.end_date), new Date(request.start_date)) + 1;

                  return (
                    <div key={request.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <div
                              className="w-1 h-12 rounded-full"
                              style={{ backgroundColor: request.leave_type_color }}
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">{request.leave_type_name}</h3>
                                <Badge variant="outline" className={cn("text-xs", STATUS_COLORS[request.status])}>
                                  <Icon className="h-3 w-3 mr-1" />
                                  {request.status}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3.5 w-3.5" />
                                  {format(new Date(request.start_date), "MMM d")} -{" "}
                                  {format(new Date(request.end_date), "MMM d, yyyy")}
                                </span>
                                <span className="font-medium">{duration} day{duration > 1 ? "s" : ""}</span>
                              </div>
                            </div>
                          </div>

                          <p className="text-sm text-gray-700 ml-4 pl-3">{request.reason}</p>

                          {request.rejection_reason && (
                            <div className="ml-4 pl-3 mt-2">
                              <p className="text-xs text-red-600 bg-red-50 p-2 rounded">
                                <strong>Rejection reason:</strong> {request.rejection_reason}
                              </p>
                            </div>
                          )}

                          {request.approver_name && (
                            <p className="text-xs text-gray-500 ml-4 pl-3 mt-2">
                              {request.status === "approved" ? "Approved" : "Reviewed"} by {request.approver_name}
                              {request.approved_at && ` on ${format(new Date(request.approved_at), "MMM d, yyyy")}`}
                            </p>
                          )}
                        </div>

                        {request.status === "pending" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => cancelMutation.mutate(request.id)}
                            disabled={cancelMutation.isPending}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Request Leave Dialog */}
      <RequestLeaveDialog
        open={requestDialog}
        onOpenChange={setRequestDialog}
        balances={balances}
      />
    </div>
  );
}
