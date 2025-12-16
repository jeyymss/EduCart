"use server";

import { createClient } from "@/utils/supabase/server";
import { withErrorHandling } from "@/hooks/withErrorHandling";

export async function PasaBuySubmit(formData: FormData, selectedType: string) {
  return await withErrorHandling(async () => {
    const supabase = await createClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) throw new Error("User not authenticated");
    if (!session.user.email) return { error: "User email is missing." };

    const userId = session.user.id;

    const itemTitle = formData.get("itemTitle") as string;
    const itemServiceFee = Number(formData.get("itemServiceFee"));
    const pasabuyLocation = formData.get("pasabuyLocation") as string;
    const pasabuyCutOffDate = formData.get("pasabuyCutOffDate") as string;
    const itemDescription = formData.get("itemDescription") as string;

    const sellerLat = formData.get("seller_lat") ? Number(formData.get("seller_lat")) : null;
    const sellerLng = formData.get("seller_lng") ? Number(formData.get("seller_lng")) : null;
    const sellerAddress = formData.get("seller_address") as string;

    // ✅ Parse items
    const itemsRaw = formData.get("items") as string | null;
    if (!itemsRaw) return { error: "No items were provided." };

    let items: { productName: string; price: number }[];
    try {
      items = JSON.parse(itemsRaw);
    } catch {
      return { error: "Invalid items format." };
    }

    if (!Array.isArray(items) || items.length === 0) {
      return { error: "Please add at least one item." };
    }

    for (const it of items) {
      if (!it.productName?.trim()) return { error: "Item name is required." };
      if (typeof it.price !== "number" || isNaN(it.price) || it.price < 0) {
        return { error: "Item price is invalid." };
      }
    }

    // ✅ Get post type id
    const { data: postType } = await supabase
      .from("post_types")
      .select("id")
      .eq("name", selectedType)
      .single();

    if (!postType) return { error: "Invalid post type selected." };

    // ✅ Insert post and get id
    const { data: createdPost, error: insertError } = await supabase
      .from("posts")
      .insert([
        {
          post_user_id: userId,
          post_type_id: postType.id,
          item_service_fee: itemServiceFee,
          item_pasabuy_location: pasabuyLocation,
          item_pasabuy_cutoff: pasabuyCutOffDate,
          item_title: itemTitle,
          item_description: itemDescription,
          pickup_lat: sellerLat,
          pickup_lng: sellerLng,
          pickup_location: sellerAddress,
        },
      ])
      .select("id")
      .single();

    if (insertError || !createdPost) {
      console.error("Insert Failed: ", insertError);
      return { error: "Database error: " + insertError?.message };
    }

    // ✅ Insert items linked to the post
    const itemsPayload = items.map((it) => ({
      post_id: createdPost.id,
      product_name: it.productName.trim(),
      price: it.price,
    }));

    const { error: itemsError } = await supabase
      .from("pasabuy_items")
      .insert(itemsPayload);

    if (itemsError) {
      console.error("Items insert failed:", itemsError);

      // optional cleanup
      await supabase.from("posts").delete().eq("id", createdPost.id);

      return { error: "Failed to save items: " + itemsError.message };
    }

    return { success: true, postId: createdPost.id };
  });
}
