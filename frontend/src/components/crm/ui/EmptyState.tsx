import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  muted?: boolean;
}

export function EmptyState({ icon, title, description, actionLabel, onAction, muted }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-10 px-4 text-center rounded-xl border",
        muted ? "bg-muted/40 text-muted-foreground" : "bg-card text-foreground"
      )}
    >
      {icon && <div className="text-muted-foreground">{icon}</div>}
      <div>
        <p className="text-lg font-semibold">{title}</p>
        {description && <p className="text-sm text-muted-foreground mt-1 max-w-md">{description}</p>}
      </div>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="default" size="sm" className="mt-1">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
