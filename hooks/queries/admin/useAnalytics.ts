"use client";

import { useQuery } from "@tanstack/react-query";

export function useUserActivity(days: number = 30) {
  return useQuery({
    queryKey: ["admin-user-activity", days],
    queryFn: async () => {
      const res = await fetch(`/api/admin/analytics/user-activity?days=${days}`);
      if (!res.ok) {
        throw new Error("Failed to fetch user activity");
      }
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}

export function usePostTypes(days: number = 30) {
  return useQuery({
    queryKey: ["admin-post-types", days],
    queryFn: async () => {
      const res = await fetch(`/api/admin/analytics/post-types?days=${days}`);
      if (!res.ok) {
        throw new Error("Failed to fetch post types");
      }
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}

export function useRevenue(months: number = 6) {
  return useQuery({
    queryKey: ["admin-revenue", months],
    queryFn: async () => {
      const res = await fetch(`/api/admin/analytics/revenue?months=${months}`);
      if (!res.ok) {
        throw new Error("Failed to fetch revenue");
      }
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}
