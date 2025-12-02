import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("platform_earnings")
      .select("total_earnings")
      .eq("id", 1)
      .single();

    if (error) {
      console.error("Error fetching platform earnings:", error);
      return NextResponse.json({ error: "Failed to fetch earnings" }, { status: 500 });
    }

    return NextResponse.json({
      totalEarnings: data.total_earnings
    });

  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
