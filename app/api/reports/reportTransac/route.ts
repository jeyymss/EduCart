"use server";

import { createClient } from "@/utils/supabase/server";

export async function submitTransacReport(data: {
  reportedTransacId: string;
  reportedItemId: string;
  reportedUserId: string;
  reportType: string;
  description?: string | null;
}) {
  const supabase = await createClient();

  // Get logged-in user (reporter)
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    reported_transaction_id: data.reportedTransacId,
    reported_item_id: data.reportedItemId,
    reported_user_id: data.reportedUserId,
    report_target_type: "User",
    report_type: data.reportType,
    description: data.description ?? null,
  });

  if (error) {
    console.error("Insert report error:", error);
    return { error: error.message };
  }

  return { success: true };
}
