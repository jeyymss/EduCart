import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const { userId, amount, gcash_number } = await req.json();
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("wallet_cash_out_instant", {
    p_user_id: userId,
    p_amount: Number(amount),
    p_gcash_number: gcash_number,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    reference_code: data,
  });
}
