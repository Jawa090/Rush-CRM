import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsApi, dealsApi, contactsApi, companiesApi, customersApi, vendorsApi, signingPartiesApi, productsApi, stockApi, warehousesApi, purchaseOrdersApi } from '@/lib/api';
import { toast } from 'sonner';

// Cache configuration for better performance
const GC_TIME = 5 * 60 * 1000; // 5 minutes (garbage collection time)
const STALE_TIME = 2 * 60 * 1000; // 2 minutes

export function useLeads(params?: { stage?: string; status?: string; search?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['leads', params],
    queryFn: async () => {
      const response = await leadsApi.getAll({
        ...params,
        page: params?.page || 1,
        limit: params?.limit || 50
      });
      return response.data;
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME, // Updated from cacheTime to gcTime
    refetchOnWindowFocus: true, // Enable refetch on window focus
    refetchOnMount: true, // Enable refetch on mount
    placeholderData: (previousData) => previousData, // Updated from keepPreviousData
  });
}

export function useLead(id: string) {
  return useQuery({
    queryKey: ['leads', id],
    queryFn: () => leadsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leadData: Record<string, unknown>) => {
      // Optimistic update
      const tempId = `temp-${Date.now()}`;
      const optimisticLead = { ...leadData, id: tempId, created_at: new Date().toISOString() };
      
      queryClient.setQueryData(['leads'], (old: any) => {
        if (!old?.data) return { data: [optimisticLead] };
        return { data: [optimisticLead, ...old.data] };
      });

      return leadsApi.create(leadData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead-stats'] });
      toast.success('Lead created successfully');
    },
    onError: (error: Error) => {
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.error('Failed to create lead: ' + error.message);
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) => 
      leadsApi.update(id, data),
    onSuccess: (updatedLead, { id }) => {
      // Invalidate all leads queries
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      // Invalidate specific lead query
      queryClient.invalidateQueries({ queryKey: ['leads', id] });
      // Invalidate lead stats
      queryClient.invalidateQueries({ queryKey: ['leads', 'stats'] });
      
      // Update the cache immediately for better UX
      queryClient.setQueryData(['leads', id], updatedLead);
      
      toast.success('Lead updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update lead: ' + error.message);
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => leadsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead deleted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete lead: ' + error.message);
    },
  });
}

// Stage/Status specific update hooks for better UX
export function useUpdateLeadStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: string }) => 
      leadsApi.updateStage(id, stage),
    onSuccess: (updatedLead, { id }) => {
      // Immediately update all related queries
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads', id] });
      queryClient.invalidateQueries({ queryKey: ['leads', 'stats'] });
      
      // Force refetch to ensure UI is updated
      queryClient.refetchQueries({ queryKey: ['leads'] });
      
      toast.success('Lead stage updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update lead stage: ' + error.message);
    },
  });
}

export function useLeadStats() {
  return useQuery({
    queryKey: ['leads', 'stats'],
    queryFn: () => leadsApi.getStats(),
    refetchInterval: 5000, // keep dashboard cards fresh
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });
}

export function useDeals(params?: { stage?: string; status?: string; search?: string }) {
  return useQuery({
    queryKey: ['deals', params],
    queryFn: async () => {
      const response = await dealsApi.getAll(params);
      return response.data;
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME, // Updated from cacheTime to gcTime
    refetchOnWindowFocus: true, // Enable refetch on window focus
    refetchOnMount: true, // Enable refetch on mount
    placeholderData: (previousData) => previousData, // Updated from keepPreviousData
  });
}

export function useDeal(id: string) {
  return useQuery({
    queryKey: ['deals', id],
    queryFn: () => dealsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dealData: Record<string, unknown>) => dealsApi.create(dealData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast.success('Deal created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create deal: ' + error.message);
    },
  });
}

export function useUpdateDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) => 
      dealsApi.update(id, data),
    onSuccess: (updatedDeal, { id }) => {
      // Invalidate all deals queries
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      // Invalidate specific deal query
      queryClient.invalidateQueries({ queryKey: ['deals', id] });
      // Invalidate deal stats
      queryClient.invalidateQueries({ queryKey: ['deals', 'stats'] });
      
      // Update the cache immediately for better UX
      queryClient.setQueryData(['deals', id], updatedDeal);
      
      toast.success('Deal updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update deal: ' + error.message);
    },
  });
}

export function useDeleteDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => dealsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast.success('Deal deleted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete deal: ' + error.message);
    },
  });
}

// Stage/Status specific update hooks for better UX
export function useUpdateDealStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: string }) => 
      dealsApi.updateStage(id, stage),
    onSuccess: (updatedDeal, { id }) => {
      // Immediately update all related queries
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deals', id] });
      queryClient.invalidateQueries({ queryKey: ['deals', 'stats'] });
      
      // Force refetch to ensure UI is updated
      queryClient.refetchQueries({ queryKey: ['deals'] });
      
      toast.success('Deal stage updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update deal stage: ' + error.message);
    },
  });
}

