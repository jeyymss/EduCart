import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";

export type UserProfile = {
  full_name: string;
  email: string;
  role: string;
  university_id: number;
  verification_status: string;
  created_at: string;
  universities: { abbreviation: string }[]; // ← FIXED
};

export const useUserProfile = () => {
  const supabase = createClient();

  return useQuery<UserProfile, Error>({
    queryKey: ["user-profile"],
    queryFn: async (): Promise<UserProfile> => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) throw new Error("No active session");

      const userId = session.user.id;

      const { data, error } = await supabase
        .from("users")
        .select(
          `
          full_name,
          email,
          role,
          university_id,
          verification_status,
          created_at,
          universities (
            abbreviation
          )
        `
        )
        .eq("id", userId)
        .single();

      if (error) throw new Error(error.message);
      return data as UserProfile;
    },
  });
};
