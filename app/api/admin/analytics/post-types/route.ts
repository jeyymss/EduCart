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
    const days = parseInt(searchParams.get("days") || "30");

    // Get date N days ago
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);

    // Fetch transactions with post type information filtered by date
    const { data: transactions, error } = await supabase
      .from("transactions")
      .select(`
        id,
        created_at,
        posts (
          post_type_id,
          post_types (
            id,
            name
          )
        )
      `)
      .gte("created_at", daysAgo.toISOString());

    if (error) {
      console.error("Error fetching transactions:", error);
      return NextResponse.json(
        { error: "Failed to fetch post types data" },
        { status: 500 }
      );
    }

    // Count transactions by post type
    const postTypeCounts: { [key: string]: number } = {};

    transactions?.forEach((transaction: any) => {
      const postTypeName = transaction.posts?.post_types?.name;
      if (postTypeName) {
        postTypeCounts[postTypeName] = (postTypeCounts[postTypeName] || 0) + 1;
      }
    });

    // Convert to array format for charts
    const chartData = Object.entries(postTypeCounts).map(([name, count]) => ({
      name,
      transactions: count,
    }));

    // Sort by transaction count descending
    chartData.sort((a, b) => b.transactions - a.transactions);

    return NextResponse.json({
      data: chartData,
      total: transactions?.length || 0,
    });
  } catch (err: any) {
    console.error("❌ Unexpected error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
