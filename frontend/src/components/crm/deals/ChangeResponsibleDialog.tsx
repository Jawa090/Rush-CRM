import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface ChangeResponsibleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (userId: string) => void;
  currentUserId?: string | null;
}

export function ChangeResponsibleDialog({ open, onOpenChange, onSelect, currentUserId }: ChangeResponsibleDialogProps) {
  const { profile } = useAuth();
  const [search, setSearch] = useState("");

  const { data: users } = useQuery({
    queryKey: ['org-active-users', profile?.org_id],
    queryFn: async () => {
      if (!profile?.org_id) return [];
      const response = await api.get<any[]>("/users");
      return response.filter(u => u.status === 'active' || !u.status) || [];
    },
    enabled: !!profile?.org_id && open,
  });

  const filtered = useMemo(() => {
    if (!users) return [];
    if (!search) return users;
    const q = search.toLowerCase();
    return users.filter(u =>
      (u.full_name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q)
    );
  }, [users, search]);

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Responsible Person</DialogTitle>
        </DialogHeader>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="max-h-72 overflow-auto space-y-1">
          {filtered.map(user => (
            <div
              key={user.id}
              onClick={() => { onSelect(user.id); onOpenChange(false); setSearch(""); }}
              className={`flex items-center gap-3 p-2.5 rounded-md cursor-pointer transition-colors ${
                user.id === currentUserId ? 'bg-primary/10' : 'hover:bg-accent'
              }`}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar_url || undefined} />
                <AvatarFallback className="text-xs">{getInitials(user.full_name || "U")}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{user.full_name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No users found</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
