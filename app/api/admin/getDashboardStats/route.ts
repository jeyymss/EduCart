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

    // ✅ Fetch counts in parallel
    const [individualsRes, orgsRes, txnsRes] = await Promise.all([
      supabase.from("individuals").select("*", { count: "exact", head: true }),
      supabase
        .from("organizations")
        .select("*", { count: "exact", head: true }),
      supabase.from("transactions").select("*", { count: "exact", head: true }),
    ]);

    if (individualsRes.error || orgsRes.error || txnsRes.error) {
      console.error("❌ Supabase query errors:", {
        individuals: individualsRes.error,
        organizations: orgsRes.error,
        transactions: txnsRes.error,
      });
      return NextResponse.json(
        {
          error: "Error fetching dashboard stats",
          details: {
            individuals: individualsRes.error?.message ?? null,
            organizations: orgsRes.error?.message ?? null,
            transactions: txnsRes.error?.message ?? null,
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      totalIndividuals: individualsRes.count ?? 0,
      totalOrganizations: orgsRes.count ?? 0,
      totalTransactions: txnsRes.count ?? 0,
    });
  } catch (err: any) {
    console.error("❌ Unexpected error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
