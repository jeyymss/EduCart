"use server";

import { createClient } from "@/utils/supabase/server";
import { withErrorHandling } from "@/hooks/withErrorHandling";

export async function GiveawayTransaction(
  formData: FormData,
  conversationId: number,
  itemTitle: string | null,
  sellerId: string,
  post_id: string,
  postType: string
) {
  return await withErrorHandling(async () => {
    const supabase = await createClient();

    // Get user   
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("User not authenticated");

    const userID = user.id;

    // Extract form fields
    const selectedType = formData.get("selectedType") as string;
    const meetLocation = formData.get("meetLocation") as string;
    const meetDate = formData.get("meetDate") as string;
    const meetTime = formData.get("meetTime") as string;
    const deliveryAddress = formData.get("deliveryAddress") as string;
    const deliveryLat = formData.get("deliveryLat") as string;
    const deliveryLng = formData.get("deliveryLng") as string;

    // Fetch post_type ID
    const { data: post_type } = await supabase
      .from("post_types")
      .select("id")
      .eq("name", postType)
      .single();

    // ✅ Giveaway MUST have payment_method = NULL to satisfy DB constraint
    const payload: any = {
      buyer_id: userID,
      seller_id: sellerId,
      conversation_id: conversationId,
      post_id,
      post_type_id: post_type?.id,
      item_title: itemTitle,
      fulfillment_method: selectedType,
      payment_method: null, // IMPORTANT!
      status: "Pending",
    };

    // Add fields depending on method
    if (selectedType === "Meetup") {
      payload.meetup_location = meetLocation;
      payload.meetup_date = meetDate || null;
      payload.meetup_time = meetTime || null;
    }

    if (selectedType === "Delivery") {
      payload.delivery_location = deliveryAddress || null;
      payload.delivery_lat = deliveryLat ? Number(deliveryLat) : null;
      payload.delivery_lng = deliveryLng ? Number(deliveryLng) : null;
      payload.delivery_status = "WaitingForCourier";
    }

    const { data: insertedTransaction, error: insertError } = await supabase
      .from("transactions")
      .insert([payload])
      .select("id")
      .single();

    if (insertError) throw new Error(insertError.message);

    // Insert system message
    await supabase.from("messages").insert([
      {
        conversation_id: conversationId,
        sender_user_id: userID,
        transaction_id: insertedTransaction.id,
        type: "system",
        body: "Giveaway transaction created",
      },
    ]);

    return { success: true, transactionId: insertedTransaction.id };
  });
}
