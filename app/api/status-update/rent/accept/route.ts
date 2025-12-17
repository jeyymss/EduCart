import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const { transactionId } = await req.json();

    const supabase = await createClient();

    // Get transaction details first to get buyer_id and post details
    const { data: transaction, error: fetchError } = await supabase
      .from("transactions")
      .select(`
        *,
        post:post_id (
          item_title
        )
      `)
      .eq("id", transactionId)
      .single();

    if (fetchError) throw fetchError;
    if (!transaction) throw new Error("Transaction not found");

    // Update transaction status to Accepted
    const { error } = await supabase
      .from("transactions")
      .update({ status: "Accepted" })
      .eq("id", transactionId);

    if (error) throw error;

    // Create notification for buyer
    const post = Array.isArray(transaction.post)
      ? transaction.post[0]
      : transaction.post;

    const itemTitle = post?.item_title || "Item";

    await supabase.from("notifications").insert({
      user_id: transaction.buyer_id,
      message: `Your rental request for "${itemTitle}" has been accepted by the seller.`,
      type: "transaction_update",
      related_id: transactionId,
    });

    return NextResponse.json({ success: true });

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
