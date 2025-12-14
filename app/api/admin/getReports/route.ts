import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/utils/supabase/admin";
import { checkIfAdmin } from "@/utils/checkAdmin";

export async function GET() {
  try {
    const { isAdmin } = await checkIfAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { data: reports, error } = await supabaseAdmin
      .from("reports")
      .select(`
        id,
        reporter_id,
        reported_user_id,
        report_type,
        description,
        status,
        created_at,
        updated_at,
        report_target_type,
        reference_code,
        reported_item_id,
        reported_transaction_id,

        reporter:reporter_id (
          id,
          email,
          individuals ( full_name ),
          organizations!organizations_user_id_fkey ( organization_name )
        ),

        reported_user:reported_user_id (
          id,
          email,
          individuals ( full_name ),
          organizations!organizations_user_id_fkey ( organization_name )
        ),

        reported_item:reported_item_id (
          id,
          item_title
        ),

        reported_transaction:reported_transaction_id (
          id,
          reference_code
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ reports });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
