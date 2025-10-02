import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type GiveawayPost = {
  id: string;
  item_title: string;
  post_user_id: string;
  item_description: string | null;
  image_urls: string[];
  created_at: string;
  item_condition: string | null;
  category_name: string | null;
  user_name: string;
  user_avatar_url?: string | null;
  user_role: string;
  university_abbr?: string | null;
  like_count: number;
  comment_count: number;
  is_liked: boolean;
};

export type GiveawayComment = {
  id: string;
  post_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  full_name: string;
  avatar_url?: string;
  replies: GiveawayComment[];
};

// Fetch posts
export const useGiveawayPosts = () =>
  useQuery<GiveawayPost[]>({
    queryKey: ["giveaway-posts"],
    queryFn: async () => {
      const res = await fetch("/api/posts/giveaways", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch giveaways");
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });

// Fetch comments
export const useGiveawayComments = (postId: string) =>
  useQuery<GiveawayComment[]>({
    queryKey: ["giveaway-comments", postId],
    queryFn: async () => {
      const res = await fetch(`/api/posts/giveaways/${postId}/comments`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch comments");
      return data;
    },
  });

// Toggle like
export const useToggleGiveawayLike = (postId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/posts/giveaways/${postId}/like`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to like/unlike");
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["giveaway-posts"] });
    },
  });
};

// Add comment
export const useAddGiveawayComment = (postId: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      body,
      parentId,
    }: {
      body: string;
      parentId?: string | null;
    }) => {
      const res = await fetch(`/api/posts/giveaways/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, parentId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add comment");
      return data;
    },

    // ✅ Optimistic update (instant feedback)
    onMutate: async (newComment) => {
      await qc.cancelQueries({ queryKey: ["giveaway-comments", postId] });

      const prevComments =
        qc.getQueryData<GiveawayComment[]>(["giveaway-comments", postId]) || [];

      // If it's a reply, find the parent and add into its replies
      if (newComment.parentId) {
        const updated = prevComments.map((c) =>
          c.id === newComment.parentId
            ? {
                ...c,
                replies: [
                  ...(c.replies || []),
                  {
                    id: "temp-" + Date.now(),
                    post_id: postId,
                    user_id: "temp-user",
                    parent_id: newComment.parentId,
                    content: newComment.body,
                    created_at: new Date().toISOString(),
                    full_name: "You",
                    avatar_url: null,
                    replies: [],
                  },
                ],
              }
            : c
        );

        qc.setQueryData(["giveaway-comments", postId], updated);
      } else {
        // New top-level comment
        qc.setQueryData(
          ["giveaway-comments", postId],
          [
            ...prevComments,
            {
              id: "temp-" + Date.now(),
              post_id: postId,
              user_id: "temp-user",
              parent_id: null,
              content: newComment.body,
              created_at: new Date().toISOString(),
              full_name: "You",
              avatar_url: null,
              replies: [],
            },
          ]
        );
      }

      return { prevComments };
    },

    // ✅ Rollback if failed
    onError: (_err, _newComment, context) => {
      if (context?.prevComments) {
        qc.setQueryData(["giveaway-comments", postId], context.prevComments);
      }
    },

    // ✅ Always refetch fresh data from API
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["giveaway-comments", postId] });
      qc.invalidateQueries({ queryKey: ["giveaway-posts"] });
    },
  });
};
