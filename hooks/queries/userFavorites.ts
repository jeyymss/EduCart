import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export function useIsFavorite(postId?: string, userId?: string) {
  return useQuery({
    queryKey: ["favorite", userId, postId],
    queryFn: async () => {
      if (!postId || !userId) return false;
      const { data, error } = await supabase
        .from("favorites")
        .select("post_id")
        .eq("post_id", postId)
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
    enabled: !!postId && !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

// ✅ hook to toggle favorite
export function useToggleFavorite(postId?: string, userId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (isFav: boolean) => {
      if (!postId || !userId) return;
      if (isFav) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", userId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("favorites")
          .insert({ post_id: postId, user_id: userId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorite", userId, postId] });
      queryClient.invalidateQueries({ queryKey: ["user_favorites", userId] });
    },
  });
}
