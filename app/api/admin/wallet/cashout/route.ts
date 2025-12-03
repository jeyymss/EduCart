import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const { amount } = await req.json();
    const supabase = await createClient();

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Execute SQL function
    const { data, error } = await supabase.rpc("platform_wallet_cashout", {
      p_amount: Number(amount),
    });

    if (error) {
      console.error("PLATFORM CASHOUT ERROR:", error);
      return NextResponse.json(
        { error: "Failed to process cash out" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      reference_code: data,
    });
  } catch (err) {
    console.error("SERVER ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
