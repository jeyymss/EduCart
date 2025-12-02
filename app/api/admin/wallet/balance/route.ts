import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Fetch the platform wallet (assumes there's only one row)
    const { data, error } = await supabase
      .from("platform_wallet")
      .select("balance")
      .limit(1)
      .single();

    if (error) {
      console.error("Error fetching platform wallet:", error);
      return NextResponse.json(
        { error: "Failed to load wallet balance" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      balance: data.balance,
    });
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
