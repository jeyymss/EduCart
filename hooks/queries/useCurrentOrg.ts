"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";

export type OrganizationRow = {
  user_id: string;
  organization_name: string;
  organization_description: string | null;
  email: string;
  avatar_url: string | null;
  background_url: string | null;
  role: "Organization";
  verification_status: "Pending" | "Verified" | "Rejected";
  subscription_quota_used: number;
  post_credits_balance: number;
  is_gcash_linked: boolean;
  total_earnings: string; // numeric comes back as string
  created_at: string; // ISO
  updated_at: string; // ISO
  university_id: number | null;
};

export function useCurrentOrganization() {
  return useQuery<OrganizationRow | null, Error>({
    queryKey: ["org", "me"],
    queryFn: async () => {
      const supabase = createClient();

      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();
      if (userErr) throw new Error(userErr.message);
      if (!user) return null;

      const { data, error } = await supabase
        .from("organizations")
        .select(
          "user_id, organization_name, organization_description, email, avatar_url, background_url, role, verification_status, subscription_quota_used, post_credits_balance, is_gcash_linked, total_earnings, created_at, updated_at, university_id"
        )
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw new Error(error.message);
      return (data as OrganizationRow) ?? null;
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
