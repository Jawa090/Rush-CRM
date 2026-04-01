import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft, Users, MessageSquare, UserPlus, Send, Pin, Trash2,
  MoreHorizontal, Reply, Crown, UserMinus, Hash, Video, Phone,
  Calendar, Files, Settings, Bell, Search, Smile, Paperclip,
  Mic, Camera, Share, Star, Download, Copy
} from "lucide-react";
import {
  useWorkgroup, useWorkgroupMembers, useWorkgroupPosts, useAddWorkgroupMember,
  useRemoveWorkgroupMember, useCreatePost, useDeletePost, useTogglePinPost,
  type WorkgroupPost,
} from "@/hooks/useWorkgroups";
import { workgroupsApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface Props {
  workgroupId: string;
  onBack: () => void;
}

export default function WorkgroupDetailView({ workgroupId, onBack }: Props) {
  const { user } = useAuth();
  const { data: workgroup } = useWorkgroup(workgroupId);
  const { data: members = [], isLoading: membersLoading } = useWorkgroupMembers(workgroupId);
  const { data: posts = [], isLoading: postsLoading } = useWorkgroupPosts(workgroupId);
  const { users: orgUsers = [] } = useAdminUsers();
  const addMember = useAddWorkgroupMember();
  const removeMember = useRemoveWorkgroupMember();
  const createPost = useCreatePost();
  const deletePost = useDeletePost();
  const togglePin = useTogglePinPost();

  const [activeTab, setActiveTab] = useState<"posts" | "files" | "wiki" | "settings">("posts");
  const [newPost, setNewPost] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [showCreateWikiPage, setShowCreateWikiPage] = useState(false);
  const [newWikiPageTitle, setNewWikiPageTitle] = useState("");
  const [newWikiPageContent, setNewWikiPageContent] = useState("");
  const [showMembersList, setShowMembersList] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Real API data
  const { data: files = [], refetch: refetchFiles } = useQuery({
    queryKey: ['workgroup-files', workgroupId],
    queryFn: () => workgroupsApi.getFiles(workgroupId),
    enabled: !!workgroupId,
  });
  
  const { data: wikiPages = [], refetch: refetchWiki } = useQuery({
    queryKey: ['workgroup-wiki', workgroupId],
    queryFn: () => workgroupsApi.getWikiPages(workgroupId),
    enabled: !!workgroupId,
  });
  
  const { data: notificationsData, refetch: refetchNotifications } = useQuery({
    queryKey: ['workgroup-notifications', workgroupId],
    queryFn: () => workgroupsApi.getNotifications(workgroupId),
    enabled: !!workgroupId,
  });
  
  const notifications = notificationsData?.notifications || [];
  const unreadCount = notificationsData?.unread_count || 0;

  const isMember = members.some((m) => m.user_id === user?.id);
  const isGroupAdmin = members.some((m) => m.user_id === user?.id && ['owner', 'admin'].includes(m.role));
  const memberUserIds = new Set(members.map((m) => m.user_id));
  const availableUsers = orgUsers.filter((u) => !memberUserIds.has(u.id));
  const handlePost = () => {
    if (!newPost.trim()) return;
    createPost.mutate(
      { workgroupId, content: newPost },
      { onSuccess: () => setNewPost("") }
    );
  };

  const handleReply = (parentId: string) => {
    if (!replyContent.trim()) return;
    createPost.mutate(
      { workgroupId, content: replyContent, parentId },
      { onSuccess: () => { setReplyTo(null); setReplyContent(""); } }
    );
  };

  const handleStartMeeting = () => {
    // In a real app, this would integrate with Teams/Zoom/Google Meet
    toast.success(`Starting video meeting for ${workgroup.name}...`);
    // Simulate opening meeting
    window.open(`https://meet.google.com/new`, '_blank');
  };

  const handleStartCall = () => {
    // In a real app, this would start an audio call
    toast.success(`Starting audio call for ${workgroup.name}...`);
    // Simulate starting call
    console.log('Starting audio call...');
  };

  const handleUploadFile = () => {
    // Create file input
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = async (e: any) => {
      const files = Array.from(e.target.files);
      
      try {
        for (const file of files) {
          await workgroupsApi.uploadFile(workgroupId, file as File);
        }
        refetchFiles();
        toast.success(`${files.length} file(s) uploaded successfully!`);
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Failed to upload files');
      }
    };
    input.click();
  };

  const handleCreateWikiPage = async () => {
    setShowCreateWikiPage(true);
  };

  const handleCreateWikiPageSubmit = async () => {
    if (!newWikiPageTitle.trim()) return;
    
    try {
      await workgroupsApi.createWikiPage(workgroupId, { 
        title: newWikiPageTitle, 
        content: newWikiPageContent || 'This is a new wiki page. Click to edit...' 
      });
      refetchWiki();
      toast.success(`Wiki page "${newWikiPageTitle}" created!`);
      setShowCreateWikiPage(false);
      setNewWikiPageTitle('');
      setNewWikiPageContent('');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create wiki page');
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await workgroupsApi.markNotificationAsRead(workgroupId, notificationId);
      refetchNotifications();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to mark notification as read');
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await workgroupsApi.markAllNotificationsAsRead(workgroupId);
      refetchNotifications();
      toast.success('All notifications marked as read');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to mark notifications as read');
    }
  };

  const handleAddMember = () => {
    if (!selectedUserId) return;
    addMember.mutate(
      { workgroupId, userId: selectedUserId, role: 'member' },
      { 
        onSuccess: () => { 
          setShowAddMember(false); 
          setSelectedUserId(""); 
          toast.success('Team member added successfully!');
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.error || 'Failed to add member');
        }
      }
    );
  };

  if (!workgroup) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading team...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Left Sidebar - Team Info & Members */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Avatar className="h-10 w-10">
              <AvatarFallback className={`${workgroup.avatar_color} text-white font-semibold`}>
                {workgroup.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-gray-900 dark:text-white truncate">{workgroup.name}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{members.length} members</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowMembersList(true)}>
                  <Users className="h-4 w-4 mr-2" /> Manage Members
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowNotifications(true)}>
                  <Bell className="h-4 w-4 mr-2" /> 
                  Notifications
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" /> Team Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {workgroup.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{workgroup.description}</p>
          )}

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white gap-2" onClick={handleStartMeeting}>
              <Video className="h-4 w-4" />
              Meet
            </Button>
            <Button size="sm" variant="outline" className="flex-1 gap-2" onClick={handleStartCall}>
              <Phone className="h-4 w-4" />
              Call
            </Button>
          </div>
        </div>

        {/* Channels */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Channels</h3>
          <div className="space-y-1">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
              activeTab === "posts" ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300" : "hover:bg-gray-100 dark:hover:bg-gray-700"
            }`} onClick={() => setActiveTab("posts")}>
              <Hash className="h-4 w-4" />
              <span className="text-sm font-medium">General</span>
              <Badge variant="secondary" className="ml-auto text-xs">{posts.length}</Badge>
            </div>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
              activeTab === "files" ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300" : "hover:bg-gray-100 dark:hover:bg-gray-700"
            }`} onClick={() => setActiveTab("files")}>
              <Files className="h-4 w-4" />
              <span className="text-sm font-medium">Files</span>
              <Badge variant="secondary" className="ml-auto text-xs">{files.length}</Badge>
            </div>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
              activeTab === "wiki" ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300" : "hover:bg-gray-100 dark:hover:bg-gray-700"
            }`} onClick={() => setActiveTab("wiki")}>
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm font-medium">Wiki</span>
              <Badge variant="secondary" className="ml-auto text-xs">{wikiPages.length}</Badge>
            </div>
          </div>
        </div>

        {/* Members Preview */}
        <div className="p-4 flex-1">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Members ({members.length})</h3>
            {isGroupAdmin && (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setShowAddMember(true)} 
                className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                title="Add Member"
              >
                <UserPlus className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {/* Add Member Quick Button */}
          {isGroupAdmin && (
            <div className="mb-3">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setShowAddMember(true)}
                className="w-full gap-2 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                <UserPlus className="h-4 w-4" />
                Add Team Member
              </Button>
            </div>
          )}
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {members.slice(0, 8).map((member) => (
              <div key={member.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs">
                    {(member.full_name || "?").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {member.full_name || member.email || "Unknown"}
                  </p>
                  <div className="flex items-center gap-1">
                    {member.role === 'owner' && <Crown className="h-3 w-3 text-yellow-500" />}
                    <span className="text-xs text-gray-500 dark:text-gray-400">{member.role}</span>
                  </div>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            ))}
            {members.length > 8 && (
              <Button variant="ghost" size="sm" className="w-full text-blue-600 hover:text-blue-700" onClick={() => setShowMembersList(true)}>
                +{members.length - 8} more members
              </Button>
            )}
          </div>
        </div>
      </div>
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Hash className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {activeTab === "posts" ? "General" : activeTab === "files" ? "Files" : activeTab === "wiki" ? "Wiki" : "Settings"}
              </h1>
              <Badge variant="secondary" className="text-xs">
                {activeTab === "posts" ? `${posts.length} messages` : activeTab === "files" ? "0 files" : ""}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Search in this channel..." className="pl-10 w-64 bg-gray-50 dark:bg-gray-700" />
              </div>
              <Button variant="ghost" size="icon">
                <Star className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setShowNotifications(true)} className="relative">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">{unreadCount}</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeTab === "posts" && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {postsLoading ? (
                  <div className="text-center py-8">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-gray-500">Loading messages...</p>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Start a conversation</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Be the first to share something with your team!</p>
                  </div>
                ) : (
                  posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      workgroupId={workgroupId}
                      isGroupAdmin={isGroupAdmin}
                      isMember={isMember}
                      currentUserId={user?.id}
                      replyTo={replyTo}
                      replyContent={replyContent}
                      onSetReplyTo={setReplyTo}
                      onSetReplyContent={setReplyContent}
                      onReply={handleReply}
                      onDelete={(postId) => deletePost.mutate({ postId, workgroupId })}
                      onTogglePin={(postId, isPinned) => togglePin.mutate({ postId, isPinned, workgroupId })}
                    />
                  ))
                )}
              </div>

              {/* Message Input - Fixed at Bottom */}
              {isMember && (
                <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="relative">
                        <Input
                          value={newPost}
                          onChange={(e) => setNewPost(e.target.value)}
                          placeholder={`Type a message...`}
                          className="pr-24 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-full h-10"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handlePost();
                            }
                          }}
                        />
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-gray-100 dark:hover:bg-gray-600">
                            <Smile className="h-4 w-4 text-gray-500" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-gray-100 dark:hover:bg-gray-600">
                            <Paperclip className="h-4 w-4 text-gray-500" />
                          </Button>
                          <Button 
                            onClick={handlePost} 
                            disabled={!newPost.trim() || createPost.isPending}
                            size="icon"
                            className="h-7 w-7 bg-blue-600 hover:bg-blue-700 text-white rounded-full"
                          >
                            <Send className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "files" && (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <Button onClick={handleUploadFile} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                  <Paperclip className="h-4 w-4" />
                  Upload Files
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {files.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <Files className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No files yet</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">Share files with your team to get started</p>
                      <Button onClick={handleUploadFile} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                        <Paperclip className="h-4 w-4" />
                        Upload Files
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {files.map((file) => (
                      <div key={file.id} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                          <Files className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate">{file.original_name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {(file.file_size / 1024 / 1024).toFixed(2)} MB • Uploaded by {file.uploaded_by_name} • {new Date(file.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              // Download file
                              const link = document.createElement('a');
                              link.href = `/api/workgroups/${workgroupId}/files/${file.id}/download`;
                              link.download = file.original_name;
                              link.click();
                            }}>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              navigator.clipboard.writeText(file.original_name);
                              toast.success('File name copied to clipboard');
                            }}>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy Name
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={async () => {
                                try {
                                  await workgroupsApi.deleteFile(workgroupId, file.id);
                                  refetchFiles();
                                  toast.success('File deleted successfully');
                                } catch (error) {
                                  toast.error('Failed to delete file');
                                }
                              }}
                              className="text-red-600 dark:text-red-400"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "wiki" && (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <Button onClick={handleCreateWikiPage} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Create Page
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {wikiPages.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Team Wiki</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">Create and share knowledge with your team</p>
                      <Button onClick={handleCreateWikiPage} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Create Page
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {wikiPages.map((page) => (
                      <div key={page.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow cursor-pointer">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{page.title}</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">{page.content}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                              <span>Created by {page.created_by_name}</span>
                              <span>Last modified {new Date(page.updated_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                // Edit wiki page
                                const newContent = prompt('Edit page content:', page.content);
                                if (newContent !== null) {
                                  workgroupsApi.updateWikiPage(workgroupId, page.id, { content: newContent })
                                    .then(() => {
                                      refetchWiki();
                                      toast.success('Wiki page updated successfully');
                                    })
                                    .catch(() => {
                                      toast.error('Failed to update wiki page');
                                    });
                                }
                              }}>
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                navigator.clipboard.writeText(page.content || '');
                                toast.success('Page content copied to clipboard');
                              }}>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Content
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={async () => {
                                  try {
                                    await workgroupsApi.deleteWikiPage(workgroupId, page.id);
                                    refetchWiki();
                                    toast.success('Wiki page deleted successfully');
                                  } catch (error) {
                                    toast.error('Failed to delete wiki page');
                                  }
                                }}
                                className="text-red-600 dark:text-red-400"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Add Member Dialog */}
      <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-blue-600" />
              Add Team Member
            </DialogTitle>
            <DialogDescription>
              Add a colleague from your organization to this team.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {availableUsers.length === 0 ? (
              <div className="text-center py-6">
                <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">No available users</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  All users in your organization are already members of this team.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    Select User ({availableUsers.length} available)
                  </label>
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a team member to add..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUsers.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          <div className="flex items-center gap-3 py-1">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                                {(u.full_name || u.email || "?").slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900">{u.full_name || "Unknown"}</p>
                              <p className="text-sm text-gray-600">{u.email}</p>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedUserId && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          {(availableUsers.find(u => u.id === selectedUserId)?.full_name || "?").slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {availableUsers.find(u => u.id === selectedUserId)?.full_name || "Unknown"}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {availableUsers.find(u => u.id === selectedUserId)?.email}
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">Will be added as Member</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddMember(false); setSelectedUserId(""); }}>
              Cancel
            </Button>
            {availableUsers.length > 0 && (
              <Button 
                onClick={handleAddMember} 
                disabled={!selectedUserId || addMember.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                {addMember.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Add to Team
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Wiki Page Dialog */}
      <Dialog open={showCreateWikiPage} onOpenChange={setShowCreateWikiPage}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              Create Wiki Page
            </DialogTitle>
            <DialogDescription>
              Create a new wiki page to share knowledge with your team.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Page Title *
              </label>
              <Input
                value={newWikiPageTitle}
                onChange={(e) => setNewWikiPageTitle(e.target.value)}
                placeholder="Enter wiki page title..."
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Initial Content (Optional)
              </label>
              <Textarea
                value={newWikiPageContent}
                onChange={(e) => setNewWikiPageContent(e.target.value)}
                placeholder="Enter initial content for the wiki page..."
                className="w-full min-h-[120px] resize-none"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                You can edit and add more content after creating the page.
              </p>
            </div>

            {newWikiPageTitle && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">{newWikiPageTitle}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {newWikiPageContent || 'This is a new wiki page. Click to edit...'}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                      Created by {user?.full_name || user?.email || 'You'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => { 
                setShowCreateWikiPage(false); 
                setNewWikiPageTitle(''); 
                setNewWikiPageContent(''); 
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateWikiPageSubmit} 
              disabled={!newWikiPageTitle.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Create Page
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Members List Dialog */}
      <Dialog open={showMembersList} onOpenChange={setShowMembersList}>
        <DialogContent className="sm:max-w-[500px] max-h-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Members ({members.length})
            </DialogTitle>
            <DialogDescription>Manage your team members and their roles.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto py-4">
            {membersLoading ? (
              <div className="text-center py-8">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-gray-500">Loading members...</p>
              </div>
            ) : (
              members.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                      {(member.full_name || "?").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {member.full_name || member.email || "Unknown User"}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{member.email}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Joined {member.joined_at ? formatDistanceToNow(new Date(member.joined_at), { addSuffix: true }) : 'recently'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={member.role === "owner" ? "default" : "secondary"} className="gap-1">
                      {member.role === "owner" && <Crown className="h-3 w-3" />}
                      {member.role}
                    </Badge>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    {isGroupAdmin && member.user_id !== user?.id && member.role !== "owner" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => removeMember.mutate({ memberId: member.id, workgroupId })}
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            {isGroupAdmin && (
              <Button onClick={() => { setShowMembersList(false); setShowAddMember(true); }} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                <UserPlus className="h-4 w-4" />
                Add Member
              </Button>
            )}
            <Button variant="outline" onClick={() => setShowMembersList(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notifications Dialog */}
      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent className="sm:max-w-[500px] max-h-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Team Notifications
            </DialogTitle>
            <DialogDescription>Stay updated with team activities and mentions.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto py-4">
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    notification.is_read 
                      ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800' 
                      : 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'
                  }`}
                  onClick={() => markNotificationAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${notification.is_read ? 'bg-gray-300' : 'bg-blue-500'}`}></div>
                    <div className="flex-1">
                      <p className={`text-sm ${notification.is_read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white font-medium'}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant={notification.notification_type === 'member_added' ? 'default' : notification.notification_type === 'message' ? 'secondary' : 'outline'} className="text-xs">
                      {notification.notification_type.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={markAllNotificationsAsRead}>
              Mark All Read
            </Button>
            <Button variant="outline" onClick={() => setShowNotifications(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
// ─── Post Card Component ───────────────────────────────────────────────────────────────

interface PostCardProps {
  post: WorkgroupPost;
  workgroupId: string;
  isGroupAdmin: boolean;
  isMember: boolean;
  currentUserId?: string;
  replyTo: string | null;
  replyContent: string;
  onSetReplyTo: (id: string | null) => void;
  onSetReplyContent: (v: string) => void;
  onReply: (parentId: string) => void;
  onDelete: (postId: string) => void;
  onTogglePin: (postId: string, isPinned: boolean) => void;
}

function PostCard({
  post, workgroupId, isGroupAdmin, isMember, currentUserId,
  replyTo, replyContent, onSetReplyTo, onSetReplyContent, onReply, onDelete, onTogglePin,
}: PostCardProps) {
  const isAuthor = post.user_id === currentUserId;

  return (
    <div className={`group hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg p-4 transition-colors ${
      post.is_pinned ? "bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800" : ""
    }`}>
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10 mt-1">
          <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
            {(post.author_name || "?").slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-gray-900 dark:text-white text-sm">
              {post.author_name || "Unknown"}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {post.created_at ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true }) : 'recently'}
            </span>
            {post.is_pinned && (
              <Badge variant="outline" className="gap-1 text-xs border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300">
                <Pin className="h-3 w-3" />
                Pinned
              </Badge>
            )}
          </div>
          <div className="text-gray-900 dark:text-white text-sm leading-relaxed whitespace-pre-wrap mb-3">
            {post.content}
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {isMember && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                onClick={() => onSetReplyTo(post.id)}
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
            )}
            {isGroupAdmin && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-xs text-gray-600 hover:text-yellow-600 hover:bg-yellow-50"
                onClick={() => onTogglePin(post.id, post.is_pinned)}
              >
                <Pin className="h-3 w-3 mr-1" />
                {post.is_pinned ? "Unpin" : "Pin"}
              </Button>
            )}
            {(isAuthor || isGroupAdmin) && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-xs text-gray-600 hover:text-red-600 hover:bg-red-50"
                onClick={() => onDelete(post.id)}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            )}
          </div>

          {/* Replies */}
          {post.replies && post.replies.length > 0 && (
            <div className="mt-4 ml-4 space-y-3 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
              {post.replies.map((reply) => (
                <div key={reply.id} className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs">
                      {(reply.author_name || "?").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-white text-sm">
                        {reply.author_name || "Unknown"}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {reply.created_at ? formatDistanceToNow(new Date(reply.created_at), { addSuffix: true }) : 'recently'}
                      </span>
                    </div>
                    <div className="text-gray-900 dark:text-white text-sm leading-relaxed whitespace-pre-wrap">
                      {reply.content}
                    </div>
                  </div>
                  {(reply.user_id === currentUserId || isGroupAdmin) && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100"
                      onClick={() => onDelete(reply.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Reply Input */}
          {replyTo === post.id && (
            <div className="mt-4 flex gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs">
                  {(currentUserId || "?").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Input
                  value={replyContent}
                  onChange={(e) => onSetReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="mb-2 bg-gray-50 dark:bg-gray-700"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      onReply(post.id);
                    }
                  }}
                />
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => onReply(post.id)} 
                    disabled={!replyContent.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Send className="h-3 w-3 mr-1" />
                    Reply
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => onSetReplyTo(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}