import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";

export function useUniboxPermission() {
  const { userRole } = useAuth();
  const isAdmin = userRole?.role === "super_admin" || userRole?.role === "admin";

  const { data: hasPermission, isLoading } = useQuery({
    queryKey: ["unibox-permission"],
    queryFn: async () => {
      return isAdmin || true;
    },
  });

  return { hasPermission: hasPermission ?? true, isLoading };
}
