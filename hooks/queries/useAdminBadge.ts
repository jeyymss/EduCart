// hooks/useAdminBadge.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";

export type AdminBadge = {
  email: string;
  display_name: string;
  avatar_url: string | null;
};

export function useAdminBadge() {
  return useQuery<AdminBadge | null, Error>({
    queryKey: ["admin", "badge"],
    queryFn: async () => {
      const supabase = createClient();

      // Get current session user (for email + id)
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      // Read from the public view of admin.admin_users
      const { data, error } = await supabase
        .from("admin_users")
        .select("display_name, avatar_url, is_enabled")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw new Error(error.message);
      if (!data?.is_enabled) return null; // not an admin

      return {
        email: user.email ?? "",
        display_name: data.display_name ?? "Admin",
        avatar_url: data.avatar_url ?? null,
      };
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
