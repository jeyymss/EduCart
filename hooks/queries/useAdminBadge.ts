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
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return null;

      const userID = session.user.id
      if (!userID) return { error: "User ID is missing." };

      const userEmail = session.user.email
      if (!userEmail) return { error: "User email is missing." };

      // Read from the public view of admin.admin_users
      const { data, error } = await supabase
        .from("admin_users")
        .select("display_name, avatar_url, is_enabled")
        .eq("user_id", userID)
        .maybeSingle();

      if (error) throw new Error(error.message);
      if (!data?.is_enabled) return null; // not an admin

      return {
        email: userEmail ?? "",
        display_name: data.display_name ?? "Admin",
        avatar_url: data.avatar_url ?? null,
      };
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
