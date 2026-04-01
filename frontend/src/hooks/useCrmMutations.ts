import { useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsApi, dealsApi, contactsApi, companiesApi } from '@/lib/api';
import { toast } from 'sonner';

export function useConvertLeadToDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leadId: string) => {
      const deal = await leadsApi.convertToDeal(leadId);
      return deal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast.success('Lead converted to deal successfully');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

// New: Update a Deal mutation
export function useUpdateDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: string; [key: string]: any }) => {
      const { id, ...rest } = payload;
      return dealsApi.update(id, rest);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deal', variables.id] });
      toast.success('Deal updated successfully');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

// New: Delete a Deal mutation
export function useDeleteDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dealId: string) => dealsApi.delete(dealId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast.success('Deal deleted');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
// New: update lead mutation (used by Kanban to move lead between columns)
export function useUpdateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: string; status?: string; stage?: string; [key: string]: any }) => {
      const { id, ...rest } = payload;
      return (await leadsApi.update(id, rest as any)) as any;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: [ 'leads' ] });
      queryClient.invalidateQueries({ queryKey: [ 'lead', data.id ] });
      toast.success('Lead updated successfully');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error || error.message || "Failed to update lead";
      toast.error(msg);
    },
  });
}

// New: delete lead mutation
export function useDeleteLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (leadId: string) => {
      return leadsApi.delete(leadId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead deleted');
    },
    onError: (error: any) => toast.error(error?.message ?? error),
  });
}

// Update a Contact mutation
export function useUpdateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: string; [key: string]: any }) => {
      const { id, ...rest } = payload;
      return contactsApi.update(id, rest as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Contact updated');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

// Delete a Contact mutation
export function useDeleteContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (contactId: string) => contactsApi.delete(contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Contact deleted');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

// Update a Company mutation
export function useUpdateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: string; [key: string]: any }) => {
      const { id, ...rest } = payload;
      return companiesApi.update(id, rest as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Company updated');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

// Delete a Company mutation
export function useDeleteCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (companyId: string) => companiesApi.delete(companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Company deleted');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useLinkDealContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { dealId: string; contactId: string; role?: string; primaryContact?: boolean }) =>
      dealsApi.addContact(payload.dealId, { contactId: payload.contactId, role: payload.role, primaryContact: payload.primaryContact }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast.success('Contact linked to deal');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUnlinkDealContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ dealId, contactId }: { dealId: string; contactId: string }) => dealsApi.removeContact(dealId, contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast.success('Contact removed from deal');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useLinkSigningParty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ dealId, contactId, role }: { dealId: string; contactId: string; role?: string }) =>
      dealsApi.addSigningParty(dealId, { contactId, role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast.success('Signing party added');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUnlinkSigningParty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ dealId, contactId }: { dealId: string; contactId: string }) => dealsApi.removeSigningParty(dealId, contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast.success('Signing party removed');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useConvertDealToCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dealId: string) => dealsApi.convertToCustomer(dealId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Deal converted to customer');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}


