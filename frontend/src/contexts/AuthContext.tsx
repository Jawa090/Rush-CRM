import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, authApi } from '@/lib/api';

interface Profile {
  id: string;
  org_id: string | null;
  full_name: string;
  email: string;
  avatar_url: string | null;
}

interface UserRole {
  role: 'super_admin' | 'admin' | 'manager' | 'sales_rep' | 'hr_manager' | 'inventory_manager' | 'employee';
  org_id: string;
  role_id: string | null;
}

interface AuthContextType {
  user: any | null;
  session: any | null;
  profile: Profile | null;
  userRole: UserRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      const profileData = await authApi.getProfile();
      // normalize camelCase from backend to snake_case
      const normalized = {
        ...profileData,
        org_id: profileData.org_id ?? profileData.orgId ?? null,
        full_name: profileData.full_name ?? profileData.fullName ?? '',
      };
      setProfile(normalized);
      setUser({ id: normalized.id, email: normalized.email });
      setSession({ user: { id: normalized.id } });
      if (profileData.user_roles?.[0]) {
        setUserRole({
          role: profileData.user_roles[0].role,
          org_id: normalized.org_id,
          role_id: profileData.user_roles[0].id,
        });
      }
      return normalized;
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = api.getToken();
      if (token) {
        try {
          await fetchUserData();
        } catch (error) {
          api.setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { token, user: userData } = await authApi.login(email, password);
      api.setToken(token);
      setUser(userData);
      setSession({ user: { id: userData.id } });
      await fetchUserData();
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      await authApi.register({ email, password, fullName });
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    api.setToken(null);
    setUser(null);
    setSession(null);
    setProfile(null);
    setUserRole(null);
  };

  const refreshProfile = async () => {
    await fetchUserData();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        userRole,
        loading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
