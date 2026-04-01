import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import type { TelephonyProviderName } from '@/services/telephonyService';

interface CallEntityContext {
  entityType: 'lead' | 'deal' | 'contact' | 'company';
  entityId: string;
}

interface SoftphoneState {
  isOpen: boolean;
  isPanelMinimized: boolean;
  activeProvider: TelephonyProviderName | null;
  isConnecting: boolean;
}

interface SoftphoneContextType extends SoftphoneState {
  openSoftphone: () => void;
  closeSoftphone: () => void;
  toggleSoftphone: () => void;
  minimizePanel: () => void;
  expandPanel: () => void;
  setActiveProvider: (provider: TelephonyProviderName | null) => Promise<void>;
  dialNumber: (phoneNumber: string, entity?: CallEntityContext) => void;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
}

const SoftphoneContext = createContext<SoftphoneContextType | undefined>(undefined);

export function SoftphoneProvider({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth();
  const { hasPermission } = useOrganization();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  // Track pending entity context for the next call
  const pendingEntityRef = useRef<CallEntityContext | null>(null);
  // Track active call log ID for updating on call end
  const activeCallLogIdRef = useRef<string | null>(null);

  const [state, setState] = useState<SoftphoneState>({
    isOpen: false,
    isPanelMinimized: false,
    activeProvider: null,
    isConnecting: false,
  });

  // Load active provider from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('active_telephony_provider');
    if (saved) setState(prev => ({ ...prev, activeProvider: saved as TelephonyProviderName }));
  }, []);

  // Listen for RC Embeddable postMessage events to track call lifecycle
  // AND handle call logger requests from the registered third-party service
  useEffect(() => {
    if (state.activeProvider !== 'ringcentral') return;

    const handleMessage = async (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'object') return;
      const { type, telephonyStatus, call, direction, path, requestId, body } = event.data;

      // ========================================
      // Handle RC Embeddable call logger events
      // This is fired when the widget wants to log a call (auto or manual)
      // ========================================
      if (type === 'rc-post-message-request' && path === '/callLogger') {
        console.log('[RC CallLogger] Received call log event:', body);
        
        // Respond to widget immediately so it doesn't hang
        if (iframeRef.current?.contentWindow && requestId) {
          iframeRef.current.contentWindow.postMessage({
            type: 'rc-post-message-response',
            responseId: requestId,
            response: { data: 'ok' },
          }, '*');
        }

        // Extract call data from the logger event
        const callData = body?.call;
        if (!callData) return;

        // Only process completed/ended calls
        const callResult = callData.result || callData.telephonyStatus;
        const isCompleted = callResult === 'Call connected' || 
                            callResult === 'Disconnected' || 
                            callResult === 'NoCall' ||
                            callData.duration > 0;

        if (!isCompleted && callData.telephonyStatus !== 'NoCall') return;

        // Get entity context from our pending ref
        const entityCtx = pendingEntityRef.current;
        if (!entityCtx || !profile?.org_id || !user?.id) return;

        const phoneNumber = callData.to?.phoneNumber || callData.from?.phoneNumber || '';
        const durationSeconds = callData.duration || 0;
        const sessionId = callData.sessionId || callData.telephonySessionId || `rc-${Date.now()}`;
        const callDirection = callData.direction === 'Inbound' ? 'inbound' : 'outbound';

        // Extract recording info if available
        const recording = callData.recording || null;
        const recordingUrl = recording?.link || recording?.contentUri || null;

        // Extract rich AI-generated notes from RingCentral
        const fromName = callData.from?.name || callData.from?.phoneNumber || '';
        const toName = callData.to?.name || callData.to?.phoneNumber || '';
        const callNotes = callData.notes || callData.meetingNotes || '';
        const aiRecap = callData.aiRecap || callData.recap || '';
        const aiTasks = callData.aiTasks || [];
        const aiSummary = callData.aiSummary || '';
        const transcript = callData.transcript || '';

        // Debug: log full call object to see all available fields
        console.log('[RC CallLogger] Full call data keys:', Object.keys(callData));
        console.log('[RC CallLogger] Rich fields:', { 
          hasNotes: !!callData.notes, 
          hasMeetingNotes: !!callData.meetingNotes,
          hasAiRecap: !!callData.aiRecap, 
          hasRecap: !!callData.recap,
          hasAiTasks: !!callData.aiTasks, 
          hasAiSummary: !!callData.aiSummary,
          hasTranscript: !!callData.transcript,
          fromName, toName,
        });

        // Fire-and-forget: send call data to edge function for CRM note appending
        try {
          await fetch('/api/integrations/ringcentral-transcript', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify({
              action: 'log_call_notes',
              orgId: profile.org_id,
              userId: user.id,
              entityType: entityCtx.entityType,
              entityId: entityCtx.entityId,
              phoneNumber,
              durationSeconds,
              callDirection,
              sessionId,
              recordingUrl,
              fromName,
              toName,
              callNotes,
              aiRecap,
              aiTasks,
              aiSummary,
              transcript,
            }),
          }).catch(() => {});
          console.log('[RC CallLogger] Call notes sent to CRM for', entityCtx.entityType, entityCtx.entityId);
        } catch (err) {
          console.warn('[RC CallLogger] Failed to send call notes:', err);
        }

        // Clear entity context after processing
        pendingEntityRef.current = null;
        activeCallLogIdRef.current = null;
        return;
      }

      // ========================================
      // Handle RC Embeddable call lifecycle events
      // ========================================
      if (type === 'rc-call-ring-notify' || type === 'rc-active-call-notify') {
        if (telephonyStatus === 'CallConnected' || type === 'rc-call-ring-notify') {
          if (!activeCallLogIdRef.current && profile?.org_id && user?.id && pendingEntityRef.current) {
            const rcSessionId = call?.sessionId || call?.telephonySessionId || `rc-embed-${Date.now()}`;
            const phoneNumber = call?.to?.phoneNumber || call?.from?.phoneNumber || '';

            // call log creation skipped (no backend endpoint)
          }
        }
      }

      if (type === 'rc-call-end-notify') {
        const callLogId = activeCallLogIdRef.current;
        if (callLogId) {
          const durationSeconds = call?.duration || 0;
          const rcCallId = call?.sessionId || call?.telephonySessionId || null;

          // call log update skipped (no backend endpoint)

          // Note: We do NOT trigger transcript fetch here anymore.
          // The call logger event above handles CRM note appending.
          activeCallLogIdRef.current = null;
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [state.activeProvider, profile?.org_id, user?.id]);

  const openSoftphone = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: true, isPanelMinimized: false }));
  }, []);

  const closeSoftphone = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const toggleSoftphone = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: !prev.isOpen, isPanelMinimized: false }));
  }, []);

  const minimizePanel = useCallback(() => {
    setState(prev => ({ ...prev, isPanelMinimized: true }));
  }, []);

  const expandPanel = useCallback(() => {
    setState(prev => ({ ...prev, isPanelMinimized: false }));
  }, []);

  const setActiveProvider = useCallback(async (provider: TelephonyProviderName | null) => {
    if (provider) localStorage.setItem('active_telephony_provider', provider);
    else localStorage.removeItem('active_telephony_provider');
    setState(prev => ({ ...prev, activeProvider: provider }));
  }, []);

  const dialNumber = useCallback((phoneNumber: string, entity?: CallEntityContext) => {
    const clean = phoneNumber.replace(/[^\d+]/g, '');
    
    // Store entity context for the upcoming call
    pendingEntityRef.current = entity || null;
    activeCallLogIdRef.current = null;

    // Open panel if not already open
    setState(prev => ({ ...prev, isOpen: true, isPanelMinimized: false }));

    // For RingCentral Embeddable, use postMessage API
    if (state.activeProvider === 'ringcentral' && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'rc-adapter-new-call',
        phoneNumber: clean,
      }, '*');
    }
  }, [state.activeProvider]);

  return (
    <SoftphoneContext.Provider value={{
      ...state,
      openSoftphone,
      closeSoftphone,
      toggleSoftphone,
      minimizePanel,
      expandPanel,
      setActiveProvider,
      dialNumber,
      iframeRef,
    }}>
      {children}
    </SoftphoneContext.Provider>
  );
}

const defaultSoftphoneContext: SoftphoneContextType = {
  isOpen: false,
  isPanelMinimized: false,
  activeProvider: null,
  isConnecting: false,
  openSoftphone: () => {},
  closeSoftphone: () => {},
  toggleSoftphone: () => {},
  minimizePanel: () => {},
  expandPanel: () => {},
  setActiveProvider: async () => {},
  dialNumber: () => {},
  iframeRef: { current: null },
};

export function useSoftphone() {
  const context = useContext(SoftphoneContext);
  return context ?? defaultSoftphoneContext;
}
