import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { differenceInDays, addDays } from "date-fns";
import { AlertCircle } from "lucide-react";

interface RequestLeaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  balances: any[];
}

export default function RequestLeaveDialog({ open, onOpenChange, balances }: RequestLeaveDialogProps) {
  const qc = useQueryClient();
  const [formData, setFormData] = useState({
    leave_type_id: "",
    start_date: "",
    end_date: "",
    reason: "",
    half_day: false,
    emergency: false,
    contact_during_leave: "",
  });

  const selectedBalance = balances.find((b) => b.leave_type_id === formData.leave_type_id);
  const daysRequested =
    formData.start_date && formData.end_date
      ? differenceInDays(new Date(formData.end_date), new Date(formData.start_date)) + 1
      : 0;

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post("/leave", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-leave-requests"] });
      qc.invalidateQueries({ queryKey: ["my-leave-balances"] });
      qc.invalidateQueries({ queryKey: ["team-leave-requests"] });
      qc.invalidateQueries({ queryKey: ["leave-calendar"] });
      qc.invalidateQueries({ queryKey: ["leave-analytics"] });
      toast.success("Leave request submitted successfully");
      onOpenChange(false);
      setFormData({
        leave_type_id: "",
        start_date: "",
        end_date: "",
        reason: "",
        half_day: false,
        emergency: false,
        contact_during_leave: "",
      });
    },
    onError: (error: any) => {
      toast.error("Failed to submit leave request", {
        description: error?.message || "Please try again",
      });
    },
  });

  const handleSubmit = () => {
    if (!formData.leave_type_id || !formData.start_date || !formData.end_date || !formData.reason) {
      toast.error("Please fill all required fields");
      return;
    }

    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      toast.error("End date must be after start date");
      return;
    }

    if (selectedBalance && daysRequested > selectedBalance.available) {
      toast.error(`Insufficient leave balance. Available: ${selectedBalance.available} days`);
      return;
    }

    createMutation.mutate({
      ...formData,
      days_requested: formData.half_day ? 0.5 : daysRequested,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Request Leave</DialogTitle>
          <DialogDescription>Submit a new leave request for approval</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Leave Type */}
          <div className="space-y-2">
            <Label>Leave Type *</Label>
            <Select value={formData.leave_type_id} onValueChange={(v) => setFormData({ ...formData, leave_type_id: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent>
                {balances.map((balance) => (
                  <SelectItem key={balance.leave_type_id} value={balance.leave_type_id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{balance.leave_type_name}</span>
                      <span className="text-xs text-gray-500 ml-4">
                        {balance.available} / {balance.total_allocated} days
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedBalance && (
              <p className="text-xs text-gray-600">
                Available: {selectedBalance.available} days | Used: {selectedBalance.used} days | Pending:{" "}
                {selectedBalance.pending} days
              </p>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date *</Label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                min={formData.start_date || new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          {/* Duration Display */}
          {formData.start_date && formData.end_date && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900">
                <strong>Duration:</strong> {daysRequested} day{daysRequested > 1 ? "s" : ""}
                {selectedBalance && daysRequested > selectedBalance.available && (
                  <span className="text-red-600 ml-2">
                    <AlertCircle className="h-3.5 w-3.5 inline mr-1" />
                    Exceeds available balance
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Options */}
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="half-day"
                checked={formData.half_day}
                onCheckedChange={(checked) => setFormData({ ...formData, half_day: checked as boolean })}
              />
              <label htmlFor="half-day" className="text-sm font-medium cursor-pointer">
                Half Day
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="emergency"
                checked={formData.emergency}
                onCheckedChange={(checked) => setFormData({ ...formData, emergency: checked as boolean })}
              />
              <label htmlFor="emergency" className="text-sm font-medium cursor-pointer">
                Emergency Leave
              </label>
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label>Reason *</Label>
            <Textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Please provide a reason for your leave..."
              rows={3}
            />
          </div>

          {/* Contact */}
          <div className="space-y-2">
            <Label>Contact During Leave (Optional)</Label>
            <Input
              value={formData.contact_during_leave}
              onChange={(e) => setFormData({ ...formData, contact_during_leave: e.target.value })}
              placeholder="Phone number or email"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createMutation.isPending}>
            {createMutation.isPending ? "Submitting..." : "Submit Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
