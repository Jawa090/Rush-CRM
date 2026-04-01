import { Phone, PhoneOff, Minimize2, Maximize2, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSoftphone } from '@/contexts/SoftphoneContext';
import { EmbeddedSoftphone } from './EmbeddedSoftphone';
import { cn } from '@/lib/utils';

export function SoftphonePanel() {
  const {
    isOpen,
    isPanelMinimized,
    activeProvider,
    toggleSoftphone,
    closeSoftphone,
    minimizePanel,
    expandPanel,
  } = useSoftphone();

  if (!isOpen) return null;

  const providerLabels: Record<string, string> = {
    ringcentral: 'RingCentral',
    twilio: 'Twilio',
    tmobile: 'T-Mobile',
  };

  return (
    <div
      className={cn(
        'fixed right-6 z-50 transition-all duration-300 ease-in-out shadow-elevated rounded-2xl border border-border bg-card overflow-hidden',
        isPanelMinimized
          ? 'bottom-6 w-[280px] h-[56px]'
          : 'bottom-6 w-[376px] h-[600px]'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          <span className="text-sm font-semibold">
            {activeProvider ? providerLabels[activeProvider] || activeProvider : 'Softphone'}
          </span>
          {activeProvider && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-primary-foreground/20 text-primary-foreground border-0">
              Active
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {isPanelMinimized ? (
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-primary-foreground hover:bg-primary-foreground/20"
              onClick={expandPanel}
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-primary-foreground hover:bg-primary-foreground/20"
              onClick={minimizePanel}
            >
              <Minimize2 className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-primary-foreground hover:bg-destructive hover:text-destructive-foreground"
            onClick={closeSoftphone}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Body */}
      {!isPanelMinimized && (
        <div className="h-[calc(100%-48px)]">
          <EmbeddedSoftphone />
        </div>
      )}
    </div>
  );
}
