"use server";

import { createClient } from "@/utils/supabase/server";
import { uploadImage } from "../uploadImage/route";

export async function ForSale(formData: FormData, selectedType: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const userId = user.id;

  const itemDetails = {
    itemTitle: formData.get("itemTitle") as string,
    itemPrice: Number(formData.get("itemPrice")),
    itemDescription: formData.get("itemDescription") as string,
    itemImage: formData.get("itemImage") as File,
  };

  const file = itemDetails.itemImage;

  if (!file || file.size === 0) {
    return { error: "Image is required." };
  }

  if (!user.email) {
    return { error: "User email is missing." };
  }

  //upload images to supabase
  const imageUrl = await uploadImage(file, "post-images", "post", user.email);

  if (!imageUrl) {
    return { error: "Failed to upload item image." };
  }

  console.log(itemDetails.itemDescription);
  console.log(itemDetails.itemTitle);
  console.log(itemDetails.itemPrice);

  const { data: postType } = await supabase
    .from("post_types")
    .select("id")
    .eq("name", selectedType)
    .single();

  console.log("selectedType from props: ", selectedType);

  if (!postType) {
    return { error: "Invalid post type selected" };
  }

  const { error: insertError } = await supabase.from("posts").insert([
    {
      seller_id: userId,
      item_title: itemDetails.itemTitle,
      item_price: itemDetails.itemPrice,
      item_description: itemDetails.itemDescription,
      post_type_id: postType.id,
      image_url: imageUrl,
    },
  ]);

  if (insertError) {
    console.log("Insert Failed: ", insertError);
    return { error: "Database error: " + insertError.message };
  }

  console.log("Post Success", userId);
}
