// useUserProfile.ts
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";

export type UserProfile = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  verification_status: string;
  created_at: string;
  avatar_url: string | null;
  universities: { abbreviation: string | null } | null; // 1-to-1
};

export function useUserProfile() {
  const supabase = createClient();

  return useQuery<UserProfile, Error>({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Not logged in");

      const { data, error } = await supabase
        .from("users")
        .select(
          `
          id, full_name, email, role, verification_status, created_at, avatar_url,
          universities ( abbreviation )
        `
        )
        .eq("id", auth.user.id)
        .returns<UserProfile>()
        .single();

      if (error || !data) throw new Error(error?.message ?? "No row");
      return data;
    },
  });
}
