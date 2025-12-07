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

  // Fetch only wallet balance - optimized for speed
  const { data: wallet } = await supabase
    .from("wallets")
    .select("current_balance, escrow_balance")
    .eq("user_id", user.id)
    .single();

  return Response.json({
    balance: wallet?.current_balance ?? 0,
    escrow: wallet?.escrow_balance ?? 0,
  });
}
