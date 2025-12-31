import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { checkIfAdmin } from "@/utils/checkAdmin";

export async function GET(request: Request) {
  try {
    const { isAdmin } = await checkIfAdmin();

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const supabase = await createClient();

    // Get query parameters for filters
    const { searchParams } = new URL(request.url);
    const months = parseInt(searchParams.get("months") || "6");

    // Get current date
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // Fetch last N months of revenue data
    const monthsData = [];

    for (let i = months - 1; i >= 0; i--) {
      let month = currentMonth - i;
      let year = currentYear;

      // Handle year rollover
      if (month <= 0) {
        month += 12;
        year -= 1;
      }

      const { data } = await supabase
        .from("platform_wallet_monthly_sales")
        .select("total_sales")
        .eq("year", year)
        .eq("month", month)
        .single();

      // Get month name
      const monthDate = new Date(year, month - 1);
      const monthName = monthDate.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });

      monthsData.push({
        month: monthName,
        revenue: data?.total_sales || 0,
      });
    }

    return NextResponse.json({
      data: monthsData,
    });
  } catch (err: any) {
    console.error("❌ Unexpected error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
