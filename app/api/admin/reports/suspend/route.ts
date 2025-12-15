import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/utils/supabase/admin";
import { checkIfAdmin } from "@/utils/checkAdmin";

export async function POST(req: Request) {
  try {
    const { isAdmin, session } = await checkIfAdmin();
    if (!isAdmin || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const adminUserId = session.user.id; // This is the auth.users ID

    const { reportId, reportedUserId, reportType, reason } = await req.json();

    if (!reportId || !reportedUserId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Fetch the report to get reported_item_id
    const { data: report } = await supabaseAdmin
      .from("reports")
      .select("reported_item_id, reported_transaction_id")
      .eq("id", reportId)
      .single();

    // Update report status to Resolved
    const { error: updateError } = await supabaseAdmin
      .from("reports")
      .update({
        status: "Resolved",
        updated_at: new Date().toISOString()
      })
      .eq("id", reportId);

    if (updateError) {
      console.error("Error updating report:", updateError);
      throw updateError;
    }

    // Update user profile to suspended status
    const { error: suspendError } = await supabaseAdmin
      .from("public_user_profiles")
      .update({
        is_suspended: true,
        suspended_at: new Date().toISOString()
      })
      .eq("user_id", reportedUserId);

    if (suspendError) {
      console.error("Error suspending user profile:", suspendError);
      // Continue even if this fails, as not all tables may have this field
    }

    // Create notification for the reported user
    const { error: notifError } = await supabaseAdmin
      .from("notifications")
      .insert({
        user_id: reportedUserId,
        sender_user_id: adminUserId,
        category: "Suspension",
        title: "Account Suspended",
        body: `Your account has been suspended due to ${reportType || "violations of our terms"}. ${reason || "Please contact support for more information."}`,
        related_table: report?.reported_item_id ? "posts" : "reports",
        related_id: report?.reported_item_id || reportId,
      });

    if (notifError) {
      console.error("Error creating notification:", notifError);
      throw notifError;
    }

    return NextResponse.json({
      success: true,
      message: "User suspended successfully"
    });
  } catch (error: any) {
    console.error("Error suspending user:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
