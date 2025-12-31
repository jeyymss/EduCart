import { useQuery } from "@tanstack/react-query";

export type Users = {
  user_id: string;
  name: string;
  email: string;
  role: string;
  university: string | null;
  created_at: string;
  avatar_url: string | null;
  credits: number | null;
  status: string | null;
};

export const manageUsers = () => {
  return useQuery<Users[]>({
    queryKey: ["AllUsers"],
    queryFn: async () => {
      const res = await fetch("/api/admin/manageUsers");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch items");
      return data as Users[];
    },
    staleTime: 1000 * 60 * 3,
    refetchOnWindowFocus: true,
  });
};
