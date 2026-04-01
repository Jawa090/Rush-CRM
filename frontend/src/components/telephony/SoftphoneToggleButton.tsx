import { Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSoftphone } from '@/contexts/SoftphoneContext';
import { useTelephony } from '@/hooks/useTelephony';
import { cn } from '@/lib/utils';

export function SoftphoneToggleButton() {
  const { isOpen, toggleSoftphone, activeProvider } = useSoftphone();
  const { canViewTelephony, hasProviders } = useTelephony();

  if (!canViewTelephony || !hasProviders) return null;

  return (
    <Button
      size="icon"
      variant={isOpen ? 'default' : 'outline'}
      className={cn(
        'relative h-9 w-9 rounded-full',
        isOpen && 'shadow-md'
      )}
      onClick={toggleSoftphone}
      title="Toggle Softphone"
    >
      <Phone className="h-4 w-4" />
      {activeProvider && !isOpen && (
        <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-success border-2 border-card" />
      )}
    </Button>
  );
}
