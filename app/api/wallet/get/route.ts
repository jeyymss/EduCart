"use server";

import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();

  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Fetch wallet
  const { data: wallet, error } = await supabase
    .from("wallets")
    .select("current_balance")
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch wallet" }, { status: 500 });
  }

  return Response.json({ balance: wallet.current_balance });
}
