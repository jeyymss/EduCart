import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { checkIfAdmin } from "@/utils/checkAdmin";

export async function GET() {
  try {
    const { isAdmin } = await checkIfAdmin();

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const supabase = await createClient();

    // Get current month and year
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    // Fetch all data in parallel
    const [
      individualsRes,
      orgsRes,
      creditSalesRes,
      commissionsRes,
      monthlyRevenueRes,
    ] = await Promise.all([
      // Total individuals
      supabase.from("individuals").select("*", { count: "exact", head: true }),

      // Total organizations
      supabase.from("organizations").select("*", { count: "exact", head: true }),

      // Credit sales - sum of all 'Credit Purchase' transactions
      supabase
        .from("platform_wallet_transactions")
        .select("amount")
        .eq("type", "Credit Purchase"),

      // Commissions - sum of all 'Commission' transactions
      supabase
        .from("platform_wallet_transactions")
        .select("amount")
        .eq("type", "Commission"),

      // Monthly revenue from platform_wallet_monthly_sales
      supabase
        .from("platform_wallet_monthly_sales")
        .select("total_sales")
        .eq("year", year)
        .eq("month", month)
        .single(),
    ]);

    if (individualsRes.error || orgsRes.error) {
      console.error("❌ Supabase query errors:", {
        individuals: individualsRes.error,
        organizations: orgsRes.error,
      });
      return NextResponse.json(
        {
          error: "Error fetching dashboard stats",
          details: {
            individuals: individualsRes.error?.message ?? null,
            organizations: orgsRes.error?.message ?? null,
          },
        },
        { status: 500 }
      );
    }

    // Calculate total users
    const totalUsers = (individualsRes.count ?? 0) + (orgsRes.count ?? 0);

    // Calculate credit sales total
    const creditSales = creditSalesRes.data?.reduce(
      (sum, transaction) => sum + (transaction.amount || 0),
      0
    ) ?? 0;

    // Calculate commissions total
    const commissions = commissionsRes.data?.reduce(
      (sum, transaction) => sum + (transaction.amount || 0),
      0
    ) ?? 0;

    // Get monthly revenue
    const monthlyRevenue = monthlyRevenueRes.data?.total_sales ?? 0;

    return NextResponse.json({
      totalUsers,
      creditSales,
      commissions,
      monthlyRevenue,
    });
  } catch (err: any) {
    console.error("❌ Unexpected error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
