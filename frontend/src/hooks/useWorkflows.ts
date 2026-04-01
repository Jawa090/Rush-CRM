import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workflowsApi } from '@/lib/api';
import { toast } from 'sonner';

export interface Workflow {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  trigger_type: string;
  trigger_config: Record<string, unknown>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowAction {
  id: string;
  workflow_id: string;
  org_id: string;
  action_type: string;
  action_config: Record<string, unknown>;
  sort_order: number;
  condition_config: Record<string, unknown> | null;
  created_at: string;
}

export const TRIGGER_TYPES = [
  { value: 'lead_created',       label: 'Lead Created' },
  { value: 'lead_stage_changed', label: 'Lead Stage Changed' },
  { value: 'deal_created',       label: 'Deal Created' },
  { value: 'deal_stage_changed', label: 'Deal Stage Changed' },
  { value: 'deal_won',           label: 'Deal Won' },
  { value: 'deal_lost',          label: 'Deal Lost' },
  { value: 'task_completed',     label: 'Task Completed' },
  { value: 'contact_created',    label: 'Contact Created' },
  { value: 'form_submitted',     label: 'Form Submitted' },
  { value: 'manual',             label: 'Manual Trigger' },
] as const;

export const ACTION_TYPES = [
  { value: 'send_email', label: 'Send Email' },
  { value: 'create_task', label: 'Create Task' },
  { value: 'assign_owner', label: 'Assign Owner' },
  { value: 'change_stage', label: 'Change Pipeline Stage' },
  { value: 'send_webhook', label: 'Send Webhook' },
  { value: 'update_field', label: 'Update Field' },
  { value: 'add_tag', label: 'Add Tag' },
  { value: 'ai_classify', label: 'AI Classification' },
] as const;

export function useWorkflows() {
  return useQuery({
    queryKey: ['workflows'],
    queryFn: () => workflowsApi.getAll(),
  });
}

export function useWorkflowActions(workflowId: string) {
  return useQuery({
    queryKey: ['workflow_actions', workflowId],
    queryFn: async () => {
      if (!workflowId) return [];
      const workflow = await workflowsApi.getById(workflowId);
      return workflow.actions || [];
    },
    enabled: !!workflowId,
  });
}

export function useCreateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workflow: { name: string; description?: string; trigger_type?: string; actions?: any[]; is_active?: boolean }) => 
      workflowsApi.create(workflow),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast.success('Workflow created');
    },
    onError: (err: Error) => toast.error('Failed: ' + err.message),
  });
}

export function useUpdateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...updates }: Partial<Workflow> & { id: string }) => 
      workflowsApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
    onError: (err: Error) => toast.error('Failed: ' + err.message),
  });
}

export function useDeleteWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => workflowsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast.success('Workflow deleted');
    },
    onError: (err: Error) => toast.error('Failed: ' + err.message),
  });
}

export function useTriggerWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, entityType, entityId }: { id: string; entityType: string; entityId: string }) => 
      workflowsApi.trigger(id, entityType, entityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
    onError: (err: Error) => toast.error('Failed: ' + err.message),
  });
}

// New: Add a workflow action mutation
export function useAddWorkflowAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (action: { workflow_id: string; action_type: string; action_config?: Record<string, unknown>; condition_config?: Record<string, unknown> | null; sort_order?: number }) => 
      workflowsApi.createAction(action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast.success('Workflow action added');
    },
    onError: (err: Error) => toast.error('Failed to add workflow action: ' + err.message),
  });
}

// New: Update a workflow action mutation
export function useUpdateWorkflowAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updates }: Partial<WorkflowAction> & { id: string }) => 
      workflowsApi.updateAction(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast.success('Workflow action updated');
    },
    onError: (err: Error) => toast.error('Failed to update workflow action: ' + err.message),
  });
}

// New: Delete a workflow action mutation
export function useDeleteWorkflowAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workflowsApi.deleteAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast.success('Workflow action deleted');
    },
    onError: (err: Error) => toast.error('Failed to delete workflow action: ' + err.message),
  });
}

// Get workflow executions
export function useWorkflowExecutions(workflowId?: string) {
  return useQuery({
    queryKey: ['workflow_executions', workflowId],
    queryFn: () => workflowsApi.getWorkflowExecutions(workflowId!),
    enabled: !!workflowId,
  });
}
