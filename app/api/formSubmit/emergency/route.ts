"use server";

import { createClient } from "@/utils/supabase/server";
import { withErrorHandling } from "@/hooks/withErrorHandling";

export async function EmergencySubmit(
  formData: FormData,
  selectedType: string
) {
  return await withErrorHandling(async () => {
    const supabase = await createClient();

    //get user session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) throw new Error("User not authenticated");
    if (!session.user.id) return { error: "User email is missing." };
    
    //get user id
    const userId = session.user.id

    if(!userId) return { error: "User ID is missing."};

    const itemTitle = formData.get("itemTitle") as string;
    const itemDescription = formData.get("itemDescription") as string;

    //set selected post type (EMERGENCY LENDING)
    const { data: postType } = await supabase
      .from("post_types")
      .select("id")
      .eq("name", selectedType)
      .single();

    if (!postType) return { error: "Invalid post type selected." };

    //Insert in posts table
    const { error: insertError } = await supabase.from("posts").insert([
      {
        post_user_id: userId,
        post_type_id: postType.id,
        item_title: itemTitle,
        item_description: itemDescription,
      },
    ]);

    if (insertError) {
      console.error("Insert Failed: ", insertError);
      return { error: "Database error: " + insertError.message };
    }
  });
}
