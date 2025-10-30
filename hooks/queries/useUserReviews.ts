"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";

export interface Review {
  id: string;
  reviewer_id: string;
  reviewed_user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer_name: string | null;
  reviewer_avatar: string | null;
  reviewer_background: string | null;
  reviewer_bio: string | null;
  university_abbreviation: string | null;
  university_name: string | null;
  reviewer_role: string | null;
}

export const fetchUserReviews = async (userId: string): Promise<Review[]> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("reviews_with_profiles")
    .select("*")
    .eq("reviewed_user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Error fetching reviews:", error);
    throw error;
  }

  return (data as unknown as Review[]) ?? [];
};

export function useUserReviews(userId: string) {
  return useQuery<Review[], Error>({
    queryKey: ["userReviews", userId],
    queryFn: () => fetchUserReviews(userId),
    enabled: !!userId,
  });
}
