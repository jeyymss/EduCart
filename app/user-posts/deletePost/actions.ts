"use server";

import { createClient } from "@/utils/supabase/server";

export async function deletePost(postId: string) {
  const supabase = await createClient();

  // Get the logged-in user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Not authenticated");
  }

  // Delete only if the post belongs to the logged-in user
  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId)
    .eq("post_user_id", user.id); // 👈 ownership check

  if (error) {
    console.error("❌ Error deleting post:", error);
    throw new Error("Failed to delete post");
  }

  return { success: true };
}
