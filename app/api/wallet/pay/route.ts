"use server";

import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const body = await req.json();

  const { transactionId, amount, deliveryFee } = body;

  if (!transactionId || amount == null) {
    return Response.json({ error: "Missing parameters" }, { status: 400 });
  }

  // 1) Get logged-in user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  // 2) Fetch wallet for balance check only
  const { data: wallet, error: walletError } = await supabase
    .from("wallets")
    .select("current_balance")
    .eq("user_id", user.id)
    .single();

  if (walletError || !wallet) {
    return Response.json({ error: "Wallet not found" }, { status: 404 });
  }

  if (wallet.current_balance < amount) {
    return Response.json({ error: "Insufficient balance" }, { status: 400 });
  }

  // 3) ONLY update transaction → Trigger handles the payment
  const { error: txnErr } = await supabase
    .from("transactions")
    .update({
      status: "Paid",
      delivery_fee: deliveryFee ?? null,
    })
    .eq("id", transactionId);

  if (txnErr) {
    console.error("Transaction update error:", txnErr);
    return Response.json(
      { error: "Failed to update transaction status" },
      { status: 500 }
    );
  }

  // Trigger will deduct wallet + move escrow + log everything
  return Response.json({ success: true });
}
