"use server";

import { createClient } from "@/utils/supabase/server";
import { uploadImage } from "../../uploadImage/route";
import { withErrorHandling } from "@/hooks/withErrorHandling";

export async function ForTrade(
  formData: FormData,
  selectedType: string,
  selectedCategory: string,
  selectedCondition: string
) {
  return await withErrorHandling(async () => {
    const supabase = await createClient();

    //get user session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) throw new Error("User not authenticated");

    // set user email
    const userEmail = session.user.email

    if (!userEmail) return { error: "User email is missing." };

    // set user ID
    const userID = session.user.id

    if (!userID) return { error: "User ID is missing." };

    const itemTitle = formData.get("itemTitle") as string;
    const rawPrice = Number(formData.get("itemPrice"));
    const itemPrice = rawPrice ? Number(rawPrice) : null;
    const itemDescription = formData.get("itemDescription") as string;
    const itemTrade = formData.get("itemTrade") as string;
    const images = formData.getAll("itemImage") as File[];

    if (images.length > 10) {
      return { error: "You can only upload up to 10 images." };
    }

    const imageUrls = await uploadImage(
      images,
      "post-images",
      "post",
      userEmail
    );
    if (imageUrls.length === 0)
      return { error: "Failed to upload item images." };

    const { data: postType } = await supabase
      .from("post_types")
      .select("id")
      .eq("name", selectedType)
      .single();

    if (!postType) return { error: "Invalid post type selected." };

    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("name", selectedCategory)
      .single();

    if (!category) return { error: "Invalid category selected." };

    const { error: insertError } = await supabase.from("posts").insert([
      {
        post_user_id: userID,
        post_type_id: postType.id,
        category_id: category.id,
        item_condition: selectedCondition,
        item_title: itemTitle,
        item_trade: itemTrade,
        item_price: itemPrice,
        item_description: itemDescription,
        image_urls: imageUrls,
      },
    ]);

    if (insertError) {
      console.error("Insert Failed:", insertError);
      return { error: "Database error: " + insertError.message };
    }

    return { success: true };
  });
}
