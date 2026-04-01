import { Phone, PhoneOff, PhoneCall, PhoneIncoming, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTelephony } from '@/hooks/useTelephony';
import { useEffect, useState } from 'react';

const statusConfig: Record<string, { label: string; icon: typeof Phone; color: string; pulse?: boolean }> = {
  initiated: { label: 'Initiating...', icon: Phone, color: 'bg-muted text-muted-foreground' },
  dialing: { label: 'Dialing...', icon: Phone, color: 'bg-primary text-primary-foreground', pulse: true },
  ringing: { label: 'Ringing...', icon: PhoneIncoming, color: 'bg-warning text-warning-foreground', pulse: true },
  in_call: { label: 'In Call', icon: PhoneCall, color: 'bg-success text-success-foreground' },
  completed: { label: 'Call Ended', icon: Phone, color: 'bg-muted text-muted-foreground' },
  failed: { label: 'Call Failed', icon: PhoneOff, color: 'bg-destructive text-destructive-foreground' },
};

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function FloatingCallIndicator() {
  const { activeCall, endCall, dismissCall } = useTelephony();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!activeCall || activeCall.status === 'completed' || activeCall.status === 'failed') {
      setElapsed(0);
      return;
    }
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - activeCall.startedAt.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeCall]);

  if (!activeCall) return null;

  const config = statusConfig[activeCall.status];
  const Icon = config.icon;

  return (
    <div className="fixed bottom-6 left-6 z-50 animate-scale-in">
      <div className={`flex items-center gap-3 rounded-2xl px-5 py-3 shadow-elevated ${config.color}`}>
        <div className={`relative ${config.pulse ? 'animate-pulse' : ''}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold">{config.label}</span>
          <span className="text-xs opacity-80">
            {activeCall.phoneNumber}
            {activeCall.status === 'in_call' && ` • ${formatDuration(elapsed)}`}
            {activeCall.status === 'completed' && ` • ${formatDuration(activeCall.duration)}`}
          </span>
        </div>
        {activeCall.status === 'in_call' && (
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-full hover:bg-destructive hover:text-destructive-foreground ml-2"
            onClick={endCall}
          >
            <PhoneOff className="h-4 w-4" />
          </Button>
        )}
        {(activeCall.status === 'completed' || activeCall.status === 'failed') && (
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-full ml-2"
            onClick={dismissCall}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