export function useUpdateDealStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      dealsApi.updateStatus(id, status),
    onSuccess: (updatedDeal, { id }) => {
      // Immediately update all related queries
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deals', id] });
      queryClient.invalidateQueries({ queryKey: ['deals', 'stats'] });
      
      // Force refetch to ensure UI is updated
      queryClient.refetchQueries({ queryKey: ['deals'] });
      
      toast.success('Deal status updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update deal status: ' + error.message);
    },
  });
}

export function useDealStats() {
  return useQuery({
    queryKey: ['deals', 'stats'],
    queryFn: () => dealsApi.getStats(),
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });
}

export function useContacts(params?: { search?: string; companyId?: string }) {
  return useQuery({
    queryKey: ['contacts', params],
    queryFn: async () => {
      const response = await contactsApi.getAll(params);
      return response.data;
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    placeholderData: (previousData) => previousData,
  });
}

export function useContact(id: string) {
  return useQuery({
    queryKey: ['contacts', id],
    queryFn: () => contactsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contactData: Record<string, unknown>) => contactsApi.create(contactData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Contact created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create contact: ' + error.message);
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) => 
      contactsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Contact updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update contact: ' + error.message);
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => contactsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Contact deleted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete contact: ' + error.message);
    },
  });
}

export function useCompanies(params?: { search?: string; industry?: string }) {
  return useQuery({
    queryKey: ['companies', params],
    queryFn: async () => {
      const response = await companiesApi.getAll(params);
      return response.data;
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    placeholderData: (previousData) => previousData,
  });
}

export function useCompany(id: string) {
  return useQuery({
    queryKey: ['companies', id],
    queryFn: () => companiesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (companyData: Record<string, unknown>) => companiesApi.create(companyData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Company created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create company: ' + error.message);
    },
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) => 
      companiesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Company updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update company: ' + error.message);
    },
  });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => companiesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Company deleted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete company: ' + error.message);
    },
  });
}

// Customers hooks
export function useCustomers(params?: { search?: string; status?: string }) {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: async () => {
      const response = await customersApi.getAll(params);
      return response.data;
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    placeholderData: (previousData) => previousData,
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: () => customersApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => customersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer created successfully');
    },
    onError: (error: Error) => toast.error('Failed to create customer: ' + error.message),
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) => 
      customersApi.update(id, data),
    onSuccess: (updatedCustomer, { id }) => {
      // Invalidate all customers queries
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      // Invalidate specific customer query
      queryClient.invalidateQueries({ queryKey: ['customers', id] });
      
      // Update the cache immediately for better UX
      queryClient.setQueryData(['customers', id], updatedCustomer);
      
      toast.success('Customer updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update customer: ' + error.message);
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer deleted successfully');
    },
    onError: (error: Error) => toast.error('Failed to delete customer: ' + error.message),
  });
}

// Vendors hooks
export function useVendors(params?: { search?: string }) {
  return useQuery({
    queryKey: ['vendors', params],
    queryFn: async () => {
      const response = await vendorsApi.getAll(params) as any;
      // Handle backend response structure - vendors API returns { data: [], pagination: {} }
      return response?.data || response || [];
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    placeholderData: (previousData) => previousData,
  });
}

export function useVendor(id: string) {
  return useQuery({
    queryKey: ['vendors', id],
    queryFn: () => vendorsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vendorData: Record<string, unknown>) => vendorsApi.create(vendorData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast.success('Vendor created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create vendor: ' + error.message);
    },
  });
}

export function useUpdateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) => 
      vendorsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast.success('Vendor updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update vendor: ' + error.message);
    },
  });
}

export function useDeleteVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => vendorsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast.success('Vendor deleted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete vendor: ' + error.message);
    },
  });
}

// Signing Parties hooks
export function useSigningParties(params?: { search?: string; companyId?: string }) {
  return useQuery({
    queryKey: ['signing-parties', params],
    queryFn: async () => {
      const response = await signingPartiesApi.getAll(params);
      return response.data;
    },
  });
}

export function useSigningParty(id: string) {
  return useQuery({
    queryKey: ['signing-parties', id],
    queryFn: () => signingPartiesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateSigningParty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) => signingPartiesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signing-parties'] });
      toast.success('Signing party created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create signing party: ' + error.message);
    },
  });
}

export function useUpdateSigningParty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) => 
      signingPartiesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signing-parties'] });
      toast.success('Signing party updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update signing party: ' + error.message);
    },
  });
}

export function useDeleteSigningParty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => signingPartiesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signing-parties'] });
      toast.success('Signing party deleted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete signing party: ' + error.message);
    },
  });
}

// ============================================
// INVENTORY MANAGEMENT HOOKS
// ============================================

