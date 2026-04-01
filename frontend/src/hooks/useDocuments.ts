import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

export function useDocuments(params?: { search?: string; status?: string; type?: string }) {
  return useQuery({
    queryKey: ['documents', params],
    queryFn: async () => {
      const response = await documentsApi.getAll(params);
      return response;
    },
  });
}

export function useVaultDocuments(params?: { search?: string; type?: string }) {
  return useQuery({
    queryKey: ['documents-vault', params],
    queryFn: async () => {
      const response = await documentsApi.getVault(params);
      return response;
    },
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: ['documents', id],
    queryFn: () => documentsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (documentData: Record<string, unknown>) => documentsApi.create(documentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['documents-vault'] });
      toast({
        title: "Document created",
        description: "Document has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create document",
        description: error?.message || "Please try again",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) => 
      documentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['documents-vault'] });
      toast({
        title: "Document updated",
        description: "Document has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update document",
        description: error?.message || "Please try again",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => documentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['documents-vault'] });
      toast({
        title: "Document deleted",
        description: "Document has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete document",
        description: error?.message || "Please try again",
        variant: "destructive",
      });
    },
  });
}