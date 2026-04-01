import { useEffect, useCallback } from 'react';
import { useSoftphone } from '@/contexts/SoftphoneContext';
import { Phone, PhoneOff, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTelephony } from '@/hooks/useTelephony';

export function EmbeddedSoftphone() {
  const { activeProvider, iframeRef, setActiveProvider, isConnecting } = useSoftphone();
  const { enabledProviders } = useTelephony();

  // Register third-party call logger service once the RC widget is loaded
  useEffect(() => {
    if (activeProvider !== 'ringcentral') return;

    const handleLoginStatus = (e: MessageEvent) => {
      const data = e.data;
      if (data && data.type === 'rc-login-status-notify') {
        // Register our CRM call logger service
        const iframe = iframeRef.current;
        if (iframe?.contentWindow) {
          iframe.contentWindow.postMessage({
            type: 'rc-adapter-register-third-party-service',
            service: {
              name: 'RushCRM',
              callLoggerPath: '/callLogger',
              callLoggerTitle: 'Save to CRM',
              callLoggerAutoSettingLabel: 'Auto-save call notes to CRM',
            },
          }, '*');
          console.log('[RC] Third-party call logger service registered');
        }
      }
    };

    window.addEventListener('message', handleLoginStatus);
    return () => window.removeEventListener('message', handleLoginStatus);
  }, [activeProvider, iframeRef]);

  if (!activeProvider) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-4">
        <div className="p-4 rounded-full bg-muted">
          <Phone className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Select a Provider</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Choose one telephony provider to activate for this session.
          </p>
        </div>
        <div className="space-y-2 w-full max-w-[240px]">
          {enabledProviders.map(provider => (
            <Button
              key={provider.name}
              variant="outline"
              className="w-full gap-2 justify-start"
              onClick={() => setActiveProvider(provider.name)}
              disabled={isConnecting}
            >
              <Wifi className="h-4 w-4 text-primary" />
              {provider.displayName}
              {provider.name === 'twilio' && (
                <span className="text-[10px] text-muted-foreground ml-auto">Coming Soon</span>
              )}
              {provider.name === 'tmobile' && (
                <span className="text-[10px] text-muted-foreground ml-auto">Coming Soon</span>
              )}
            </Button>
          ))}
          {enabledProviders.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No providers enabled. Ask your admin to enable one in Settings.
            </p>
          )}
        </div>
      </div>
    );
  }

  // RingCentral Embeddable Widget
  if (activeProvider === 'ringcentral') {
    const clientId = import.meta.env.VITE_RINGCENTRAL_CLIENT_ID || '';
    const rcAppUrl = clientId
      ? `https://apps.ringcentral.com/integration/ringcentral-embeddable/latest/app.html?clientId=${clientId}&appServer=https://platform.ringcentral.com&defaultAutoLogCallEnabled=1`
      : `https://apps.ringcentral.com/integration/ringcentral-embeddable/latest/app.html?defaultAutoLogCallEnabled=1`;

    return (
      <div className="relative h-full w-full">
        <iframe
          ref={iframeRef}
          src={rcAppUrl}
          width="100%"
          height="100%"
          allow="autoplay; microphone"
          className="border-0"
          title="RingCentral Softphone"
        />
        {/* Disconnect button */}
        <div className="absolute bottom-3 left-3 right-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={() => setActiveProvider(null)}
          >
            <PhoneOff className="h-3.5 w-3.5" />
            Disconnect Provider
          </Button>
        </div>
      </div>
    );
  }

  // Twilio placeholder
  if (activeProvider === 'twilio') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-4">
        <div className="p-4 rounded-full bg-muted">
          <Phone className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">Twilio WebRTC</h3>
        <p className="text-xs text-muted-foreground">
          Twilio embedded softphone is coming soon. WebRTC-based calling will be available in a future update.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
          onClick={() => setActiveProvider(null)}
        >
          <PhoneOff className="h-3.5 w-3.5" />
          Switch Provider
        </Button>
      </div>
    );
  }

  // T-Mobile placeholder
  if (activeProvider === 'tmobile') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-4">
        <div className="p-4 rounded-full bg-muted">
          <Phone className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">T-Mobile</h3>
        <p className="text-xs text-muted-foreground">
          T-Mobile embedded softphone integration is planned for a future release.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
          onClick={() => setActiveProvider(null)}
        >
          <PhoneOff className="h-3.5 w-3.5" />
          Switch Provider
        </Button>
      </div>
    );
  }

  return null;
}
