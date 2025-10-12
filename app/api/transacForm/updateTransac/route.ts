"use server";

import { createClient } from "@/utils/supabase/server";
import { withErrorHandling } from "@/hooks/withErrorHandling";

export async function UpdateTransactionStatus(
  transactionId: string,
  conversationId: number,
  userId: string,
  newStatus: "Accepted" | "Cancelled"
) {
  return await withErrorHandling(async () => {
    const supabase = await createClient();

    // Update transaction status
    const { error: updateError } = await supabase
      .from("transactions")
      .update({ status: newStatus })
      .eq("id", transactionId);

    if (updateError) {
      console.error("Update failed:", updateError);
      return { error: updateError.message };
    }

    // Insert system message so both sides see update
    const { error: messageError } = await supabase.from("messages").insert([
      {
        conversation_id: conversationId,
        sender_user_id: userId, // the one who acted
        transaction_id: transactionId,
        type: "system",
        body: `Transaction ${newStatus}`,
      },
    ]);

    if (messageError) {
      console.error("Message insert failed:", messageError);
      return { error: messageError.message };
    }

    return { success: true };
  });
}
