import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  // get user session
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError)
    return NextResponse.json({ error: sessionError.message }, { status: 401 });
  if (!session) return NextResponse.json(null);

  const userId = session.user.id

  //fetch org by userId
  const { data, error } = await supabase
    .from("organizations")
    .select(
      `user_id, universities:university_id (
        id,
        abbreviation
      ), organization_name, organization_description, email, avatar_url, background_url, role, subscription_quota_used, post_credits_balance, is_gcash_linked, total_earnings, created_at, updated_at, university_id`
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json(data ?? null);
}
