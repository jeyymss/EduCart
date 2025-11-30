"use server";

import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const body = await req.json();

  const { transactionId, amount } = body;

  if (!transactionId || !amount) {
    return Response.json({ error: "Missing parameters" }, { status: 400 });
  }

  // 1) Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  // 2) Fetch wallet
  const { data: wallet, error: walletError } = await supabase
    .from("wallets")
    .select("current_balance")
    .eq("user_id", user.id)
    .single();

  if (walletError || !wallet) {
    console.error("Wallet fetch error:", walletError);
    return Response.json({ error: "Wallet not found" }, { status: 404 });
  }

  if (wallet.current_balance < amount) {
    return Response.json({ error: "Insufficient balance" }, { status: 400 });
  }

  const newBalance = wallet.current_balance - amount;

  // 3) Update wallet balance
  const { error: updateErr } = await supabase
    .from("wallets")
    .update({ current_balance: newBalance })
    .eq("user_id", user.id);

  if (updateErr) {
    console.error("Wallet update error:", updateErr);
    return Response.json({ error: "Failed to deduct wallet" }, { status: 500 });
  }

  // 4) Insert wallet_transactions row
  const { error: logErr } = await supabase.from("wallet_transactions").insert({
    user_id: user.id,
    amount: -amount, // NEGATIVE = deduction
    type: "Payment",
    status: "Completed",
    description: `Paid ₱${amount} using wallet`,
    reference_id: transactionId,
  });

  if (logErr) {
    console.error("Wallet log error:", logErr);
    return Response.json({ error: "Failed to log payment" }, { status: 500 });
  }

  // 5) Update transaction status
  const { error: txnErr } = await supabase
    .from("transactions")
    .update({
      status: "Paid",
    })
    .eq("id", transactionId);

  if (txnErr) {
    console.error("Transaction update error:", txnErr);
    // we don't rollback wallet here, but you could improve this later
  }

  return Response.json({ success: true, newBalance });
}
