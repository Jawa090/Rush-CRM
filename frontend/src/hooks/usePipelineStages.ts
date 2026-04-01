import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { api } from '@/lib/api';

export interface PipelineStage {
  id: string;
  pipeline: string;
  stage_key: string;
  stage_label: string;
  sort_order: number;
  color: string;
}

export function usePipelineStages(pipeline = 'default') {
  return useQuery({
    queryKey: ['pipeline_stages', pipeline],
    queryFn: async () => {
      const data = await api.get<PipelineStage[]>('/leads/stages').catch(() => [] as PipelineStage[]);
      return data || [];
    },
  });
}

export function useCreatePipelineStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ stageName }: { stageName: string }) => {
      const data = await api.post<PipelineStage>('/leads/stages', { stageName }).catch(() => null);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline_stages'] });
      toast.success('Stage created successfully');
    },
    onError: (error: Error) => toast.error('Failed to create stage: ' + error.message),
  });
}
