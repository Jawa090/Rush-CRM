import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, X, Clock, UserPlus, Loader2 } from "lucide-react";
import { useOrgJoinRequests, useApproveJoinRequest, useRejectJoinRequest, type JoinRequest } from "@/hooks/useJoinRequests";
import { format } from "date-fns";

export default function JoinRequestsPage() {
  const { data: requests = [], isLoading } = useOrgJoinRequests();
  const approveRequest = useApproveJoinRequest();
  const rejectRequest = useRejectJoinRequest();

  const [selectedRequest, setSelectedRequest] = useState<JoinRequest | null>(null);
  const [approveRole, setApproveRole] = useState("employee");
  const [rejectReason, setRejectReason] = useState("");
  const [showApprove, setShowApprove] = useState(false);
  const [showReject, setShowReject] = useState(false);

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const processedRequests = requests.filter((r) => r.status !== "pending");

  const handleApprove = () => {
    if (!selectedRequest) return;
    approveRequest.mutate(
      { requestId: selectedRequest.id, role: approveRole },
      { onSuccess: () => { setShowApprove(false); setSelectedRequest(null); } }
    );
  };

  const handleReject = () => {
    if (!selectedRequest) return;
    rejectRequest.mutate(
      { requestId: selectedRequest.id, reason: rejectReason },
      { onSuccess: () => { setShowReject(false); setSelectedRequest(null); setRejectReason(""); } }
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge variant="outline" className="bg-yellow-500/20 text-yellow-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "approved": return <Badge variant="outline" className="bg-green-500/20 text-green-600"><Check className="h-3 w-3 mr-1" />Approved</Badge>;
      case "rejected": return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Rejected</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Join Requests</h1>
          <p className="text-muted-foreground">Review and manage organization join requests</p>
        </div>
        {pendingRequests.length > 0 && (
          <Badge className="bg-yellow-500 text-white">{pendingRequests.length} pending</Badge>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : pendingRequests.length === 0 && processedRequests.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Join Requests</h3>
            <p className="text-muted-foreground">When users request to join your organization, they'll appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Pending */}
          {pendingRequests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pending Requests</CardTitle>
                <CardDescription>These users are waiting for approval to join your organization.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Requested Role</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingRequests.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell className="font-medium">{req.full_name}</TableCell>
                        <TableCell className="text-muted-foreground">{req.email}</TableCell>
                        <TableCell><Badge variant="outline">{req.requested_role}</Badge></TableCell>
                        <TableCell className="max-w-[200px] truncate text-muted-foreground">{req.message || "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{format(new Date(req.created_at), "MMM d, yyyy")}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => { setSelectedRequest(req); setApproveRole(req.requested_role || "employee"); setShowApprove(true); }}
                            >
                              <Check className="h-4 w-4 mr-1" />Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => { setSelectedRequest(req); setShowReject(true); }}
                            >
                              <X className="h-4 w-4 mr-1" />Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Processed */}
          {processedRequests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Processed Requests</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Processed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processedRequests.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell className="font-medium">{req.full_name}</TableCell>
                        <TableCell className="text-muted-foreground">{req.email}</TableCell>
                        <TableCell>{getStatusBadge(req.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {req.reviewed_at ? format(new Date(req.reviewed_at), "MMM d, yyyy") : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Approve Dialog */}
      <Dialog open={showApprove} onOpenChange={setShowApprove}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Join Request</DialogTitle>
            <DialogDescription>
              Approve {selectedRequest?.full_name} ({selectedRequest?.email}) to join the organization.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={approveRole} onValueChange={setApproveRole}>
              <SelectTrigger><SelectValue placeholder="Assign role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="sales_rep">Sales Rep</SelectItem>
                <SelectItem value="hr_manager">HR Manager</SelectItem>
                <SelectItem value="inventory_manager">Inventory Manager</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprove(false)}>Cancel</Button>
            <Button onClick={handleApprove} disabled={approveRequest.isPending}>
              {approveRequest.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showReject} onOpenChange={setShowReject}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Join Request</DialogTitle>
            <DialogDescription>
              Reject {selectedRequest?.full_name}'s request to join.
            </DialogDescription>
          </DialogHeader>
          <Textarea placeholder="Reason for rejection (optional)" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReject(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={rejectRequest.isPending}>
              {rejectRequest.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
