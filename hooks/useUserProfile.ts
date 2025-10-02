import { useQuery } from "@tanstack/react-query";

export type UserProfile = {
  university_abbreviation?: string | null;
  name: string | null;
  bio: string | null;
  id: string;
  full_name: string | null;
  email: string;
  role: string | null;
  avatar_url: string | null;
  background_url: string | null;
  post_credits_balance: number;
  universities: { id: number; abbreviation: string | null } | null;
  created_at: string;
  updated_at: string;
};

export function useUserProfile() {
  return useQuery<UserProfile>({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const res = await fetch("/api/user-profile-view/individual", {
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to fetch profile");
      }

      const data = await res.json();

      return data as UserProfile;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}
