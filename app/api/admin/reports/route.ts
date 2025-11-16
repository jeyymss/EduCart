import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { checkIfAdmin } from "@/utils/checkAdmin";

export async function GET() {
  try {
    
    const { isAdmin, user } = await checkIfAdmin();

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const supabase = await createClient();

    
    const {
      data: reports,
      error: reportsError,
    } = await supabase
      .from("reports")
      .select(`
        id,
        reporter_id,
        reported_user_id,
        report_type,
        description,
        status,
        admin_notes,
        created_at,
        reporter:users!reports_reporter_id_fkey(full_name),
        reported:users!reports_reported_user_id_fkey(full_name)
      `)
      .order("created_at", { ascending: false });

    if (reportsError) {
      console.error("❌ Supabase reports error:", reportsError);
      return NextResponse.json(
        {
          error: "Error fetching reports",
          details: reportsError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      totalReports: reports?.length ?? 0,
      reports: reports ?? [],
    });
  } catch (err: any) {
    console.error("❌ Unexpected error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
