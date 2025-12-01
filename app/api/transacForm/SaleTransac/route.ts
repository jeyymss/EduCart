"use server";

import { createClient } from "@/utils/supabase/server";
import { withErrorHandling } from "@/hooks/withErrorHandling";

export async function SaleTransaction(
  formData: FormData,
  conversationId: number,
  itemPrice: number | null,
  itemTitle: string | null,
  selectedType: string,
  selectPayment: string,
  sellerId: string,
  post_id: string,
  postType: string,
  deliveryLat: number | null,
  deliveryLng: number | null,
  deliveryAddress: string,
  deliveryFee: number | null,       // ✅ NEW
  distanceKm: number | null         // ✅ NEW
) {
  return await withErrorHandling(async () => {
    const supabase = await createClient();

    // Get user session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) throw new Error("User not authenticated");
    if (!session.user.email) return { error: "User email is missing." };

    const userID = session.user.id;
    if (!userID) return { error: "User ID is missing." };

    // Get meetup fields
    const inputDate = formData.get("inputDate") as string;
    const inputTime = formData.get("inputTime") as string;
    const location = formData.get("inputLocation") as string | null;

    // Fetch post_type id
    const { data: post_type } = await supabase
      .from("post_types")
      .select("id")
      .eq("name", postType)
      .single();

    if (!selectedType)
      return { error: "Preferred method is required." };

    if (!selectPayment)
      return { error: "Payment method is required." };

    // Delivery validation
    if (selectedType === "Delivery") {
      if (!deliveryLat || !deliveryLng)
        return { error: "Delivery location is required." };

      if (deliveryFee == null || distanceKm == null)
        return { error: "Delivery fee calculation failed." };
    }

    // Insert transaction and RETURN id
    const { data: insertedTransaction, error: insertError } = await supabase
      .from("transactions")
      .insert([
        {
          buyer_id: userID,
          conversation_id: conversationId,
          seller_id: sellerId,
          post_id: post_id,
          post_type_id: post_type?.id,
          item_title: itemTitle,
          price: itemPrice,

          // fulfillment
          fulfillment_method: selectedType,
          payment_method: selectPayment,

          // meetup
          meetup_location: selectedType === "Meetup" ? location : null,
          meetup_date: selectedType === "Meetup" ? inputDate || null : null,
          meetup_time: selectedType === "Meetup" ? inputTime || null : null,

          // delivery
          delivery_lat: selectedType === "Delivery" ? deliveryLat : null,
          delivery_lng: selectedType === "Delivery" ? deliveryLng : null,
          delivery_location: selectedType === "Delivery" ? deliveryAddress : null,
          delivery_fee: selectedType === "Delivery" ? deliveryFee : null,      // ✅ NEW
          delivery_distance_km: selectedType === "Delivery" ? distanceKm : null, // ✅ NEW

          status: "Pending",
        },
      ])
      .select("id")
      .single();

    if (insertError) {
      console.error("Insert Failed:", insertError);
      return { error: insertError.message };
    }

    // Insert system message
    const { error: messageError } = await supabase.from("messages").insert([
      {
        conversation_id: conversationId,
        sender_user_id: userID,
        transaction_id: insertedTransaction.id,
        type: "system",
        body: "Transaction Created",
      },
    ]);

    if (messageError) {
      console.error("System Message Insert Failed:", messageError);
      return { error: "Message error: " + messageError.message };
    }

    return { success: true, transactionId: insertedTransaction.id };
  });
}
