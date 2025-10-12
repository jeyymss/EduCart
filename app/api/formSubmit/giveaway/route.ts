"use server";

import { createClient } from "@/utils/supabase/server";
import { uploadImage } from "../../uploadImage/route";
import { withErrorHandling } from "@/hooks/withErrorHandling";

export async function Giveaway(
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
    

    //get user email
    const userEmail = session.user.email

    if (!userEmail) return { error: "User email is missing." };

    //get user id
    const userId = session.user.id

    if(!userId) return { error: "User ID is missing." };

    const itemTitle = formData.get("itemTitle") as string;
    const itemDescription = formData.get("itemDescription") as string;
    const images = formData.getAll("itemImage") as File[];

    if (images.length > 10) {
      return { error: "You can only upload up to 10 images." };
    }

    // Upload images only if provided
    const imageUrls = await uploadImage(
      images,
      "post-images",
      "post",
      userEmail
    );
    if (imageUrls.length === 0)
      return { error: "Failed to upload item images." };

    // Get Post Type (Giveaway)
    const { data: postType } = await supabase
      .from("post_types")
      .select("id")
      .eq("name", selectedType)
      .single();

    if (!postType) return { error: "Invalid post type selected." };

    // Get Category
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("name", selectedCategory)
      .single();

    if (!category) return { error: "Invalid category selected." };

    // Insert into Posts
    const { error: insertError } = await supabase.from("posts").insert([
      {
        post_user_id: userId,
        post_type_id: postType.id,
        category_id: category.id,
        item_condition: selectedCondition,
        item_title: itemTitle,
        item_description: itemDescription,
        image_urls: imageUrls.length > 0 ? imageUrls : null,
      },
    ]);

    if (insertError) {
      console.error("Insert Failed:", insertError);
      return { error: "Database error: " + insertError.message };
    }

    return { success: true };
  });
}
