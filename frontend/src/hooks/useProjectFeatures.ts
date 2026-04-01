import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi, api } from '@/lib/api';
import { toast } from 'sonner';

export interface TaskDependency {
  id: string;
  task_id: string;
  depends_on_task_id: string;
}

export function useTaskDependencies(projectId: string) {
  return useQuery({
    queryKey: ['task_dependencies', projectId],
    queryFn: async () => [],
    enabled: !!projectId,
  });
}

export function useAddTaskDependency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (d: { task_id: string; depends_on_task_id: string; project_id: string }) => d,
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['task_dependencies', v.project_id] });
      toast.success('Dependency added');
    },
    onError: (e: Error) => toast.error('Failed: ' + e.message),
  });
}

export function useRemoveTaskDependency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, project_id }: { id: string; project_id: string }) => project_id,
    onSuccess: (pid) => {
      qc.invalidateQueries({ queryKey: ['task_dependencies', pid] });
      toast.success('Dependency removed');
    },
    onError: (e: Error) => toast.error('Failed: ' + e.message),
  });
}

export interface ProjectRisk {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  severity: string;
  status: string;
}

export function useProjectRisks(projectId: string) {
  return useQuery({
    queryKey: ['project_risks', projectId],
    queryFn: () => api.get(`/risks/project/${projectId}`),
    enabled: !!projectId,
  });
}

export function useCreateRisk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (r: { project_id: string; title: string; description?: string; severity?: string }) => {
      return api.post(`/risks/project/${r.project_id}`, r);
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['project_risks', v.project_id] });
      toast.success('Risk created');
    },
    onError: (e: Error) => toast.error('Failed: ' + e.message),
  });
}

export function useUpdateRisk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, project_id, ...u }: any) => {
      return api.put(`/risks/${id}`, u);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['project_risks'] }),
    onError: (e: Error) => toast.error('Failed: ' + e.message),
  });
}

export function useProjectInvoices(projectId: string) {
  return useQuery({
    queryKey: ['project_invoices', projectId],
    queryFn: () => api.get(`/invoices/project/${projectId}`),
    enabled: !!projectId,
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (inv: { project_id: string; amount: number; description?: string; currency?: string }) => {
      return api.post(`/invoices/project/${inv.project_id}`, inv);
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['project_invoices', v.project_id] });
      toast.success('Invoice created');
    },
    onError: (e: Error) => toast.error('Failed: ' + e.message),
  });
}

export function useUpdateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, project_id, ...u }: any) => {
      return api.put(`/invoices/${id}`, u);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['project_invoices'] }),
    onError: (e: Error) => toast.error('Failed: ' + e.message),
  });
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description?: string;
  default_milestones: any[];
  default_tasks: any[];
  settings: any;
  created_by?: string;
  created_at: string;
}

export function useProjectTemplates() {
  return useQuery({
    queryKey: ['project_templates'],
    queryFn: () => api.get('/templates'),
  });
}

export function useCreateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (t: { name: string; description?: string; default_milestones?: any[]; default_tasks?: any[]; settings?: any }) => {
      return api.post('/templates', t);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project_templates'] });
      toast.success('Template saved');
    },
    onError: (e: Error) => toast.error('Failed: ' + e.message),
  });
}

export function useUpdateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...u }: any) => {
      return api.put(`/templates/${id}`, u);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project_templates'] });
      toast.success('Template updated');
    },
    onError: (e: Error) => toast.error('Failed: ' + e.message),
  });
}

export function useDeleteTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/templates/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project_templates'] });
      toast.success('Template deleted');
    },
    onError: (e: Error) => toast.error('Failed: ' + e.message),
  });
}

export function useApplyTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ template_id, project_id }: { template_id: string; project_id: string }) => {
      return api.post(`/templates/${template_id}/apply`, { project_id });
    },
    onSuccess: (_, { project_id }) => {
      qc.invalidateQueries({ queryKey: ['project_milestones', project_id] });
      qc.invalidateQueries({ queryKey: ['project_tasks', project_id] });
      toast.success('Template applied successfully');
    },
    onError: (e: Error) => toast.error('Failed: ' + e.message),
  });
}

export function useProjectNotifications(projectId?: string) {
  return useQuery({
    queryKey: ['project_notifications', projectId],
    queryFn: () => {
      const endpoint = projectId ? `/notifications/project/${projectId}` : '/notifications';
      return api.get(endpoint);
    },
    enabled: true,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return api.put(`/notifications/${id}/read`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['project_notifications'] }),
  });
}

export function useProjectShares(projectId: string) {
  return useQuery({
    queryKey: ['project_shares', projectId],
    queryFn: async () => [],
    enabled: !!projectId,
  });
}

export function useCreateShare() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (s: { project_id: string }) => s,
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['project_shares', v.project_id] });
      toast.success('Share link created');
    },
    onError: (e: Error) => toast.error('Failed: ' + e.message),
  });
}

export function useToggleShare() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ project_id }: { id: string; is_active: boolean; project_id: string }) => project_id,
    onSuccess: (pid) => qc.invalidateQueries({ queryKey: ['project_shares', pid] }),
    onError: (e: Error) => toast.error('Failed: ' + e.message),
  });
}
