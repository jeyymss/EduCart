"use server";

import { createClient } from "@/utils/supabase/server";
import { withErrorHandling } from "@/hooks/withErrorHandling";

export async function TradeTransaction(
  formData: FormData,
  conversationId: number,
  itemPrice: number | null,
  itemTitle: string | null,
  selectedType: string,
  selectPayment: string | null,
  sellerId: string,
  post_id: string,
  postType: string
) {
  return await withErrorHandling(async () => {
    const supabase = await createClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) throw new Error("User not authenticated");
    if (!session.user.email) return { error: "User email is missing." };

    const userID = session.user.id;
    if (!userID) return { error: "User ID is missing." };

    // Read form values (use const — no reassignment)
    const cashAddedRaw = formData.get("cashAdded");
    const cashAdded =
      cashAddedRaw && cashAddedRaw !== "" ? Number(cashAddedRaw) : 0;

    const offeredItem = formData.get("offeredItem") as string;
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

    // 🔥 TRADE PAYMENT RULES 🔥
    let cleanedPaymentMethod = selectPayment;

    // Case 1: Trade WITHOUT price → MUST NOT have a payment method
    if (postType === "Trade" && (!itemPrice || Number(itemPrice) === 0)) {
      cleanedPaymentMethod = null;
    }

    // Case 2: Trade WITH price → MUST HAVE payment method
    if (postType === "Trade" && itemPrice && Number(itemPrice) > 0) {
      if (!cleanedPaymentMethod || cleanedPaymentMethod.trim() === "") {
        return {
          error: "Payment method is required when trade includes additional cash.",
        };
      }
    }

    // Normalize empty string → null
    if (cleanedPaymentMethod === "" || cleanedPaymentMethod === undefined) {
      cleanedPaymentMethod = null;
    }

    // INSERT TRANSACTION
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
          price: itemPrice,
          fulfillment_method: selectedType,
          payment_method: cleanedPaymentMethod,
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
      return { error: insertError.message };
    }

    // SYSTEM MESSAGE
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
