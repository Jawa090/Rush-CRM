import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

export interface UniboxEmail {
  id: string;
  org_id: string;
  external_id?: string;
  sender_email: string;
  sender_name: string | null;
  subject: string | null;
  body_text: string | null;
  body_html?: string | null;
  body?: string | null;
  phone?: string | null;
  status: string;
  priority?: string;
  tags?: string[];
  attachments?: any[];
  thread_id?: string;
  message_id?: string;
  in_reply_to?: string;
  is_read: boolean;
  is_starred: boolean;
  is_archived: boolean;
  interaction_notes?: string | null;
  converted_to_lead_id: string | null;
  received_at: string;
  created_at: string;
  updated_at: string;
}

export interface UniboxStats {
  total: number;
  unread: number;
  starred: number;
  leads: number;
  interested: number;
  meetings: number;
  converted: number;
  converted_to_leads: number;
}

const UNIBOX_STATUSES = [
  "Lead",
  "Interested",
  "Meeting Booked",
  "Closed",
  "Out of Office",
  "Not Interested",
  "Wrong Person",
  "Converted",
] as const;

export type UniboxStatus = (typeof UNIBOX_STATUSES)[number];

export { UNIBOX_STATUSES };

export function useUniboxEmails(filters: {
  status?: string;
  search?: string;
  starred?: boolean;
  unread?: boolean;
  priority?: string;
} = {}) {
  const queryClient = useQueryClient();

  const emailsQuery = useQuery({
    queryKey: ["unibox-emails", filters],
    queryFn: async () => {
      const params: Record<string, any> = {};
      if (filters.status && filters.status !== "All") params.status = filters.status;
      if (filters.search) params.search = filters.search;
      if (filters.starred) params.starred = 'true';
      if (filters.unread) params.unread = 'true';
      if (filters.priority && filters.priority !== 'all') params.priority = filters.priority;
      
      return api.get("/unibox/emails", params);
    },
    select: (data: any) => {
      if (data.emails) {
        return {
          emails: data.emails.map((email: any) => ({
            ...email,
            body_text: email.body_text ?? email.body ?? "",
            body_html: email.body_html ?? null,
            is_read: email.is_read ?? false,
            is_starred: email.is_starred ?? false,
            is_archived: email.is_archived ?? false,
            priority: email.priority ?? 'normal',
            tags: email.tags ?? [],
            attachments: email.attachments ?? [],
          })) as UniboxEmail[],
          total: data.total,
          page: data.page,
          totalPages: data.totalPages
        };
      }
      // Fallback for old API response format
      return {
        emails: (data || []).map((email: any) => ({
          ...email,
          body_text: email.body_text ?? email.body ?? "",
          body_html: email.body_html ?? null,
          is_read: email.is_read ?? false,
          is_starred: email.is_starred ?? false,
          is_archived: email.is_archived ?? false,
          priority: email.priority ?? 'normal',
          tags: email.tags ?? [],
          attachments: email.attachments ?? [],
        })) as UniboxEmail[],
        total: data?.length || 0,
        page: 1,
        totalPages: 1
      };
    },
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 10000,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ 
      emailId, 
      status, 
      interaction_notes, 
      priority, 
      tags 
    }: { 
      emailId: string; 
      status: string; 
      interaction_notes?: string;
      priority?: string;
      tags?: string[];
    }) => {
      return api.patch(`/unibox/emails/${emailId}/status`, { 
        status, 
        interaction_notes, 
        priority, 
        tags 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unibox-emails"] });
      queryClient.invalidateQueries({ queryKey: ["unibox-stats"] });
      toast.success('Status updated');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const toggleStarred = useMutation({
    mutationFn: async ({ emailId, is_starred }: { emailId: string; is_starred: boolean }) => {
      return api.patch(`/unibox/emails/${emailId}/starred`, { is_starred });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unibox-emails"] });
      toast.success('Email starred status updated');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const markAsRead = useMutation({
    mutationFn: async ({ emailId, is_read }: { emailId: string; is_read: boolean }) => {
      return api.patch(`/unibox/emails/${emailId}/read`, { is_read });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unibox-emails"] });
      queryClient.invalidateQueries({ queryKey: ["unibox-stats"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const toggleArchive = useMutation({
    mutationFn: async ({ emailId, is_archived }: { emailId: string; is_archived: boolean }) => {
      return api.patch(`/unibox/emails/${emailId}/archive`, { is_archived });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unibox-emails"] });
      toast.success('Email archived status updated');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const convertToLead = useMutation({
    mutationFn: async ({
      emailId,
      leadData,
    }: {
      emailId: string;
      leadData: {
        title: string;
        company_name: string;
        company_email: string;
        company_phone: string;
        interaction_notes: string;
      };
    }) => {
      return api.post(`/unibox/emails/${emailId}/convert-to-lead`, leadData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unibox-emails"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["unibox-stats"] });
      toast.success("Lead created successfully");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return {
    ...emailsQuery.data,
    emails: emailsQuery.data?.emails || [],
    isLoading: emailsQuery.isLoading || emailsQuery.isPending,
    updateStatus,
    toggleStarred,
    markAsRead,
    toggleArchive,
    convertToLead,
  };
}

export function useUniboxStats() {
  return useQuery({
    queryKey: ["unibox-stats"],
    queryFn: () => api.get<UniboxStats>("/unibox/stats"),
    refetchInterval: 60000,
    staleTime: 30000,
  });
}

export function useUniboxTemplates() {
  return useQuery({
    queryKey: ["unibox-templates"],
    queryFn: () => api.get("/unibox/templates"),
    staleTime: 300000, // 5 minutes
  });
}
