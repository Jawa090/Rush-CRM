import { useState } from "react";
import { Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreatableSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  onAddNew?: (name: string) => void | Promise<void>;
}

export function CreatableSelect({ label, value, onChange, options: initialOptions, placeholder, disabled, onAddNew }: CreatableSelectProps) {
  const [options, setOptions] = useState(initialOptions);
  const [adding, setAdding] = useState(false);
  const [newValue, setNewValue] = useState("");

  // Sync options when initialOptions change (e.g. from DB)
  const mergedOptions = [...initialOptions];
  for (const opt of options) {
    if (!mergedOptions.find(o => o.value === opt.value)) {
      mergedOptions.push(opt);
    }
  }

  const handleAdd = async () => {
    if (!newValue.trim()) return;
    const id = newValue.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
    if (!mergedOptions.find(o => o.value === id)) {
      setOptions(prev => [...prev, { value: id, label: newValue.trim() }]);
    }
    if (onAddNew) {
      await onAddNew(newValue.trim());
    } else {
      onChange(id);
    }
    setNewValue("");
    setAdding(false);
  };

  if (disabled) {
    const selected = mergedOptions.find(o => o.value === value);
    return (
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <p className="text-sm">{selected?.label || value || "—"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {adding ? (
        <div className="flex gap-2">
          <Input
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder={`New ${label.toLowerCase()}`}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAdd())}
            autoFocus
          />
          <Button type="button" size="sm" onClick={handleAdd}>Add</Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => { setAdding(false); setNewValue(""); }}>Cancel</Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder={placeholder || "Select..."} />
            </SelectTrigger>
            <SelectContent>
              {mergedOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="button" variant="outline" size="icon" onClick={() => setAdding(true)} title={`Add new ${label.toLowerCase()}`}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
