"use server";

import { createClient } from "@/utils/supabase/server";
import { withErrorHandling } from "@/hooks/withErrorHandling";

export async function RentTransaction(
  formData: FormData,
  conversationId: number,
  itemPrice: number | null,
  itemTitle: string | null,
  selectedType: string,
  selectPayment: string,
  sellerId: string,
  post_id: string,
  postType: string,
  rentStart: string | null,   
  rentEnd: string | null      
) {
  return await withErrorHandling(async () => {
    const supabase = await createClient();

    // Get user 
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("User not authenticated");
    if (!user.email) return { error: "User email is missing." };

    const userID = user.id;
    if (!userID) return { error: "User ID is missing." };

    // Get meet-up values
    const inputDate = formData.get("inputDate") as string;
    const inputTime = formData.get("inputTime") as string;
    const location = formData.get("inputLocation") as string | null;

    // Fetch post_type ID
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

    // Insert transaction
    const { data: insertedTransaction, error: insertError } = await supabase
      .from("transactions")
      .insert([
        {
          buyer_id: userID,
          seller_id: sellerId,
          conversation_id: conversationId,
          post_id,
          post_type_id: post_type?.id,
          item_title: itemTitle,
          price: itemPrice,
          fulfillment_method: selectedType,
          payment_method: selectPayment,

          // Meetup details
          meetup_location: location,
          meetup_date: inputDate || null,
          meetup_time: inputTime || null,

          // ✅ RENT Duration (correct)
          rent_start_date: rentStart,
          rent_end_date: rentEnd,

          status: "Pending",
        },
      ])
      .select("id")
      .single();

    if (insertError) {
      console.error("Insert Failed:", insertError);
      return { error: insertError.message };
    }

    // Insert linked system message
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
