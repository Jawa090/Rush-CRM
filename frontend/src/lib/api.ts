const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    
    const headers: HeadersInit = {
      ...options.headers,
    };

    // Only set Content-Type to application/json if body is not FormData
    if (!(options.body instanceof FormData)) {
      (headers as Record<string, string>)['Content-Type'] = 'application/json';
    }

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.setToken(null);
      window.location.href = '/auth';
      throw new Error('Unauthorized');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || 'Request failed');
    }

    return data;
  }

  get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    if (params) {
      // Filter out undefined values and convert to string
      const filteredParams: Record<string, string> = {};
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== 'undefined') {
          filteredParams[key] = String(value);
        }
      });
      
      if (Object.keys(filteredParams).length > 0) {
        const searchParams = new URLSearchParams(filteredParams).toString();
        return this.request<T>(`${endpoint}?${searchParams}`);
      }
    }
    return this.request<T>(endpoint);
  }

  post<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
      ...options,
    });
  }

  put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient();

export const authApi = {
  login: (email: string, password: string) => api.post<{ token: string; user: any }>('/auth/login', { email, password }),
  register: (data: { email: string; password: string; fullName: string; orgName?: string }) => api.post('/auth/register', data),
  getProfile: () => api.get<any>('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  changePassword: (data: { currentPassword: string; newPassword: string }) => api.post('/auth/change-password', data),
};

export const emailApi = {
  getMailboxes: () => api.get<any[]>('/email/mailboxes'),
  createMailbox: (data: any) => api.post<any>('/email/mailboxes', data),
  deleteMailbox: (id: string) => api.delete(`/email/mailboxes/${id}`),
  sync: (action: string, payload?: Record<string, any>) => api.post('/email/sync', { action, ...(payload || {}) }),
  getMessages: (params?: { folder?: string; starred?: boolean; mailbox_id?: string; search?: string }) => api.get<any[]>('/email/messages', params),
  updateMessage: (id: string, update: any) => api.patch(`/email/messages/${id}`, update),
  bulkUpdateMessages: (ids: string[], update: any) => api.post('/email/messages/bulk', { ids, update }),
  getCounts: (mailboxId?: string) => api.get<Record<string, number>>('/email/counts', mailboxId ? { mailbox_id: mailboxId } : undefined),
};

export const leadsApi = {
  getAll: (params?: { page?: number; limit?: number; stage?: string; status?: string; search?: string }) => 
    api.get<{ data: any[]; pagination: any }>('/leads', params),
  getById: (id: string) => api.get<any>(`/leads/${id}`),
  create: (data: any) => api.post<any>('/leads', data),
  update: (id: string, data: any) => api.put<any>(`/leads/${id}`, data),
  updateStage: (id: string, stage: string) => api.patch<any>(`/leads/${id}/stage`, { stage }),
  delete: (id: string) => api.delete(`/leads/${id}`),
  getStats: () => api.get<any>('/leads/stats'),
  convertToDeal: (id: string) => api.post<any>(`/leads/${id}/convert-to-deal`, {}),
  importLeads: (leads: any[]) => api.post<any>('/leads/import', { leads }),
};

export const dealsApi = {
  getAll: (params?: { page?: number; limit?: number; stage?: string; status?: string; search?: string }) => 
    api.get<{ data: any[]; pagination: any }>('/deals', params),
  getById: (id: string) => api.get<any>(`/deals/${id}`),
  create: (data: any) => api.post<any>('/deals', data),
  update: (id: string, data: any) => api.put<any>(`/deals/${id}`, data),
  updateStage: (id: string, stage: string) => api.patch<any>(`/deals/${id}/stage`, { stage }),
  updateStatus: (id: string, status: string) => api.patch<any>(`/deals/${id}/status`, { status }),
  addContact: (id: string, payload: { contactId: string; role?: string; primaryContact?: boolean }) => api.post<any>(`/deals/${id}/contacts`, payload),
  removeContact: (id: string, contactId: string) => api.delete(`/deals/${id}/contacts/${contactId}`),
  addSigningParty: (id: string, payload: { contactId: string; role?: string }) => api.post<any>(`/deals/${id}/signing-parties`, payload),
  removeSigningParty: (id: string, contactId: string) => api.delete(`/deals/${id}/signing-parties/${contactId}`),
  convertToCustomer: (id: string) => api.post<any>(`/deals/${id}/convert-to-customer`, {}),
  delete: (id: string) => api.delete(`/deals/${id}`),
  getStats: () => api.get<any>('/deals/stats'),
};

export const contactsApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string; companyId?: string }) => 
    api.get<{ data: any[]; pagination: any }>('/contacts', params),
  getById: (id: string) => api.get<any>(`/contacts/${id}`),
  create: (data: any) => api.post<any>('/contacts', data),
  update: (id: string, data: any) => api.put<any>(`/contacts/${id}`, data),
  delete: (id: string) => api.delete(`/contacts/${id}`),
};

