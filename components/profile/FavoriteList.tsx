"use client";

import {
  ItemCard,
  ItemCardSkeleton,
} from "@/components/posts/displayposts/ItemCard";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";

export function FavoritesList({ userId }: { userId: string }) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const { data: favorites, isLoading } = useQuery({
    queryKey: ["favorites", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_favorites")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;
      return data;
    },
  });

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
      await queryClient.cancelQueries({ queryKey: ["favorites", userId] });
      const prev = queryClient.getQueryData<any[]>(["favorites", userId]);
      queryClient.setQueryData<any[]>(["favorites", userId], (old) =>
        old ? old.filter((f) => f.id !== postId) : []
      );
      return { prev };
    },
    onError: (_err, _postId, ctx) => {
      // Rollback on error
      if (ctx?.prev) {
        queryClient.setQueryData(["favorites", userId], ctx.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites", userId] });
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
          key={item.id}
          id={item.id}
          title={item.item_title}
          price={item.item_price ?? undefined}
          condition={item.condition ?? ""}
          category_name={item.category_name ?? ""}
          post_type={item.post_type_name ?? ""}
          created_at={item.created_at}
          image_urls={item.image_urls ?? []}
          seller={""}
          status={item.status}
          isOwner={false}
          isFav={true}
          onToggleFavorite={() => removeFavorite.mutate(item.id)}
        />
      ))}
    </div>
  );
}
