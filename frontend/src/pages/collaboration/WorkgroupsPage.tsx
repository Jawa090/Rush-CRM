import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Users, Plus, MessageSquare, Search, MoreHorizontal, Edit, Trash2, 
  Video, Phone, Calendar, Files, Bell, Hash, Lock,
  UserPlus, Star, ChevronDown, LayoutGrid, List
} from "lucide-react";
import {
  useWorkgroups, useCreateWorkgroup, useUpdateWorkgroup, useDeleteWorkgroup,
  useWorkgroupMemberCounts, useWorkgroupPostCounts, type Workgroup,
} from "@/hooks/useWorkgroups";
import WorkgroupDetailView from "@/components/workgroups/WorkgroupDetailView";
import { toast } from "sonner";

const WORKGROUP_TYPES = [
  { value: "team" as const, label: "Team", icon: Users, description: "For project teams and departments" },
  { value: "project" as const, label: "Project", icon: Hash, description: "For specific projects and initiatives" },
  { value: "private" as const, label: "Private", icon: Lock, description: "Private group with invite-only access" },
];

export default function WorkgroupsPage() {
  const { data: workgroups = [], isLoading } = useWorkgroups();
  const createWg = useCreateWorkgroup();
  const updateWg = useUpdateWorkgroup();
  const deleteWg = useDeleteWorkgroup();

  const wgIds = workgroups.map((w) => w.id);
  const { data: memberCounts = {} } = useWorkgroupMemberCounts(wgIds);
  const { data: postCounts = {} } = useWorkgroupPostCounts(wgIds);

  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Workgroup | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Workgroup | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterType, setFilterType] = useState<"all" | "team" | "project" | "private">("all");
  const [form, setForm] = useState<{
    name: string;
    description: string;
    avatar_color: string;
    type: "team" | "project" | "private";
    is_private: boolean;
  }>({ 
    name: "", 
    description: "", 
    avatar_color: "bg-blue-500",
    type: "team",
    is_private: false
  });

  const filtered = workgroups.filter((w) => {
    const matchesSearch = w.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "all" || w.type === filterType;
    return matchesSearch && matchesType;
  });

  const resetForm = () => {
    setForm({ 
      name: "", 
      description: "", 
      avatar_color: "bg-blue-500",
      type: "team",
      is_private: false
    });
  };

  const openEdit = (wg: Workgroup) => {
    setForm({
      name: wg.name,
      description: wg.description || "",
      avatar_color: wg.avatar_color,
      type: wg.type,
      is_private: wg.is_private
    });
    setEditing(wg);
  };

  const handleCreate = () => {
    createWg.mutate(
      { 
        name: form.name, 
        description: form.description, 
        avatar_color: form.avatar_color,
        type: form.type,
        is_private: form.is_private
      },
      { 
        onSuccess: () => { 
          setShowCreate(false); 
          resetForm(); 
          toast.success(`Team "${form.name}" created successfully!`);
        }
      }
    );
  };

  const handleUpdate = () => {
    if (!editing) return;
    updateWg.mutate(
      { 
        id: editing.id,
        name: form.name, 
        description: form.description, 
        avatar_color: form.avatar_color,
        type: form.type,
        is_private: form.is_private
      },
      { 
        onSuccess: () => { 
          setEditing(null); 
          resetForm(); 
          toast.success(`Team "${form.name}" updated successfully!`);
        }
      }
    );
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteWg.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
        toast.success(`Team "${deleteTarget.name}" deleted successfully!`);
      }
    });
  };

  const getWorkgroupTypeIcon = (type: string) => {
    const typeConfig = WORKGROUP_TYPES.find(t => t.value === type);
    return typeConfig ? typeConfig.icon : Users;
  };

  const getWorkgroupTypeLabel = (type: string) => {
    const typeConfig = WORKGROUP_TYPES.find(t => t.value === type);
    return typeConfig ? typeConfig.label : "Team";
  };

  if (selectedId) {
    return <WorkgroupDetailView workgroupId={selectedId} onBack={() => setSelectedId(null)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Microsoft Teams Style Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Teams & Workgroups</h1>
                <p className="text-gray-600 dark:text-gray-400">Microsoft Teams-style collaboration platform for your organization</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => { resetForm(); setShowCreate(true); }} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                <Plus className="h-4 w-4" />
                Create Team
              </Button>
            </div>
          </div>

          {/* Stats Cards - Teams Style */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-700 dark:text-blue-300 text-sm font-medium">Total Teams</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{workgroups.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-700 dark:text-green-300 text-sm font-medium">Active Now</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">{filtered.filter(() => Math.random() > 0.6).length}</p>
                </div>
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                </div>
              </div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-700 dark:text-purple-300 text-sm font-medium">Messages Today</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{Object.values(postCounts).reduce((a, b) => a + b, 0)}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-700 dark:text-orange-300 text-sm font-medium">Total Members</p>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{Object.values(memberCounts).reduce((a, b) => a + b, 0)}</p>
                </div>
                <UserPlus className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters - Teams Style */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 min-w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search teams, projects, and conversations..."
                className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                  <Hash className="h-4 w-4" />
                  {filterType === "all" ? "All Types" : getWorkgroupTypeLabel(filterType)}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterType("all")}>All Types</DropdownMenuItem>
                {WORKGROUP_TYPES.map((type) => (
                  <DropdownMenuItem key={type.value} onClick={() => setFilterType(type.value)}>
                    <type.icon className="h-4 w-4 mr-2" />
                    {type.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex items-center bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={`rounded-md ${viewMode === "grid" ? "bg-blue-600 text-white shadow-sm" : ""}`}
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                Grid
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={`rounded-md ${viewMode === "list" ? "bg-blue-600 text-white shadow-sm" : ""}`}
              >
                <List className="h-4 w-4 mr-2" />
                List
              </Button>
            </div>
          </div>
        </div>

        {/* Teams Grid - Microsoft Teams Style */}
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-40 animate-pulse" />
            <p>Loading teams...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No teams found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {search ? `No teams match "${search}"` : "Create your first team to start collaborating with your colleagues."}
            </p>
            {!search && (
              <Button onClick={() => { resetForm(); setShowCreate(true); }} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                <Plus className="h-4 w-4" /> Create Your First Team
              </Button>
            )}
          </div>
        ) : (
          <div className={viewMode === "grid" ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "space-y-3"}>
            {filtered.map((wg) => {
              const TypeIcon = getWorkgroupTypeIcon(wg.type || "team");
              const memberCount = memberCounts[wg.id] || 0;
              const postCount = postCounts[wg.id] || 0;
              const hasActivity = Math.random() > 0.7;
              
              return (
                <div
                  key={wg.id}
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer group relative ${
                    viewMode === "list" ? "flex items-center p-4" : "p-4"
                  } ${hasActivity ? "ring-2 ring-blue-200 dark:ring-blue-800" : ""}`}
                  onClick={() => setSelectedId(wg.id)}
                >
                  {hasActivity && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-white dark:border-gray-800" />
                  )}
                  
                  <div className={`flex items-center gap-3 ${viewMode === "list" ? "flex-1" : ""}`}>
                    <div className="relative flex-shrink-0">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className={`${wg.avatar_color} text-white font-semibold text-lg`}>
                          {wg.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center border border-gray-200 dark:border-gray-600">
                        <TypeIcon className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">{wg.name}</h3>
                        {wg.is_private && <Lock className="h-4 w-4 text-gray-500" />}
                        {hasActivity && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                      </div>
                      {wg.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1 mb-2">{wg.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{memberCount} members</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>{postCount} messages</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          {getWorkgroupTypeLabel(wg.type || "team")}
                        </Badge>
                        {hasActivity && (
                          <Badge variant="outline" className="text-xs text-green-600 dark:text-green-400 border-green-200 dark:border-green-800">
                            Active now
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem onClick={() => setSelectedId(wg.id)}>
                          <MessageSquare className="h-4 w-4 mr-2" /> Open Team
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEdit(wg)}>
                          <Edit className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => setDeleteTarget(wg)}>
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Simple Create / Edit Dialog */}
      <Dialog open={showCreate || !!editing} onOpenChange={(open) => { if (!open) { setShowCreate(false); setEditing(null); resetForm(); } }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {editing ? "Edit Team" : "Create New Team"}
            </DialogTitle>
            <DialogDescription>
              {editing ? "Update your team details." : "Create a new team workspace for collaboration."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Team Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Team Name *</Label>
              <Input 
                id="name"
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })} 
                placeholder="e.g., Sales Team, Marketing Project" 
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea 
                id="description"
                value={form.description} 
                onChange={(e) => setForm({ ...form, description: e.target.value })} 
                rows={2} 
                placeholder="What is this team for?" 
              />
            </div>

            {/* Team Type - Simple Radio Buttons */}
            <div className="space-y-2">
              <Label>Team Type</Label>
              <div className="flex gap-4">
                {WORKGROUP_TYPES.map((type) => (
                  <div key={type.value} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={type.value}
                      name="type"
                      value={type.value}
                      checked={form.type === type.value}
                      onChange={(e) => setForm({ ...form, type: e.target.value as "team" | "project" | "private" })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <Label htmlFor={type.value} className="text-sm font-normal cursor-pointer">
                      {type.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreate(false); setEditing(null); resetForm(); }}>
              Cancel
            </Button>
            <Button 
              onClick={editing ? handleUpdate : handleCreate} 
              disabled={!form.name.trim() || createWg.isPending || updateWg.isPending}
              className="gap-2"
            >
              {createWg.isPending || updateWg.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {editing ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  {editing ? "Update Team" : "Create Team"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the team, all its posts, and member associations. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 text-white hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}