import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

    if (!user) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

  // Fetch wallet balances
  const { data: wallet } = await supabase
    .from("wallets")
    .select("current_balance, escrow_balance")
    .eq("user_id", user.id)
    .single();

  // Fetch wallet transactions
  const { data: transactions } = await supabase
    .from("wallet_transactions")
    .select("id, description, amount, type, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return Response.json({
    balance: wallet?.current_balance ?? 0,
    escrow: wallet?.escrow_balance ?? 0,
    transactions: transactions ?? [],
  });
}
