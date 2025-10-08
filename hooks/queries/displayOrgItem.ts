"use client";

import { useQuery } from "@tanstack/react-query";

export type OrgItem = {
  id: string;
  item_title: string;
  item_description: string | null;
  item_condition: string | null;
  item_price: number | null;
  status: "Listed" | "Sold" | "Unlisted";
  created_at: string;
  post_types: {
    id: number;
    name: string;
  } | null;
};

// ✅ Fetch posts for a specific organization account
async function fetchOrgItems(userId: string): Promise<OrgItem[]> {
  if (!userId) throw new Error("Missing organization user ID.");

  const res = await fetch(`/api/organization-account/userProduct/${userId}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch organization items: ${errorText}`);
  }

  return res.json();
}

// ✅ TanStack Query Hook
export function useDisplayOrgItems(userId?: string) {
  return useQuery({
    queryKey: ["displayOrgItems", userId],
    queryFn: () => fetchOrgItems(userId as string),
    enabled: !!userId, // only runs when ID is available
    refetchOnWindowFocus: false,
    staleTime: 1000 * 30, // 30 seconds freshness
  });
}
