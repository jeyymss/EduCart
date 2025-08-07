"use server";

import { createClient } from "@/utils/supabase/server";
import { withErrorHandling } from "@/hooks/withErrorHandling";

export async function EmergencyAPI(formData: FormData, selectedType: string) {
  return await withErrorHandling(async () => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("User not authenticated");
    if (!user.email) return { error: "User email is missing." };

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
        post_user_id: user.id,
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
