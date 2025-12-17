"use server";

import { createClient } from "@/utils/supabase/server";
import { withErrorHandling } from "@/hooks/withErrorHandling";

export async function PasaBuyTransaction(
  formData: FormData,
  conversationId: number,
  itemPrice: number | null,
  itemTitle: string | null,
  selectedType: string,
  selectPayment: string,
  sellerId: string,
  post_id: string,
  postType: string,
  deliveryLat?: number | null,
  deliveryLng?: number | null,
  deliveryAddress?: string,
  deliveryFee?: number | null,
  delivery_distance_km?: number | null
) {
  return await withErrorHandling(async () => {
    const supabase = await createClient();

    //get user session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) throw new Error("User not authenticated");
    if (!session.user.email) return { error: "User email is missing." };

    //set user id
    const userID = session.user.id

    if (!userID) return { error: "User ID is missing." };

    // Get values from the form
    const inputDate = formData.get("inputDate") as string;
    const inputTime = formData.get("inputTime") as string;
    const location = formData.get("inputLocation") as string | null;

    // Get selected items and price breakdown
    const selectedItemsStr = formData.get("selectedItems") as string;
    const selectedItems = selectedItemsStr ? JSON.parse(selectedItemsStr) : [];
    const itemsTotal = parseFloat(formData.get("itemsTotal") as string) || 0;
    const serviceFee = parseFloat(formData.get("serviceFee") as string) || 0;
    const totalPrice = parseFloat(formData.get("totalPrice") as string) || itemPrice || 0;

    // Store breakdown data: selected items in offered_item, itemsTotal in cash_added
    const pasabuyData = {
      items: selectedItems,
      itemsTotal: itemsTotal,
      serviceFee: serviceFee
    };
    const offeredItem = JSON.stringify(pasabuyData);
    const cashAdded = serviceFee; // Store service fee in cash_added for later retrieval

    // Fetch post_type id
    const { data: post_type } = await supabase
      .from("post_types")
      .select("id")
      .eq("name", postType)
      .single();

    if (!selectedType) {
      return { error: "Preferred method is required." };
    }

    if (!selectPayment) {
      return { error: "Payment method is required." };
    }

    // ✅ Insert transaction and RETURN id
    const { data: insertedTransaction, error: insertError } = await supabase
      .from("transactions")
      .insert([
        {
          buyer_id: userID,
          conversation_id: conversationId,
          seller_id: sellerId,
          post_id: post_id,
          offered_item: offeredItem,
          cash_added: cashAdded,
          post_type_id: post_type?.id,
          item_title: itemTitle,
          price: totalPrice, // Total of items + service fee + delivery fee (if delivery)
          fulfillment_method: selectedType,
          payment_method: selectPayment,
          meetup_location: location,
          meetup_date: inputDate || null,
          meetup_time: inputTime || null,
          delivery_location: deliveryAddress || null,
          delivery_lat: deliveryLat || null,
          delivery_lng: deliveryLng || null,
          delivery_fee: deliveryFee || null,
          delivery_distance_km: delivery_distance_km || null,
          status: "Pending",
        },
      ])
      .select("id") // 👈 return the transaction ID
      .single();

    if (insertError) {
      console.error("Insert Failed:", insertError);
      return {
        error: insertError.message,
      };
    }

    // ✅ Insert system message linked to this transaction
    const { error: messageError } = await supabase.from("messages").insert([
      {
        conversation_id: conversationId,
        sender_user_id: userID, // buyer is sender
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