// Products hooks
export function useProducts(params?: { search?: string; category?: string }) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      const response = await productsApi.getAll(params) as any;
      return response?.data || response || [];
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    placeholderData: (previousData) => previousData,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => productsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (productData: Record<string, unknown>) => productsApi.create(productData),
    onSuccess: (newProduct) => {
      // Invalidate and refetch products list
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      
      // Force immediate refetch
      queryClient.refetchQueries({ queryKey: ['products'] });
      
      toast.success('Product created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create product: ' + error.message);
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) => 
      productsApi.update(id, data),
    onSuccess: (updatedProduct, { id }) => {
      // Invalidate all products queries
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', id] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      
      // Force immediate refetch
      queryClient.refetchQueries({ queryKey: ['products'] });
      
      // Update specific product cache
      queryClient.setQueryData(['products', id], updatedProduct);
      
      toast.success('Product updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update product: ' + error.message);
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: (_, deletedId) => {
      // Invalidate and refetch all related queries
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      queryClient.invalidateQueries({ queryKey: ['stock', 'alerts'] });
      
      // Force immediate refetch
      queryClient.refetchQueries({ queryKey: ['products'] });
      queryClient.refetchQueries({ queryKey: ['stock'] });
      
      // Remove specific product from cache
      queryClient.removeQueries({ queryKey: ['products', deletedId] });
      
      toast.success('Product deleted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete product: ' + error.message);
    },
  });
}

// Stock hooks
export function useStock(params?: { productId?: string; warehouseId?: string }) {
  return useQuery({
    queryKey: ['stock', params],
    queryFn: async () => {
      const response = await stockApi.getAll(params) as any;
      return Array.isArray(response) ? response : response?.data || [];
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    placeholderData: (previousData) => previousData,
  });
}

export function useStockAlerts() {
  return useQuery({
    queryKey: ['stock', 'alerts'],
    queryFn: () => stockApi.getAlerts(),
    refetchInterval: 30000, // Refresh every 30 seconds for alerts
  });
}

export function useStockHistory(productId: string) {
  return useQuery({
    queryKey: ['stock', 'history', productId],
    queryFn: () => stockApi.getHistory(productId),
    enabled: !!productId,
  });
}

export function useAdjustStock() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (adjustmentData: { productId: string; warehouseId: string; quantity: number; reason?: string }) => 
      stockApi.adjust(adjustmentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stock', 'alerts'] });
      toast.success('Stock adjusted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to adjust stock: ' + error.message);
    },
  });
}

export function useTransferStock() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (transferData: { productId: string; fromWarehouseId: string; toWarehouseId: string; quantity: number; reason?: string }) => 
      stockApi.transfer(transferData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      toast.success('Stock transferred successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to transfer stock: ' + error.message);
    },
  });
}

// Warehouses hooks
export function useWarehouses(params?: { search?: string; status?: string }) {
  return useQuery({
    queryKey: ['warehouses', params],
    queryFn: async () => {
      const response = await warehousesApi.getAll(params) as any;
      return response?.data || response || [];
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    placeholderData: (previousData) => previousData,
  });
}

export function useWarehouse(id: string) {
  return useQuery({
    queryKey: ['warehouses', id],
    queryFn: () => warehousesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (warehouseData: Record<string, unknown>) => warehousesApi.create(warehouseData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      toast.success('Warehouse created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create warehouse: ' + error.message);
    },
  });
}

export function useUpdateWarehouse() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) => 
      warehousesApi.update(id, data),
    onSuccess: (updatedWarehouse, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      queryClient.invalidateQueries({ queryKey: ['warehouses', id] });
      queryClient.setQueryData(['warehouses', id], updatedWarehouse);
      toast.success('Warehouse updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update warehouse: ' + error.message);
    },
  });
}

export function useDeleteWarehouse() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => warehousesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      toast.success('Warehouse deleted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete warehouse: ' + error.message);
    },
  });
}

// Purchase Orders hooks
export function usePurchaseOrders(params?: { status?: string; vendorId?: string }) {
  return useQuery({
    queryKey: ['purchase-orders', params],
    queryFn: async () => {
      const response = await purchaseOrdersApi.getAll(params) as any;
      return Array.isArray(response) ? response : response?.data || [];
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    placeholderData: (previousData) => previousData,
  });
}

export function usePurchaseOrder(id: string) {
  return useQuery({
    queryKey: ['purchase-orders', id],
    queryFn: () => purchaseOrdersApi.getById(id),
    enabled: !!id,
  });
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (poData: any) => purchaseOrdersApi.create(poData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast.success('Purchase order created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create purchase order: ' + error.message);
    },
  });
}

export function useUpdatePurchaseOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) => 
      purchaseOrdersApi.update(id, data),
    onSuccess: (updatedPO, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-orders', id] });
      queryClient.setQueryData(['purchase-orders', id], updatedPO);
      toast.success('Purchase order updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update purchase order: ' + error.message);
    },
  });
}

export function useUpdatePurchaseOrderStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      purchaseOrdersApi.updateStatus(id, status),
    onSuccess: (updatedPO, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-orders', id] });
      queryClient.invalidateQueries({ queryKey: ['stock'] }); // Refresh stock if PO received
      queryClient.refetchQueries({ queryKey: ['purchase-orders'] });
      toast.success('Purchase order status updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update purchase order status: ' + error.message);
    },
  });
}

export function useDeletePurchaseOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => purchaseOrdersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast.success('Purchase order deleted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete purchase order: ' + error.message);
    },
  });
}