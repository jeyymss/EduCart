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

    // Create notification for the reported user
    const { error: notifError } = await supabaseAdmin
      .from("notifications")
      .insert({
        user_id: reportedUserId,
        sender_user_id: adminUserId,
        category: "Warning Issued",
        title: "Warning Issued",
        body: `You have received a warning regarding ${reportType || "your activity"}. ${reason}`,
        related_table: report?.reported_item_id ? "posts" : "reports",
        related_id: report?.reported_item_id || reportId,
      });

    if (notifError) {
      console.error("Error creating notification:", notifError);
      throw notifError;
    }

    return NextResponse.json({
      success: true,
      message: "User warned successfully"
    });
  } catch (error: any) {
    console.error("Error warning user:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
