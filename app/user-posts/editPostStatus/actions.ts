"use server";

import { createClient } from "@/utils/supabase/server";


async function updatePostStatus(postId: string, newStatus: string) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (sessionError || !session) throw new Error("Not authenticated");

  //set user id
  const userID = session.user.id

  // Fetch current post to check status & ownership
  const { data: post, error: fetchError } = await supabase
    .from("posts")
    .select("status, post_user_id")
    .eq("id", postId)
    .single();

  if (fetchError || !post) throw new Error("Post not found");
  if (post.post_user_id !== userID) throw new Error("Unauthorized");

  // If already same status, no update needed
  if (post.status === newStatus) {
    return { success: true, updated: false };
  }

  // Update status
  const { error: updateError } = await supabase
    .from("posts")
    .update({ status: newStatus })
    .eq("id", postId);

  if (updateError) throw new Error(updateError.message);

  return { success: true, updated: true };
}

// Specific wrappers
export async function markAsListed(postId: string) {
  return updatePostStatus(postId, "Listed");
}

export async function markAsUnlisted(postId: string) {
  return updatePostStatus(postId, "Unlisted");
}
