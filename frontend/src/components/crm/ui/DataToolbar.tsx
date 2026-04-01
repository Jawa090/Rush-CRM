import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { LayoutGrid, ListFilter } from "lucide-react";

export type ToolbarFilterOption = { label: string; value: string; count?: number };
export type ToolbarQuickFilter = { label: string; value: string; active: boolean; onToggle: (value: string) => void };
export type ToolbarView = { id: string; label: string; icon?: ReactNode };

interface DataToolbarProps {
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: {
    label: string;
    options: ToolbarFilterOption[];
    value?: string;
    onChange?: (value: string) => void;
  }[];
  quickFilters?: ToolbarQuickFilter[];
  sortValue?: string;
  sortOptions?: ToolbarFilterOption[];
  onSortChange?: (value: string) => void;
  view?: string;
  viewOptions?: ToolbarView[];
  onViewChange?: (view: string) => void;
  children?: ReactNode;
}

export function DataToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters,
  quickFilters,
  sortValue,
  sortOptions,
  onSortChange,
  view,
  viewOptions,
  onViewChange,
  children,
}: DataToolbarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/70 p-3 lg:p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-wrap gap-3 items-center">
          {onSearchChange && (
            <div className="relative w-full md:w-72">
              <Input
                value={search}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-10 bg-muted/40 border-border/60 focus-visible:ring-2 focus-visible:ring-primary/40"
              />
              <ListFilter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          )}

          {filters?.map((filter) => (
            <Select key={filter.label} value={filter.value} onValueChange={filter.onChange}>
              <SelectTrigger className="w-[160px] bg-muted/40 border-border/60">
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center justify-between w-full">
                      <span>{option.label}</span>
                      {option.count !== undefined && <span className="text-xs text-muted-foreground">{option.count}</span>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}

          {quickFilters && quickFilters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {quickFilters.map((chip) => (
                <Button
                  key={chip.value}
                  size="sm"
                  variant={chip.active ? "default" : "outline"}
                  className={cn("rounded-full", chip.active ? "bg-primary text-primary-foreground" : "bg-muted/40")}
                  onClick={() => chip.onToggle(chip.value)}
                >
                  {chip.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 justify-end">
          {sortOptions && onSortChange && (
            <Select value={sortValue} onValueChange={onSortChange}>
              <SelectTrigger className="w-[160px] bg-muted/40 border-border/60">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {viewOptions && onViewChange && (
            <div className="inline-flex items-center rounded-lg border bg-muted/40 border-border/60 p-1">
              {viewOptions.map((option) => (
                <Button
                  key={option.id}
                  variant={view === option.id ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "gap-1 px-3",
                    view === option.id
                      ? "bg-card shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => onViewChange(option.id)}
                >
                  {option.icon || (option.id === "kanban" ? <LayoutGrid className="h-4 w-4" /> : null)}
                  <span className="hidden sm:inline">{option.label}</span>
                </Button>
              ))}
            </div>
          )}

          {children}
        </div>
      </div>
    </div>
  );
}
