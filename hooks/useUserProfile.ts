import { useQuery } from "@tanstack/react-query";

export type UserProfile = {
  university_abbreviation: any;
  name: string | null;
  bio: string;
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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch profile");
      return data;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  });
}
