import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, price, credits } = body;

    const supabase = await createClient();

    // Get user's email from id
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("email")
      .eq("id", userId)
      .single();

    if (userError || !user?.email) {
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    const { error } = await supabase.rpc("add_post_credits", {
      user_email: user.email,
      credits,
      payment_amount: price,
      payment_source: "Wallet",
    });

    if (error) {
      console.error("Wallet credit pay error:", error);
      return NextResponse.json(
        { error: "Failed to process wallet payment" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Wallet credit pay server error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
