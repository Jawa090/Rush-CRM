import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workgroupsApi } from '@/lib/api';
import { toast } from 'sonner';

export interface Workgroup {
  id: string;
  org_id: string;
  name: string;
  description?: string;
  avatar_color: string;
  type: 'team' | 'project' | 'private';
  is_private: boolean;
  is_archived: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  created_by_name: string;
  member_count: number;
  message_count: number;
  last_message_at?: string;
  is_member: boolean;
  has_recent_activity?: boolean;
  is_online?: boolean;
  user_role?: 'owner' | 'admin' | 'member' | 'guest';
}

export interface WorkgroupMember {
  id: string;
  workgroup_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'guest';
  joined_at: string;
  invited_by?: string;
  is_favorite: boolean;
  full_name: string;
  email: string;
  avatar_url?: string;
  invited_by_name?: string;
}

export interface WorkgroupPost {
  id: string;
  workgroup_id: string;
  channel_id?: string;
  user_id: string;
  parent_id?: string;
  content: string;
  content_type: 'text' | 'file' | 'image' | 'link' | 'code';
  is_pinned: boolean;
  is_edited: boolean;
  is_deleted: boolean;
  reactions: Record<string, any>;
  mention_users: string[];
  created_at: string;
  updated_at: string;
  author_name: string;
  author_avatar?: string;
  replies?: WorkgroupPost[];
}

export interface WorkgroupActivity {
  id: string;
  workgroup_id: string;
  user_id?: string;
  activity_type: string;
  activity_data: Record<string, any>;
  created_at: string;
  user_name?: string;
  user_avatar?: string;
}

// Get all workgroups
export function useWorkgroups(params: { type?: string; search?: string } = {}) {
  return useQuery({
    queryKey: ['workgroups', params],
    queryFn: () => workgroupsApi.getAll(params),
    staleTime: 30000, // 30 seconds
  });
}

// Get single workgroup
export function useWorkgroup(id: string) {
  return useQuery({
    queryKey: ['workgroup', id],
    queryFn: () => workgroupsApi.getById(id),
    enabled: !!id,
  });
}

// Create workgroup
export function useCreateWorkgroup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Workgroup>) => workgroupsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workgroups'] });
      toast.success('Workgroup created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create workgroup');
    },
  });
}

// Update workgroup
export function useUpdateWorkgroup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<Workgroup>) => 
      workgroupsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workgroups'] });
      queryClient.invalidateQueries({ queryKey: ['workgroup', variables.id] });
      toast.success('Workgroup updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update workgroup');
    },
  });
}

// Delete workgroup
export function useDeleteWorkgroup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => workgroupsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workgroups'] });
      toast.success('Workgroup deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete workgroup');
    },
  });
}

// Get workgroup members
export function useWorkgroupMembers(workgroupId: string) {
  return useQuery({
    queryKey: ['workgroup-members', workgroupId],
    queryFn: () => workgroupsApi.getMembers(workgroupId),
    enabled: !!workgroupId,
  });
}

// Add workgroup member
export function useAddWorkgroupMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ workgroupId, userId, role }: { 
      workgroupId: string; 
      userId: string; 
      role?: string 
    }) => workgroupsApi.addMember(workgroupId, { user_id: userId, role }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workgroup-members', variables.workgroupId] });
      queryClient.invalidateQueries({ queryKey: ['workgroups'] });
      toast.success('Member added successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to add member');
    },
  });
}

// Remove workgroup member
export function useRemoveWorkgroupMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ workgroupId, memberId }: { workgroupId: string; memberId: string }) => 
      workgroupsApi.removeMember(workgroupId, memberId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workgroup-members', variables.workgroupId] });
      queryClient.invalidateQueries({ queryKey: ['workgroups'] });
      toast.success('Member removed successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to remove member');
    },
  });
}

// Get workgroup posts
export function useWorkgroupPosts(workgroupId: string, params: { channel_id?: string } = {}) {
  return useQuery({
    queryKey: ['workgroup-posts', workgroupId, params],
    queryFn: () => workgroupsApi.getPosts(workgroupId, params),
    enabled: !!workgroupId,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time feel
  });
}

// Create workgroup post
export function useCreatePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ workgroupId, content, channelId, parentId }: {
      workgroupId: string;
      content: string;
      channelId?: string;
      parentId?: string;
    }) => workgroupsApi.createPost(workgroupId, {
      content,
      channel_id: channelId,
      parent_id: parentId
    }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workgroup-posts', variables.workgroupId] });
      queryClient.invalidateQueries({ queryKey: ['workgroups'] });
      toast.success('Message posted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to post message');
    },
  });
}

// Get workgroup activities
export function useWorkgroupActivities(workgroupId: string) {
  return useQuery({
    queryKey: ['workgroup-activities', workgroupId],
    queryFn: () => workgroupsApi.getActivities(workgroupId),
    enabled: !!workgroupId,
    refetchInterval: 60000, // Refetch every minute
  });
}

// Utility hooks for aggregated data
export function useWorkgroupMemberCounts(workgroupIds: string[]) {
  return useQuery({
    queryKey: ['workgroup-member-counts', workgroupIds],
    queryFn: async () => {
      const counts: Record<string, number> = {};
      
      // In a real app, you'd have a batch API endpoint
      // For now, we'll extract from the main workgroups query
      const workgroups = await workgroupsApi.getAll();
      workgroups.forEach((wg: Workgroup) => {
        counts[wg.id] = wg.member_count;
      });
      
      return counts;
    },
    enabled: workgroupIds.length > 0,
  });
}

export function useWorkgroupPostCounts(workgroupIds: string[]) {
  return useQuery({
    queryKey: ['workgroup-post-counts', workgroupIds],
    queryFn: async () => {
      const counts: Record<string, number> = {};
      
      // In a real app, you'd have a batch API endpoint
      const workgroups = await workgroupsApi.getAll();
      workgroups.forEach((wg: Workgroup) => {
        counts[wg.id] = wg.message_count;
      });
      
      return counts;
    },
    enabled: workgroupIds.length > 0,
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ postId, workgroupId }: { postId: string; workgroupId: string }) => {
      return workgroupsApi.deletePost(workgroupId, postId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workgroup-posts', variables.workgroupId] });
      toast.success('Message deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete message');
    },
  });
}

export function useTogglePinPost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ postId, isPinned, workgroupId }: { 
      postId: string; 
      isPinned: boolean; 
      workgroupId: string 
    }) => {
      return workgroupsApi.togglePinPost(workgroupId, postId, isPinned);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workgroup-posts', variables.workgroupId] });
      toast.success(variables.isPinned ? 'Message unpinned' : 'Message pinned');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update pin status');
    },
  });
}