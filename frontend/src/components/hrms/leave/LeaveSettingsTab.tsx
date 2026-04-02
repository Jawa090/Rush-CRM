import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Settings } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function LeaveSettingsTab() {
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedType, setSelectedType] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    color: "#3B82F6",
    days_allowed: "",
    is_paid: true,
    requires_approval: true,
    can_carry_forward: false,
  });
  const qc = useQueryClient();

  const { data: typesResp, isLoading } = useQuery({
    queryKey: ["leave-types"],
    queryFn: () => api.get("/leave/types"),
  });
  const leaveTypes = (typesResp as any)?.data || [];

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post("/leave/types", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leave-types"] });
      toast.success("Leave type created successfully");
      setCreateDialog(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error("Failed to create leave type", {
        description: error?.message || "Please try again",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.put(`/leave/types/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leave-types"] });
      qc.invalidateQueries({ queryKey: ["my-leave-balances"] });
      toast.success("Leave type updated successfully");
      setEditDialog(false);
      setSelectedType(null);
      resetForm();
    },
    onError: (error: any) => {
      toast.error("Failed to update leave type", {
        description: error?.message || "Please try again",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      color: "#3B82F6",
      days_allowed: "",
      is_paid: true,
      requires_approval: true,
      can_carry_forward: false,
    });
  };

  const handleEdit = (type: any) => {
    setSelectedType(type);
    setFormData({
      name: type.name,
      code: type.code,
      description: type.description || "",
      color: type.color,
      days_allowed: type.days_allowed.toString(),
      is_paid: type.is_paid,
      requires_approval: type.requires_approval,
      can_carry_forward: type.can_carry_forward,
    });
    setEditDialog(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.code || !formData.days_allowed) {
      toast.error("Please fill all required fields");
      return;
    }

    createMutation.mutate({
      ...formData,
      days_allowed: parseInt(formData.days_allowed),
    });
  };

  const handleUpdate = () => {
    if (!formData.name || !formData.code || !formData.days_allowed) {
      toast.error("Please fill all required fields");
      return;
    }

    updateMutation.mutate({
      id: selectedType.id,
      data: {
        ...formData,
        days_allowed: parseInt(formData.days_allowed),
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Leave Types</h2>
          <p className="text-sm text-gray-600">Configure leave types and policies</p>
        </div>
        <Button onClick={() => setCreateDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Leave Type
        </Button>
      </div>

      {/* Leave Types List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <Card className="col-span-full">
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">Loading...</p>
            </CardContent>
          </Card>
        ) : leaveTypes.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-8 text-center">
              <Settings className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No leave types configured</p>
              <Button onClick={() => setCreateDialog(true)} variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Add First Leave Type
              </Button>
            </CardContent>
          </Card>
        ) : (
          leaveTypes.map((type: any) => (
            <Card key={type.id} className="border-l-4" style={{ borderLeftColor: type.color }}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{type.name}</CardTitle>
                    <p className="text-xs text-gray-500 mt-1">{type.code}</p>
                  </div>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleEdit(type)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Days Allowed</span>
                  <span className="font-semibold">{type.days_allowed}</span>
                </div>

                {type.description && <p className="text-xs text-gray-600">{type.description}</p>}

                <div className="flex flex-wrap gap-2">
                  {type.is_paid && (
                    <Badge variant="secondary" className="text-xs">
                      Paid
                    </Badge>
                  )}
                  {type.requires_approval && (
                    <Badge variant="secondary" className="text-xs">
                      Requires Approval
                    </Badge>
                  )}
                  {type.can_carry_forward && (
                    <Badge variant="secondary" className="text-xs">
                      Carry Forward
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Leave Type</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Annual Leave"
                />
              </div>
              <div className="space-y-2">
                <Label>Code *</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., AL"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Days Allowed *</Label>
                <Input
                  type="number"
                  value={formData.days_allowed}
                  onChange={(e) => setFormData({ ...formData, days_allowed: e.target.value })}
                  placeholder="e.g., 20"
                />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <Input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Paid Leave</Label>
                <Switch
                  checked={formData.is_paid}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_paid: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Requires Approval</Label>
                <Switch
                  checked={formData.requires_approval}
                  onCheckedChange={(checked) => setFormData({ ...formData, requires_approval: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Can Carry Forward</Label>
                <Switch
                  checked={formData.can_carry_forward}
                  onCheckedChange={(checked) => setFormData({ ...formData, can_carry_forward: checked })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Leave Type"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Leave Type</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Annual Leave"
                />
              </div>
              <div className="space-y-2">
                <Label>Code *</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., AL"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Days Allowed *</Label>
                <Input
                  type="number"
                  value={formData.days_allowed}
                  onChange={(e) => setFormData({ ...formData, days_allowed: e.target.value })}
                  placeholder="e.g., 20"
                />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <Input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Paid Leave</Label>
                <Switch
                  checked={formData.is_paid}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_paid: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Requires Approval</Label>
                <Switch
                  checked={formData.requires_approval}
                  onCheckedChange={(checked) => setFormData({ ...formData, requires_approval: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Can Carry Forward</Label>
                <Switch
                  checked={formData.can_carry_forward}
                  onCheckedChange={(checked) => setFormData({ ...formData, can_carry_forward: checked })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Updating..." : "Update Leave Type"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
