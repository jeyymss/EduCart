"use client";

import {
  ItemCard,
  ItemCardSkeleton,
} from "@/components/posts/displayposts/ItemCard";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { useUserFavorites } from "@/hooks/queries/favorites";

export function FavoritesList({ userId }: { userId: string }) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const { data: favorites, isLoading } = useUserFavorites(userId);

  const removeFavorite = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("post_id", postId);
      if (error) throw error;
    },
    onMutate: async (postId) => {
      // Optimistic update: remove from cache immediately
      await queryClient.cancelQueries({ queryKey: ["user_favorites", userId] });
      const prev = queryClient.getQueryData<any[]>(["user_favorites", userId]);
      queryClient.setQueryData<any[]>(["user_favorites", userId], (old) =>
        old ? old.filter((f) => f.post_id !== postId) : []
      );
      return { prev };
    },
    onError: (_err, _postId, ctx) => {
      // Rollback on error
      if (ctx?.prev) {
        queryClient.setQueryData(["user_favorites", userId], ctx.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["user_favorites", userId] });
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <ItemCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!favorites || favorites.length === 0) {
    return <p className="text-center text-gray-500 mt-4">No favorites yet.</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {favorites.map((item: any) => (
        <ItemCard
          key={item.post_id}
          id={item.post_id}
          title={item.item_title ?? ""}
          price={item.item_price ?? undefined}
          description={item.item_description ?? ""}
          condition={item.item_condition ?? ""}
          category_name={item.category_name ?? ""}
          post_type={item.post_type_name ?? ""}
          created_at={item.created_at}
          image_urls={item.image_urls ?? []}
          seller={item.full_name ?? ""}
          status={item.status ?? "Listed"}
          isOwner={false}
          isFav={true}
          onToggleFavorite={() => removeFavorite.mutate(item.post_id)}
        />
      ))}
    </div>
  );
}
