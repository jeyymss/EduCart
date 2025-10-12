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
  postType: string
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

    // Check for existing pending transaction
    const { data: existingPending, error: checkError } = await supabase
      .from("transactions")
      .select("id")
      .eq("conversation_id", conversationId)
      .eq("status", "Pending")
      .maybeSingle();

    if (checkError) {
      console.error("Check error:", checkError);
    }

    if (existingPending) {
      return {
        error:
          "You already have a pending transaction for this conversation. Please wait for the seller to confirm.",
      };
    }

    const durationValue = formData.get("rentDurationValue");
    const durationUnit = formData.get("rentDurationUnit");
    // Get values from the form

    const rent_duration = `${durationValue} ${durationUnit}${
      Number(durationValue) > 1 ? "s" : ""
    }`;
    const inputDate = formData.get("inputDate") as string;
    const inputTime = formData.get("inputTime") as string;
    const location = formData.get("inputLocation") as string | null;

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

    // Insert transaction and RETURN id
    const { data: insertedTransaction, error: insertError } = await supabase
      .from("transactions")
      .insert([
        {
          buyer_id: userID,
          conversation_id: conversationId,
          seller_id: sellerId,
          post_id: post_id,
          rent_duration: rent_duration,
          post_type_id: post_type?.id,
          item_title: itemTitle,
          price: itemPrice,
          fulfillment_method: selectedType,
          payment_method: selectPayment,
          meetup_location: location,
          meetup_date: inputDate || null,
          meetup_time: inputTime || null,
          status: "Pending",
        },
      ])
      .select("id") 
      .single();

    if (insertError) {
      console.error("Insert Failed:", insertError);
      return {
        error: "Database error:" + insertError.message,
      };
    }

    //  Insert system message linked to this transaction
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
