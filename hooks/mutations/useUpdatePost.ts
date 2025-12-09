"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type UpdatePostData = {
  item_price?: number | null;
  item_description?: string | null;
  item_trade?: string | null;
  item_service_fee?: number | null;
  quantity?: number | null;
};

export function useUpdatePost(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updateData: UpdatePostData) => {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update post");
      return data;
    },
    onMutate: () => toast.loading("Updating post..."),
    onSuccess: () => {
      toast.success("Post updated successfully!");
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["product", postId] });
      queryClient.invalidateQueries({ queryKey: ["userProducts"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to update post"),
    onSettled: () => toast.dismiss(),
  });
}
