import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from './AuthContext';

interface Organization {
  id: string;
  name: string;
  domain: string | null;
  logo_url: string | null;
  settings: Record<string, unknown>;
}

interface RolePermission {
  module: string;
  action: string;
  is_inherited: boolean;
}

interface Role {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_role_id: string | null;
  is_system: boolean;
  color: string | null;
}

interface OrganizationContextType {
  organization: Organization | null;
  permissions: RolePermission[];
  currentRole: Role | null;
  loading: boolean;
  hasPermission: (module: string, action: string) => boolean;
  refreshOrganization: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const { profile, userRole, user } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrganizationData = async () => {
    if (!profile?.org_id || !userRole) {
      setLoading(false);
      return;
    }
    try {
      const orgData = await api.get<any>('/organizations');
      if (orgData) setOrganization(orgData as Organization);

      if (userRole.role === 'super_admin' || userRole.role === 'admin') {
        setPermissions([]);
        setCurrentRole({ id: '', name: userRole.role === 'super_admin' ? 'Super Admin' : 'Admin', slug: userRole.role, description: null, parent_role_id: null, is_system: true, color: null });
      }
    } catch (error) {
      console.error('Error fetching organization data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.org_id && userRole) {
      fetchOrganizationData();
    } else if (!user) {
      setOrganization(null);
      setPermissions([]);
      setCurrentRole(null);
      setLoading(false);
    }
  }, [profile?.org_id, userRole?.role, user]);

  const hasPermission = (module: string, action: string): boolean => {
    if (userRole?.role === 'super_admin' || userRole?.role === 'admin') return true;
    if (currentRole?.slug === 'super_admin' || currentRole?.slug === 'admin') return true;
    return permissions.some((p) => p.module === module && p.action === action);
  };

  const refreshOrganization = async () => { await fetchOrganizationData(); };

  return (
    <OrganizationContext.Provider value={{ organization, permissions, currentRole, loading, hasPermission, refreshOrganization }}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) throw new Error('useOrganization must be used within an OrganizationProvider');
  return context;
}
