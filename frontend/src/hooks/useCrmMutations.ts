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
    onError: (error: Error) => toast.error('Failed to convert lead: ' + error.message),
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast.success('Deal updated successfully');
    },
    onError: (error: Error) => toast.error('Failed to update deal: ' + error.message),
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
    onError: (error: Error) => toast.error('Failed to delete deal: ' + error.message),
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead updated successfully');
    },
    onError: (error: any) => toast.error(`Failed to update lead: ${error?.message ?? error}`),
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
    onError: (error: any) => toast.error(`Failed to delete lead: ${error?.message ?? error}`),
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
    onError: (error: Error) => toast.error(`Failed to update contact: ${error.message}`),
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
    onError: (error: Error) => toast.error(`Failed to delete contact: ${error.message}`),
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
    onError: (error: Error) => toast.error(`Failed to update company: ${error.message}`),
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
    onError: (error: Error) => toast.error(`Failed to delete company: ${error.message}`),
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
    onError: (error: Error) => toast.error(`Failed to link contact: ${error.message}`),
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
    onError: (error: Error) => toast.error(`Failed to remove contact: ${error.message}`),
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
    onError: (error: Error) => toast.error(`Failed to add signing party: ${error.message}`),
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
    onError: (error: Error) => toast.error(`Failed to remove signing party: ${error.message}`),
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
    onError: (error: Error) => toast.error(`Failed to convert deal: ${error.message}`),
  });
}