export const companiesApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string; industry?: string }) => 
    api.get<{ data: any[]; pagination: any }>('/companies', params),
  getById: (id: string) => api.get<any>(`/companies/${id}`),
  create: (data: any) => api.post<any>('/companies', data),
  update: (id: string, data: any) => api.put<any>(`/companies/${id}`, data),
  delete: (id: string) => api.delete(`/companies/${id}`),
};

export const customersApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string; status?: string }) =>
    api.get<{ data: any[]; pagination: any }>('/customers', params),
  getById: (id: string) => api.get<any>(`/customers/${id}`),
  create: (data: any) => api.post<any>('/customers', data),
  update: (id: string, data: any) => api.put<any>(`/customers/${id}`, data),
  delete: (id: string) => api.delete(`/customers/${id}`),
};

export const signingPartiesApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string; companyId?: string }) => 
    api.get<{ data: any[]; pagination: any }>('/signing-parties', params),
  getById: (id: string) => api.get<any>(`/signing-parties/${id}`),
  create: (data: any) => api.post<any>('/signing-parties', data),
  update: (id: string, data: any) => api.put<any>(`/signing-parties/${id}`, data),
  delete: (id: string) => api.delete(`/signing-parties/${id}`),
};

export const employeesApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string; department?: string; status?: string }) => 
    api.get<{ data: any[]; pagination: any }>('/employees', params),
  getById: (id: string) => api.get<any>(`/employees/${id}`),
  create: (data: any) => api.post<any>('/employees', data),
  update: (id: string, data: any) => api.put<any>(`/employees/${id}`, data),
  delete: (id: string) => api.delete(`/employees/${id}`),
  getStats: () => api.get<any>('/employees/stats'),
};

export const attendanceApi = {
  getAll: (params?: { date?: string; userId?: string; employee_id?: string; status?: string; limit?: number }) => 
    api.get<{ data: any[]; pagination: any }>('/attendance', params),
  getStats: (params?: { startDate?: string; endDate?: string; date?: string }) => api.get<any>('/attendance/stats', params),
  clockIn: () => api.post<any>('/attendance/clock-in'),
  clockOut: () => api.post<any>('/attendance/clock-out'),
  getById: (id: string) => api.get<any>(`/attendance/${id}`),
  create: (data: any) => api.post<any>('/attendance', data),
  bulkCreate: (records: any[]) => api.post<any[]>('/attendance/bulk', { records }),
  update: (id: string, data: any) => api.put<any>(`/attendance/${id}`, data),
  delete: (id: string) => api.delete(`/attendance/${id}`),
};

export const leaveApi = {
  getAll: (params?: { status?: string; userId?: string; employee_id?: string; limit?: number }) => 
    api.get<{ data: any[]; pagination: any }>('/leave', params),
  getBalance: (params?: { userId?: string; employee_id?: string }) => api.get<{ data: any[] }>('/leave/balance', params),
  getTypes: () => api.get<{ data: any[] }>('/leave/types'),
  createType: (data: { name: string; days_allowed: number; description?: string }) => api.post<any>('/leave/types', data),
  getById: (id: string) => api.get<any>(`/leave/${id}`),
  create: (data: { employee_id: string; leave_type_id: string; start_date: string; end_date: string; reason?: string }) => 
    api.post<any>('/leave', data),
  createRequest: (data: { leaveTypeId: string; startDate: string; endDate: string; reason?: string }) => 
    api.post<any>('/leave/request', data),
  update: (id: string, data: any) => api.put<any>(`/leave/${id}`, data),
  approve: (id: string) => api.put<any>(`/leave/${id}/approve`),
  reject: (id: string, reason?: string) => api.put<any>(`/leave/${id}/reject`, { rejectionReason: reason }),
  delete: (id: string) => api.delete(`/leave/${id}`),
};

