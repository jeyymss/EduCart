import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";

export type Users = {
  full_name: string;
  email: string;
  role: string;
  university_id: number;
  verification_status: string;
  created_at: string;
  universities: { abbreviation: string };
};

export const manageUsers = () => {
  return useQuery<Users[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/manageUsers");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch items");
      return data;
    },
    staleTime: 1000 * 60 * 3,
    refetchOnWindowFocus: true,
  });
};
