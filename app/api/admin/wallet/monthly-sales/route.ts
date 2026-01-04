import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const { data, error } = await supabase
    .from("platform_wallet_monthly_sales")
    .select("total_sales")
    .eq("year", year)
    .eq("month", month)
    .maybeSingle();

  return NextResponse.json({
    totalSales: data?.total_sales ?? 0,
  });
}