export const payrollApi = {
  getSalarySlips: (params?: { month?: number; year?: number; employee_id?: string }) => 
    api.get<{ data: any[] }>('/payroll/slips', params),
  getSalarySlipById: (id: string) => api.get<{ data: any }>(`/payroll/slips/${id}`),
  generateSalarySlip: (data: { employee_id: string; month: number; year: number; basic_salary: number; earnings: any[]; deductions: any[] }) => 
    api.post<{ data: any }>('/payroll/slips', data),
  deleteSalarySlip: (id: string) => api.delete(`/payroll/slips/${id}`),
};

export const productsApi = {
  getAll: (params?: { search?: string; category?: string }) => 
    api.get<{ data: any[]; pagination: any }>('/products', params),
  getCategories: () => api.get<string[]>('/products/categories'),
  getById: (id: string) => api.get<any>(`/products/${id}`),
  create: (data: any) => api.post<any>('/products', data),
  update: (id: string, data: any) => api.put<any>(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
};

export const stockApi = {
  getAll: (params?: { page?: number; limit?: number; productId?: string; warehouseId?: string }) =>
    api.get<any[]>('/stock', params),
  getAlerts: () => api.get<any[]>('/stock/alerts'),
  adjust: (data: { productId: string; warehouseId: string; quantity: number; reason?: string; type?: string }) =>
    api.post<any>('/stock/adjust', data),
  transfer: (data: { productId: string; fromWarehouseId: string; toWarehouseId: string; quantity: number }) =>
    api.post<any>('/stock/transfer', data),
  getHistory: (productId: string, limit?: number) => api.get<any[]>(`/stock/history/${productId}`, limit ? { limit } : undefined),
};

export const vendorsApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<{ data: any[]; pagination?: any }>('/vendors', params),
  getById: (id: string) => api.get<any>(`/vendors/${id}`),
  create: (data: any) => api.post<any>('/vendors', data),
  update: (id: string, data: any) => api.put<any>(`/vendors/${id}`, data),
  delete: (id: string) => api.delete(`/vendors/${id}`),
};

export const documentsApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string; status?: string; type?: string }) =>
    api.get<{ data: any[]; pagination: any }>('/documents', params),
  getVault: (params?: { page?: number; limit?: number; search?: string; type?: string }) =>
    api.get<{ data: any[]; pagination: any }>('/documents/vault', params),
  getById: (id: string) => api.get<any>(`/documents/${id}`),
  create: (data: any) => api.post<any>('/documents', data),
  update: (id: string, data: any) => api.put<any>(`/documents/${id}`, data),
  delete: (id: string) => api.delete(`/documents/${id}`),
};

export const warehousesApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string; status?: string }) =>
    api.get<{ data: any[]; pagination: any }>('/warehouses', params),
  getById: (id: string) => api.get<any>(`/warehouses/${id}`),
  create: (data: any) => api.post<any>('/warehouses', data),
  update: (id: string, data: any) => api.put<any>(`/warehouses/${id}`, data),
  delete: (id: string) => api.delete(`/warehouses/${id}`),
  getStats: () => api.get<any>('/warehouses/stats'),
};

export const purchaseOrdersApi = {
  getAll: (params?: { page?: number; limit?: number; status?: string; vendorId?: string }) =>
    api.get<any[]>('/purchase-orders', params),
  getById: (id: string) => api.get<any>(`/purchase-orders/${id}`),
  create: (data: { vendorId: string; items: Array<{ productId: string; quantity: number; unitPrice: number }>; notes?: string; expectedDeliveryDate?: string }) =>
    api.post<any>('/purchase-orders', data),
  update: (id: string, data: { notes?: string; expectedDeliveryDate?: string }) =>
    api.put<any>(`/purchase-orders/${id}`, data),
  updateStatus: (id: string, status: string) => api.patch<any>(`/purchase-orders/${id}/status`, { status }),
  delete: (id: string) => api.delete(`/purchase-orders/${id}`),
};

