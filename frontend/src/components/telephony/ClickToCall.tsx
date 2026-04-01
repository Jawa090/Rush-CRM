import { Phone } from 'lucide-react';
import { useSoftphone } from '@/contexts/SoftphoneContext';
import { useTelephony } from '@/hooks/useTelephony';

interface ClickToCallProps {
  phoneNumber: string;
  entityType?: 'lead' | 'deal' | 'contact' | 'company';
  entityId?: string;
  className?: string;
}

export function ClickToCall({ phoneNumber, entityType, entityId, className = '' }: ClickToCallProps) {
  const { canUseTelephony, hasProviders } = useTelephony();
  const { dialNumber, activeProvider, openSoftphone } = useSoftphone();

  if (!canUseTelephony || !hasProviders || !phoneNumber) {
    return <span className={className}>{phoneNumber}</span>;
  }

  const handleClick = () => {
    if (activeProvider) {
      // Dial with entity context so call_log tracks which lead/deal this call is for
      dialNumber(phoneNumber, entityType && entityId ? { entityType, entityId } : undefined);
    } else {
      openSoftphone();
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 cursor-pointer group ${className}`}
      onClick={handleClick}
      title={activeProvider ? `Call via ${activeProvider}` : 'Open softphone to call'}
    >
      <Phone className="h-3.5 w-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
      <span className="group-hover:text-primary group-hover:underline transition-colors">
        {phoneNumber}
      </span>
    </span>
  );
}
