import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, credits, amount } = body;

    const supabase = await createClient();

    const { error } = await supabase.rpc("add_post_credits", {
      user_email: email,
      credits,
      payment_amount: amount,
      payment_source: "GCash",
    });

    if (error) {
      console.error("Credits complete error:", error);
      return NextResponse.json(
        { error: "Failed to apply credits" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Credits complete server error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
