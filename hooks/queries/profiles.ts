import { useQuery } from "@tanstack/react-query";

export type PublicProfile = {
  user_id: string;
  full_name: string;
  role: string;
  university_abbreviation: string | null;
  university_name: string | null;
  avatar_url: string | null;
  bio: string | null; // 👈 Added bio here (optional in DB, safe in TS)
};

export type PublicListing = {
  id: string;
  user_id: string;
  item_title: string;
  item_price: number | null;
  item_description: string;
  created_at: string;
  image_urls: string[] | null;
  item_condition: string | null;
  post_type_name: string;
  category_name: string | null;
};

export const usePublicProfile = (
  userId?: string,
  opts?: { enabled?: boolean }
) =>
  useQuery<PublicProfile>({
    queryKey: ["publicProfile", userId],
    queryFn: async () => {
      const r = await fetch(`/api/profiles/${userId}`, { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Failed to load profile");
      return j as PublicProfile;
    },
    enabled: !!userId && (opts?.enabled ?? true),
    staleTime: 5 * 60 * 1000,
  });

export const usePublicListings = (userId: string, page = 1, limit = 12) =>
  useQuery<{
    data: PublicListing[];
    count: number;
    page: number;
    limit: number;
  }>({
    queryKey: ["publicListings", userId, page, limit],
    queryFn: async () => {
      const r = await fetch(
        `/api/profiles/${userId}/listings?page=${page}&limit=${limit}`,
        { cache: "no-store" }
      );
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Failed to load listings");
      return j as {
        data: PublicListing[];
        count: number;
        page: number;
        limit: number;
      };
    },
    enabled: !!userId,
    placeholderData: (prev) => prev,
    staleTime: 5 * 60 * 1000,
  });
