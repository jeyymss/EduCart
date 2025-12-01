"use server";

import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: wallet, error } = await supabase
    .from("wallets")
    .select("current_balance, escrow_balance")
    .eq("user_id", user.id)
    .single();

  if (error || !wallet) {
    console.error("Wallet fetch error:", error);
    return Response.json({ error: "Wallet not found" }, { status: 404 });
  }

  return Response.json({ balance: wallet.current_balance, escrow: wallet.escrow_balance });
}

