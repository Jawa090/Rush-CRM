import { useState, useEffect, useRef } from "react";
import { Search, X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface EntityOption {
  id: string;
  label: string;
  sublabel?: string;
}

interface EntitySearchSelectProps {
  label: string;
  placeholder?: string;
  options: EntityOption[];
  value: string | null;
  onChange: (id: string | null) => void;
  disabled?: boolean;
  onAddNew?: (searchTerm: string) => void;
  addNewLabel?: string;
}

export function EntitySearchSelect({ label, placeholder, options, value, onChange, disabled, onAddNew, addNewLabel }: EntitySearchSelectProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find(o => o.id === value);

  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase()) ||
    (o.sublabel && o.sublabel.toLowerCase().includes(search.toLowerCase()))
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (disabled) {
    return (
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <p className="text-sm">{selected?.label || "—"}</p>
        {selected?.sublabel && <p className="text-xs text-muted-foreground">{selected.sublabel}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-1.5 relative" ref={ref}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={selected ? selected.label : (placeholder || `Search ${label.toLowerCase()}...`)}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          className={cn("pl-9 pr-9", selected && !search && "text-foreground")}
        />
        {(value || search) && (
          <button
            type="button"
            onClick={() => { onChange(null); setSearch(""); }}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>
      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-48 overflow-auto rounded-md border border-border bg-popover shadow-md">
          {filtered.length === 0 && !onAddNew && (
            <div className="p-3 text-sm text-muted-foreground">No results found</div>
          )}
          {filtered.map(opt => (
            <div
              key={opt.id}
              onClick={() => { onChange(opt.id); setSearch(""); setOpen(false); }}
              className={cn(
                "px-3 py-2 cursor-pointer hover:bg-accent text-sm",
                opt.id === value && "bg-accent"
              )}
            >
              <div>{opt.label}</div>
              {opt.sublabel && <div className="text-xs text-muted-foreground">{opt.sublabel}</div>}
            </div>
          ))}
          {onAddNew && (
            <div
              onClick={() => { onAddNew(search); setSearch(""); setOpen(false); }}
              className="px-3 py-2 cursor-pointer hover:bg-accent text-sm border-t border-border flex items-center gap-2 text-primary"
            >
              <Plus className="h-4 w-4" />
              <span>{addNewLabel || `Add New ${label}`}</span>
              {search && <span className="text-muted-foreground">"{search}"</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
