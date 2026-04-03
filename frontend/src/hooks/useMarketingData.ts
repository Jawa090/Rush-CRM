import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { marketingApi } from '@/lib/api';
import { toast } from 'sonner';

export interface MarketingCampaign {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  status: string;
  campaign_type: string;
  channel: string;
  subject_line: string | null;
  from_name: string | null;
  from_email: string | null;
  list_id: string | null;
  budget: number;
  start_date: string | null;
  end_date: string | null;
  sent_count: number;
  opened_count: number;
  clicked_count: number;
  total_conversions: number;
  created_at: string;
}

export interface MarketingList {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  list_type: string;
  is_active: boolean;
  member_count: number;
  created_at: string;
}

export interface MarketingForm {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  form_type: string;
  fields: unknown[];
  target_list_id: string | null;
  lifecycle_stage_on_submit: string;
  is_active: boolean;
  submission_count: number;
  success_message: string | null;
  redirect_url: string | null;
  created_at: string;
}

export interface MarketingSequence {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  status: string;
  trigger_type: string;
  is_active: boolean;
  enrollment_count: number;
  steps: unknown[];
  created_at: string;
}

export function useMarketingCampaigns() {
  return useQuery({
    queryKey: ['marketing_campaigns'],
    queryFn: async () => {
      const response: any = await marketingApi.getCampaigns();
      // Backend returns { data: [...] }, so we extract the data array
      return Array.isArray(response) ? response : (response.data || []);
    },
  });
}

export function useMarketingDashboardStats() {
  return useQuery({
    queryKey: ['marketing_dashboard_stats'],
    queryFn: async () => {
      const response: any = await marketingApi.getDashboardStats();
      return response.data || response || {};
    },
  });
}

export function useCreateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (campaign: { name: string; description?: string; status?: string; startDate?: string; endDate?: string; budget?: number; listId?: string }) => {
      return marketingApi.createCampaign(campaign);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['marketing_campaigns'] }); toast.success('Campaign created'); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MarketingCampaign> & { id: string }) => {
      return marketingApi.updateCampaign(id, updates);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['marketing_campaigns'] }); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => marketingApi.deleteCampaign(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['marketing_campaigns'] }); toast.success('Campaign deleted'); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useMarketingLists() {
  return useQuery({
    queryKey: ['marketing_lists'],
    queryFn: async () => {
      const response: any = await marketingApi.getLists();
      return Array.isArray(response) ? response : (response.data || []);
    },
  });
}

export function useCreateList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (list: { name: string; description?: string }) => {
      return marketingApi.createList(list);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['marketing_lists'] }); toast.success('List created'); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => marketingApi.deleteList(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['marketing_lists'] }); toast.success('List deleted'); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useMarketingForms() {
  return useQuery({
    queryKey: ['marketing_forms'],
    queryFn: async () => {
      const response: any = await marketingApi.getForms();
      return Array.isArray(response) ? response : (response.data || []);
    },
  });
}

export function useCreateForm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (form: { name: string; fields?: unknown[]; successMessage?: string; redirectUrl?: string }) => {
      return marketingApi.createForm(form);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['marketing_forms'] }); toast.success('Form created'); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useFormSubmissions(formId?: string) {
  return useQuery({
    queryKey: ['marketing_form_submissions', formId],
    queryFn: async () => {
      return [] as any[];
    },
  });
}

export function useDeleteForm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => marketingApi.deleteForm(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['marketing_forms'] });
      toast.success('Form deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useCampaignEvents(campaignId?: string) {
  return useQuery({
    queryKey: ['marketing_campaign_events', campaignId],
    queryFn: async () => {
      return [] as any[];
    },
  });
}

export function useMarketingSequences() {
  return useQuery({
    queryKey: ['marketing_sequences'],
    queryFn: async () => {
      const response: any = await marketingApi.getSequences();
      return Array.isArray(response) ? response : (response.data || []);
    },
  });
}

export function useCreateSequence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (sequence: { name: string; description?: string; trigger_type: string; steps?: unknown[] }) => {
      return marketingApi.createSequence(sequence);
    },
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['marketing_sequences'] }); 
      toast.success('Sequence created successfully'); 
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteSequence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => marketingApi.deleteSequence(id),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['marketing_sequences'] }); 
      toast.success('Sequence deleted'); 
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateSequence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; is_active?: boolean; status?: string }) =>
      marketingApi.updateSequence(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['marketing_sequences'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
