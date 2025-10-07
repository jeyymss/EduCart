"use client";

import { useQuery } from "@tanstack/react-query";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/getDashboardStats");
      if (!res.ok) {
        if (res.status === 403) throw new Error("unauthorized");
        throw new Error("Failed to fetch dashboard stats");
      }

      const data = await res.json();
      return {
        individuals: data.totalIndividuals as number,
        organizations: data.totalOrganizations as number,
        transactions: data.totalTransactions as number,
      };
    },
    staleTime: 1000 * 60, // 1 minute cache
  });
}
