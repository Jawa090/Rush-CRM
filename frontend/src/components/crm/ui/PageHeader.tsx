import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export type MetaPill = {
  label: string;
  value: string | number;
  tone?: "default" | "success" | "warning" | "info" | "danger";
};

const toneClassNames: Record<NonNullable<MetaPill["tone"]>, string> = {
  default: "bg-muted text-muted-foreground border-transparent",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  info: "bg-sky-50 text-sky-700 border-sky-200",
  danger: "bg-rose-50 text-rose-700 border-rose-200",
};

type PageHeaderProps = {
  title: string;
  description?: string;
  meta?: MetaPill[];
  actions?: ReactNode;
  breadcrumb?: ReactNode;
  subdued?: boolean;
};

export function PageHeader({ title, description, meta, actions, breadcrumb, subdued }: PageHeaderProps) {
  return (
    <div className={cn("w-full", subdued ? "pb-2" : "pb-4 border-b border-border/60")}> 
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          {breadcrumb}
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
              {meta && meta.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  {meta.map((item) => (
                    <Badge
                      key={`${item.label}-${item.value}`}
                      variant="outline"
                      className={cn("font-medium", toneClassNames[item.tone || "default"])}
                    >
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mr-1">{item.label}</span>
                      <span className="text-sm text-foreground">{item.value}</span>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            {description && <p className="text-sm text-muted-foreground max-w-2xl">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2 flex-wrap justify-end">{actions}</div>}
      </div>
    </div>
  );
}
