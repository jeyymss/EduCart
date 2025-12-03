import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const { userId, amount, reference_code } = await req.json();
    const supabase = await createClient();

    if (!userId || !amount || !reference_code) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    // Call function to add balance + complete TX
    const { error } = await supabase.rpc("wallet_complete_cash_in", {
      p_user_id: userId,
      p_amount: Number(amount),
      p_reference_code: reference_code,
    });

    if (error) {
      console.error("CONFIRM ERROR:", error);
      return NextResponse.json({ error: "Failed to complete cash in" }, { status: 400 });
    }

    return NextResponse.json({ success: true });

  } catch (e) {
    console.error("CONFIRM API ERROR:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
