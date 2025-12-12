import { useQuery } from "@tanstack/react-query";

export type UserProfile = {
  user_id: string;
  full_name: string | null;
  email: string;
  role: string | null;
  avatar_url: string | null;
  background_url: string | null;
  bio: string | null;
  post_credits_balance: number;
  created_at: string;
  updated_at: string;

  universities: {
    id: number;
    abbreviation: string | null;
  } | null;

  profile_type: "Individual" | "Organization";

  // organization-specific (nullable for individuals)
  owner_user_id?: string | null;
  organization_name?: string | null;
  organization_description?: string | null;
  organization_email?: string | null;
  organization_role?: string | null;
  is_gcash_linked?: boolean | null;
  total_earnings?: number | null;
  business_type?: string | null;
  documents?: string[] | null;
};

export function useUserProfile() {
  return useQuery<UserProfile>({
    queryKey: ["user-profile"],
    queryFn: async () => {
      // Try individual
      let res = await fetch("/api/user-profile-view/individual", {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        return { ...data, profile_type: "Individual" } as UserProfile;
      }

      // Try organization
      res = await fetch("/api/user-profile-view/organization", {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        return { ...data, profile_type: "Organization" } as UserProfile;
      }

      throw new Error("Profile not found");
    },
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
}
