import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { supabaseAdmin } from "@/utils/supabase/admin";
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

    // Get date 7 days ago for active users
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Fetch new users (created in last N days)
    const { data: newIndividuals } = await supabase
      .from("individuals")
      .select("created_at")
      .gte("created_at", daysAgo.toISOString());

    const { data: newOrgs } = await supabase
      .from("organizations")
      .select("created_at")
      .gte("created_at", daysAgo.toISOString());

    // Fetch all users to check active status
    const { data: individualsActivity } = await supabase
      .from("individuals")
      .select("user_id, created_at");

    const { data: orgsActivity } = await supabase
      .from("organizations")
      .select("user_id, created_at");

    const allUserIds = [
      ...(individualsActivity?.map((i) => i.user_id) || []),
      ...(orgsActivity?.map((o) => o.user_id) || []),
    ];

    // Fetch auth data for active users using admin client
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();

    if (authError) {
      console.error("Error fetching auth users:", authError);
    }

    const activeUsers = authData?.users?.filter((user) => {
      if (!allUserIds.includes(user.id)) return false;
      const lastSignIn = user.last_sign_in_at
        ? new Date(user.last_sign_in_at)
        : null;
      return lastSignIn && lastSignIn >= sevenDaysAgo;
    }).length || 0;

    // Group new users by week or day based on filter
    const numWeeks = Math.min(Math.ceil(days / 7), 12);
    const weeklyNewUsers = Array.from({ length: numWeeks }, (_, i) => {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - i * 7);

      const countIndividuals =
        newIndividuals?.filter((u) => {
          const createdAt = new Date(u.created_at);
          return createdAt >= weekStart && createdAt < weekEnd;
        }).length || 0;

      const countOrgs =
        newOrgs?.filter((u) => {
          const createdAt = new Date(u.created_at);
          return createdAt >= weekStart && createdAt < weekEnd;
        }).length || 0;

      // Format week label
      const weekLabel = weekStart.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      return {
        week: weekLabel,
        users: countIndividuals + countOrgs,
      };
    }).reverse();

    return NextResponse.json({
      activeUsers,
      newUsers: (newIndividuals?.length || 0) + (newOrgs?.length || 0),
      weeklyData: weeklyNewUsers,
    });
  } catch (err: any) {
    console.error("❌ Unexpected error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
