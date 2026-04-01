import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi, tasksApi, api } from '@/lib/api';
import { toast } from 'sonner';

export interface ProjectFull {
  id: string;
  name: string;
  description: string | null;
  status: string;
  color: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

export function useProjectsList() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.getAll(),
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { name: string; description?: string; start_date?: string; end_date?: string; color?: string }) => 
      projectsApi.create(p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project created');
    },
    onError: (e: Error) => toast.error('Failed: ' + e.message),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...u }: Partial<ProjectFull> & { id: string }) => 
      projectsApi.update(id, u),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (e: Error) => toast.error('Failed: ' + e.message),
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project deleted');
    },
    onError: (e: Error) => toast.error('Failed: ' + e.message),
  });
}

export function useProjectMilestones(projectId: string) {
  return useQuery({
    queryKey: ['project_milestones', projectId],
    queryFn: () => api.get(`/milestones/project/${projectId}`),
    enabled: !!projectId,
  });
}

export function useCreateMilestone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (m: { project_id: string; name: string; description?: string; due_date?: string }) => {
      return api.post(`/milestones/project/${m.project_id}`, m);
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['project_milestones', v.project_id] });
      toast.success('Milestone added');
    },
    onError: (e: Error) => toast.error('Failed: ' + e.message),
  });
}

export function useUpdateMilestone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, project_id, ...u }: any) => {
      return api.put(`/milestones/${id}`, u);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['project_milestones'] }),
    onError: (e: Error) => toast.error('Failed: ' + e.message),
  });
}

export function useProjectMembers(projectId: string) {
  return useQuery({
    queryKey: ['project_members', projectId],
    queryFn: () => api.get(`/projects/${projectId}/members`),
    enabled: !!projectId,
  });
}

export function useAddProjectMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (m: { project_id: string; user_id: string; role?: string }) => {
      return api.post(`/projects/${m.project_id}/members`, m);
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['project_members', v.project_id] });
      toast.success('Member added');
    },
    onError: (e: Error) => toast.error('Failed: ' + e.message),
  });
}

export function useRemoveProjectMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, project_id }: { id: string; project_id: string }) => {
      return api.delete(`/projects/${project_id}/members/${id}`);
    },
    onSuccess: (_, { project_id }) => {
      qc.invalidateQueries({ queryKey: ['project_members', project_id] });
      toast.success('Member removed');
    },
    onError: (e: Error) => toast.error('Failed: ' + e.message),
  });
}

export function useProjectTasks(projectId: string) {
  return useQuery({
    queryKey: ['project_tasks', projectId],
    queryFn: () => tasksApi.getAll({ projectId }),
    enabled: !!projectId,
  });
}

export function useProjectTimeEntries(projectId: string) {
  return useQuery({
    queryKey: ['project_time_entries', projectId],
    queryFn: () => api.get(`/time-entries/project/${projectId}`),
    enabled: !!projectId,
  });
}

export function useCreateTimeEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entry: { project_id: string; task_id?: string; hours: number; date: string; description?: string }) => {
      return api.post(`/time-entries/project/${entry.project_id}`, entry);
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['project_time_entries', v.project_id] });
      toast.success('Time entry added');
    },
    onError: (e: Error) => toast.error('Failed: ' + e.message),
  });
}

export function useUpdateTimeEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, project_id, ...u }: any) => {
      return api.put(`/time-entries/${id}`, u);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['project_time_entries'] }),
    onError: (e: Error) => toast.error('Failed: ' + e.message),
  });
}

export function useTimeEntryStats(projectId: string) {
  return useQuery({
    queryKey: ['time_entry_stats', projectId],
    queryFn: () => api.get(`/time-entries/project/${projectId}/stats`),
    enabled: !!projectId,
  });
}

export function useInvoiceStats(projectId: string) {
  return useQuery({
    queryKey: ['invoice_stats', projectId],
    queryFn: () => api.get(`/invoices/project/${projectId}/stats`),
    enabled: !!projectId,
  });
}