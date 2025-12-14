"use client";

import { useQuery } from "@tanstack/react-query";

export type Report = {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  report_type: string;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  report_target_type: string;
  reference_code: string | null;
  reported_item_id: string | null;
  reported_transaction_id: string | null;
  reporter: {
    id: string;
    email: string;
    individuals: { full_name: string } | null;
    organizations: { organization_name: string } | null;
  };
  reported_user: {
    id: string;
    email: string;
    individuals: { full_name: string } | null;
    organizations: { organization_name: string } | null;
  };
  reported_item: {
    id: string;
    item_title: string;
  } | null;
  reported_transaction: {
    id: string;
    reference_code: string;
  } | null;
};

export function useReports() {
  return useQuery({
    queryKey: ["adminReports"],
    queryFn: async () => {
      const res = await fetch("/api/admin/getReports");
      if (!res.ok) {
        if (res.status === 403) throw new Error("unauthorized");
        throw new Error("Failed to fetch reports");
      }

      const data = await res.json();
      return data.reports as Report[];
    },
    staleTime: 1000 * 60, // 1 minute cache
  });
}
