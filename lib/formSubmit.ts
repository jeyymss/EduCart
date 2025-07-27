"use server";

import { createClient } from "@/utils/supabase/server";

export async function ForSale(formData: FormData) {
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
  };

  console.log(itemDetails.itemTitle);
  console.log(itemDetails.itemPrice);
  console.log(itemDetails.itemDescription);

  const { error: insertError } = await supabase.from("posts").insert([
    {
      user_id: userId,
      item_title: itemDetails.itemTitle,
      item_price: itemDetails.itemPrice,
      item_description: itemDetails.itemDescription,
    },
  ]);

  if (insertError) {
    console.log("Insert Failed: ", insertError);
    return { error: "Database error: " + insertError.message };
  }

  console.log("Post Success", userId);
}
