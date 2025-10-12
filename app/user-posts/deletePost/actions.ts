"use server";

import { createClient } from "@/utils/supabase/server";

export async function deletePost(postId: string) {
  const supabase = await createClient();

  // Get the logged-in user
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    throw new Error("Not authenticated");
  }

  // set user to 
  const userID = session.user.id

  // Delete only if the post belongs to the logged-in user
  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId)
    .eq("post_user_id", userID); 

  if (error) {
    console.error("❌ Error deleting post:", error);
    throw new Error("Failed to delete post");
  }

  return { success: true };
}
