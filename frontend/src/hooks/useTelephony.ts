import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import {
  fetchEnabledProviders,
  getProvider,
  logCall,
  updateCallStatus,
  checkRCConnectionStatus,
  fetchCallTranscript,
  type TelephonyProviderName,
  type ActiveCall,
} from '@/services/telephonyService';

export function useTelephony() {
  const { profile, user } = useAuth();
  const { hasPermission } = useOrganization();
  const [enabledProviders, setEnabledProviders] = useState<{ name: TelephonyProviderName; displayName: string }[]>([]);
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [loading, setLoading] = useState(true);
  const [rcConnected, setRcConnected] = useState(false);

  const canUseTelephony = hasPermission('telephony', 'create');
  const canViewTelephony = hasPermission('telephony', 'view');

  useEffect(() => {
    if (!profile?.org_id || !canViewTelephony) {
      setLoading(false);
      return;
    }
    Promise.all([
      fetchEnabledProviders(profile.org_id),
      checkRCConnectionStatus(),
    ]).then(([providers, rcStatus]) => {
      setEnabledProviders(providers);
      setRcConnected(rcStatus.connected && !rcStatus.expired);
      setLoading(false);
    });
  }, [profile?.org_id, canViewTelephony]);

  const initiateCall = useCallback(async (
    phoneNumber: string,
    providerName: TelephonyProviderName,
    entityType?: string,
    entityId?: string,
  ) => {
    if (!profile?.org_id || !user?.id || !canUseTelephony) return;

    const provider = getProvider(providerName);

    // Generate a session ID for tracking
    const rcSessionId = `rc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const callLog = await logCall({
      orgId: profile.org_id,
      userId: user.id,
      providerName,
      phoneNumber,
      entityType,
      entityId,
      status: 'initiated',
      rcSessionId,
    });

    const call: ActiveCall = {
      id: callLog.id,
      provider: providerName,
      phoneNumber,
      status: 'dialing',
      entityType,
      entityId,
      startedAt: new Date(),
      duration: 0,
    };
    setActiveCall(call);

    await updateCallStatus(callLog.id, 'dialing');

    try {
      await provider.initiateCall(phoneNumber);
      // Simulate status progression for URI scheme calls
      setTimeout(() => {
        setActiveCall(prev => prev ? { ...prev, status: 'ringing' } : null);
        updateCallStatus(callLog.id, 'ringing');
      }, 2000);
      setTimeout(() => {
        setActiveCall(prev => prev ? { ...prev, status: 'in_call' } : null);
        updateCallStatus(callLog.id, 'in_call');
      }, 5000);
    } catch {
      setActiveCall(prev => prev ? { ...prev, status: 'failed' } : null);
      await updateCallStatus(callLog.id, 'failed');
    }
  }, [profile?.org_id, user?.id, canUseTelephony]);

  const endCall = useCallback(async () => {
    if (!activeCall) return;
    const duration = Math.floor((Date.now() - activeCall.startedAt.getTime()) / 1000);
    await updateCallStatus(activeCall.id, 'completed', duration);
    setActiveCall(prev => prev ? { ...prev, status: 'completed', duration } : null);

    // Fetch transcript after call ends (for RC calls)
    if (activeCall.provider === 'ringcentral' && rcConnected) {
      try {
        await fetchCallTranscript(activeCall.id);
      } catch (e) {
        console.warn('Transcript fetch failed:', e);
      }
    }

    setTimeout(() => setActiveCall(null), 3000);
  }, [activeCall, rcConnected]);

  const dismissCall = useCallback(() => {
    setActiveCall(null);
  }, []);

  return {
    enabledProviders,
    activeCall,
    loading,
    canUseTelephony,
    canViewTelephony,
    initiateCall,
    endCall,
    dismissCall,
    hasProviders: enabledProviders.length > 0,
    rcConnected,
  };
}