export const projectsApi = {
  getAll: (params?: { status?: string }) => api.get<any[]>('/projects', params),
  getById: (id: string) => api.get<any>(`/projects/${id}`),
  create: (data: any) => api.post<any>('/projects', data),
  update: (id: string, data: any) => api.put<any>(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
  getStats: () => api.get<any>('/projects/stats'),
};

const normalizeTaskFilters = (params?: { project_id?: string; projectId?: string; status?: string; assigned_to?: string; assignedTo?: string }) => {
  if (!params) return undefined;
  
  const normalized: Record<string, string> = {};
  
  // Only add parameters that have actual values (not undefined or empty strings)
  if (params.projectId || params.project_id) {
    normalized.projectId = params.projectId || params.project_id!;
  }
  
  if (params.status && params.status !== 'undefined') {
    normalized.status = params.status;
  }
  
  if ((params.assignedTo || params.assigned_to) && (params.assignedTo !== 'undefined' && params.assigned_to !== 'undefined')) {
    normalized.assignedTo = params.assignedTo || params.assigned_to!;
  }
  
  return Object.keys(normalized).length > 0 ? normalized : undefined;
};

const serializeTaskPayload = (data: any) => ({
  title: data.title,
  description: data.description,
  priority: data.priority,
  status: data.status,
  projectId: data.projectId ?? data.project_id,
  assignedTo: data.assignedTo ?? data.assigned_to,
  dueDate: data.dueDate ?? data.due_date,
  parentTaskId: data.parentTaskId ?? data.parent_task_id,
  sortOrder: data.sortOrder ?? data.sort_order,
  tags: data.tags,
});

export const tasksApi = {
  getAll: (params?: { project_id?: string; projectId?: string; status?: string; assigned_to?: string; assignedTo?: string }) => 
    api.get<any[]>('/tasks', normalizeTaskFilters(params)),
  getById: (id: string) => api.get<any>(`/tasks/${id}`),
  create: (data: any) => api.post<any>('/tasks', serializeTaskPayload(data)),
  update: (id: string, data: any) => api.put<any>(`/tasks/${id}`, serializeTaskPayload(data)),
  updateStatus: (id: string, status: string) => api.patch<any>(`/tasks/${id}/status`, { status }),
  delete: (id: string) => api.delete(`/tasks/${id}`),
  reorder: (tasks: { id: string; sortOrder: number }[]) => api.post('/tasks/reorder', { tasks }),
};

export const usersApi = {
  getAll: (params?: { search?: string }) => api.get<any[]>('/users', params),
  getById: (id: string) => api.get<any>(`/users/${id}`),
  create: (data: any) => api.post<any>('/users', data),
  update: (id: string, data: any) => api.put<any>(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
  resetPassword: (id: string) => api.post(`/users/${id}/reset-password`),
};

export const rolesApi = {
  getAll: () => api.get<any[]>('/roles'),
  getById: (id: string) => api.get<any>(`/roles/${id}`),
  create: (data: any) => api.post<any>('/roles', data),
  update: (id: string, data: any) => api.put<any>(`/roles/${id}`, data),
  delete: (id: string) => api.delete(`/roles/${id}`),
};

export const calendarApi = {
  getEvents: (params?: { startDate?: string; endDate?: string; search?: string }) => api.get<any[]>('/calendar', params),
  getConnections: () => api.get<any[]>('/calendar/connections'),

  getById: (id: string) => api.get<any>(`/calendar/${id}`),
  create: (data: any) => api.post<any>('/calendar', data),
  update: (id: string, data: any) => api.put<any>(`/calendar/${id}`, data),
  delete: (id: string) => api.delete(`/calendar/${id}`),
  getGoogleAuthUrl: () => api.get<{ url: string }>('/calendar/auth/google'),
  syncConnection: (provider: string) => api.post('/calendar/sync-provider', { provider }),
  disconnectConnection: (provider: string) => api.post('/calendar/disconnect-provider', { provider }),

};

export const workflowsApi = {
  getAll: () => api.get<any[]>('/workflows'),
  getById: (id: string) => api.get<any>(`/workflows/${id}`),
  create: (data: any) => api.post<any>('/workflows', data),
  update: (id: string, data: any) => api.put<any>(`/workflows/${id}`, data),
  trigger: (id: string, entityType: string, entityId: string) => api.post(`/workflows/${id}/trigger`, { entityType, entityId }),
  delete: (id: string) => api.delete(`/workflows/${id}`),
  // Workflow Actions
  createAction: (data: any) => api.post<any>('/workflows/actions', data),
  updateAction: (id: string, data: any) => api.put<any>(`/workflows/actions/${id}`, data),
  deleteAction: (id: string) => api.delete<any>(`/workflows/actions/${id}`),
  // Workflow Executions (stub for now)
  getWorkflowExecutions: (workflowId: string) => api.get<any[]>(`/workflows/${workflowId}/executions`),
};

export const activitiesApi = {
  getRecent: (limit?: number) => api.get<any[]>('/activities', limit ? { limit: String(limit) } : undefined),
  getByEntity: (entityType: string, entityId: string) => api.get<any[]>(`/activities/${entityType}/${entityId}`),
  create: (data: any) => api.post<any>('/activities', data),
};

export const organizationApi = {
  getCurrent: () => api.get<any>('/organizations'),
  update: (data: any) => api.put('/organizations', data),
  getInvites: () => api.get<any[]>('/organizations/invites'),
  createInvite: (data: { email: string; role: string }) => api.post<any>('/organizations/invites', data),
  deleteInvite: (id: string) => api.delete(`/organizations/invites/${id}`),
};

export const driveApi = {
  // Folders
  getFolders: (parentId?: string) => api.get<any[]>('/drive/folders', parentId ? { parent_id: parentId } : undefined),
  createFolder: (data: { name: string; parent_folder_id?: string; color?: string }) => api.post<any>('/drive/folders', data),
  deleteFolder: (id: string) => api.delete(`/drive/folders/${id}`),
  
  // Files
  getFiles: (folderId?: string, recent?: boolean) => api.get<any[]>('/drive/files', { 
    folder_id: folderId, 
    recent: recent ? 'true' : undefined 
  }),
  uploadFile: (file: File, folderId?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (folderId) {
      formData.append('folder_id', folderId);
    }
    return api.post<any>('/drive/files/upload', formData);
  },
  deleteFile: (id: string) => api.delete(`/drive/files/${id}`),
  
  // Activities
  getActivities: () => api.get<any[]>('/drive/activities'),
};

export const workgroupsApi = {
  getAll: (params = {}) => api.get<any[]>('/workgroups', params),
  getById: (id: string) => api.get<any>(`/workgroups/${id}`),
  create: (data: any) => api.post<any>('/workgroups', data),
  update: (id: string, data: any) => api.put<any>(`/workgroups/${id}`, data),
  delete: (id: string) => api.delete(`/workgroups/${id}`),
  
  // Members
  getMembers: (id: string) => api.get<any[]>(`/workgroups/${id}/members`),
  addMember: (id: string, data: { user_id: string; role?: string }) => 
    api.post<any>(`/workgroups/${id}/members`, data),
  removeMember: (id: string, memberId: string) => 
    api.delete(`/workgroups/${id}/members/${memberId}`),
  
  // Posts/Messages
  getPosts: (id: string, params = {}) => api.get<any[]>(`/workgroups/${id}/posts`, params),
  createPost: (id: string, data: { content: string; channel_id?: string; parent_id?: string }) =>
    api.post<any>(`/workgroups/${id}/posts`, data),
  deletePost: (id: string, postId: string) => api.delete(`/workgroups/${id}/posts/${postId}`),
  togglePinPost: (id: string, postId: string, isPinned: boolean) => 
    api.put<any>(`/workgroups/${id}/posts/${postId}/pin`, { is_pinned: !isPinned }),
  
  // Activities
  getActivities: (id: string, params = {}) => api.get<any[]>(`/workgroups/${id}/activities`, params),
  
  // Files
  getFiles: (id: string) => api.get<any[]>(`/workgroups/${id}/files`),
  uploadFile: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<any>(`/workgroups/${id}/files`, formData);
  },
  deleteFile: (id: string, fileId: string) => api.delete(`/workgroups/${id}/files/${fileId}`),
  
  // Wiki
  getWikiPages: (id: string) => api.get<any[]>(`/workgroups/${id}/wiki`),
  getWikiPage: (id: string, pageId: string) => api.get<any>(`/workgroups/${id}/wiki/${pageId}`),
  createWikiPage: (id: string, data: { title: string; content?: string }) =>
    api.post<any>(`/workgroups/${id}/wiki`, data),
  updateWikiPage: (id: string, pageId: string, data: { title?: string; content?: string }) =>
    api.put<any>(`/workgroups/${id}/wiki/${pageId}`, data),
  deleteWikiPage: (id: string, pageId: string) => api.delete(`/workgroups/${id}/wiki/${pageId}`),
  
  // Notifications
  getNotifications: (id: string, params = {}) => api.get<any>(`/workgroups/${id}/notifications`, params),
  markNotificationAsRead: (id: string, notificationId: string) =>
    api.put<any>(`/workgroups/${id}/notifications/${notificationId}/read`),
  markAllNotificationsAsRead: (id: string) =>
    api.put<any>(`/workgroups/${id}/notifications/read-all`),
  deleteNotification: (id: string, notificationId: string) =>
    api.delete(`/workgroups/${id}/notifications/${notificationId}`)
};

export const marketingApi = {
  getDashboardStats: () => api.get<any>('/marketing/dashboard'),
  getCampaigns: () => api.get<any[]>('/marketing/campaigns'),
  createCampaign: (data: any) => api.post<any>('/marketing/campaigns', data),
  updateCampaign: (id: string, data: any) => api.put<any>(`/marketing/campaigns/${id}`, data),
  deleteCampaign: (id: string) => api.delete(`/marketing/campaigns/${id}`),
  sendCampaign: (id: string) => api.post<any>(`/marketing/campaigns/${id}/send`),
  sendTestEmail: (campaignId: string, testEmail: string) => api.post<any>('/marketing/campaigns/test-email', { campaignId, testEmail }),
  trackEmailEvent: (campaignId: string, email: string, eventType: string) => api.post<any>('/marketing/campaigns/track-event', { campaignId, email, eventType }),
  verifyEmailConfig: () => api.get<any>('/marketing/email/verify-config'),
  getLists: () => api.get<any[]>('/marketing/lists'),
  createList: (data: any) => api.post<any>('/marketing/lists', data),
  deleteList: (id: string) => api.delete(`/marketing/lists/${id}`),
  getListMembers: (listId: string) => api.get<any[]>(`/marketing/lists/${listId}/members`),
  addListMembers: (listId: string, contacts: any[]) => api.post<any>(`/marketing/lists/${listId}/members`, { contacts }),
  exportListMembers: (listId: string) => {
    const token = api.getToken();
    window.open(`${API_BASE_URL}/marketing/lists/${listId}/export?token=${token}`, '_blank');
  },
  getForms: () => api.get<any[]>('/marketing/forms'),
  createForm: (data: any) => api.post<any>('/marketing/forms', data),
  deleteForm: (id: string) => api.delete(`/marketing/forms/${id}`),
  getSequences: () => api.get<any[]>('/marketing/sequences'),
  createSequence: (data: any) => api.post<any>('/marketing/sequences', data),
  updateSequence: (id: string, data: any) => api.put<any>(`/marketing/sequences/${id}`, data),
  deleteSequence: (id: string) => api.delete(`/marketing/sequences/${id}`),
  getAnalytics: (params?: { startDate?: string; endDate?: string }) => api.get<any>('/marketing/analytics', { params }),
  // Form submissions stub
  getFormSubmissions: (formId: string) => api.get<any[]>(`/marketing/forms/${formId}/submissions`),
  // Campaign events stub
  getCampaignEvents: (campaignId: string) => api.get<any[]>(`/marketing/campaigns/${campaignId}/events`),
};
