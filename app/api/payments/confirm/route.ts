import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const { txnId, convId, totalPayment } = await req.json();

  const supabase = await createClient();

  // Get transaction details
  const { data: txn } = await supabase
    .from("transactions")
    .select("seller_id")
    .eq("id", txnId)
    .single();

  if (!txn) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  }

  const sellerId = txn.seller_id;

  // Mark as Paid
  await supabase
    .from("transactions")
    .update({
      status: "Paid",
      payment_channel: "GCash"
    })
    .eq("id", txnId);

  // Add escrow based on TOTAL PAYMENT
  await supabase.rpc("escrow_add_for_gcash", {
    p_seller_id: sellerId,
    p_amount: totalPayment,
    p_transaction_id: txnId,
  });

  return NextResponse.json({ success: true });
}

