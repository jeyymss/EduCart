"use client";

import { useQuery } from "@tanstack/react-query";

export type OrganizationRow = {
  bio: string | null | undefined;
  user_id: string;
  universities: { id: number; abbreviation: string | null } | null;
  organization_name: string;
  organization_description: string | null;
  email: string;
  avatar_url: string | null;
  background_url: string | null;
  role: "Organization";
  subscription_quota_used: number;
  post_credits_balance: number;
  is_gcash_linked: boolean;
  total_earnings: string; // numeric comes back as string
  created_at: string; // ISO
  updated_at: string; // ISO
  university_id: number | null;
};

export const useCurrentOrganization = () => {
  return useQuery<OrganizationRow | null>({
    queryKey: ["organization", "me"], // still good key name
    queryFn: async () => {
      const res = await fetch("/api/user-profile-view/organization");
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Failed to fetch organization");
      return data;
    },
    staleTime: 1000 * 60 * 5, // cache is fresh for 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });
};
