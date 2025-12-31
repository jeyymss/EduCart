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
        totalUsers: data.totalUsers as number,
        creditSales: data.creditSales as number,
        commissions: data.commissions as number,
        monthlyRevenue: data.monthlyRevenue as number,
      };
    },
    staleTime: 1000 * 60, // 1 minute cache
  });
}
