"use server";

import { createClient } from "@/utils/supabase/server";
import { withErrorHandling } from "@/hooks/withErrorHandling";

export async function PasaBuySubmit(formData: FormData, selectedType: string) {
  return await withErrorHandling(async () => {
    const supabase = await createClient();

    //get user session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) throw new Error("User not authenticated");
    if (!session.user.email) return { error: "User email is missing." };

    //set user id
    const userId = session.user.id

    const itemTitle = formData.get("itemTitle") as string;
    const itemServiceFee = Number(formData.get("itemServiceFee"));
    const pasabuyLocation = formData.get("pasabuyLocation") as string;
    const pasabuyCutOffDate = formData.get("pasabuyCutOffDate") as string;
    const itemDescription = formData.get("itemDescription") as string;

    //set selected post type (PASABUY)
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
        item_service_fee: itemServiceFee,
        item_pasabuy_location: pasabuyLocation,
        item_pasabuy_cutoff: pasabuyCutOffDate,
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
