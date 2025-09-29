import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  // ✅ get logged-in user
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr)
    return NextResponse.json({ error: userErr.message }, { status: 401 });
  if (!user) return NextResponse.json(null);

  // ✅ fetch org by user_id
  const { data, error } = await supabase
    .from("organizations")
    .select(
      `user_id, universities:university_id (
        id,
        abbreviation
      ), organization_name, organization_description, email, avatar_url, background_url, role, subscription_quota_used, post_credits_balance, is_gcash_linked, total_earnings, created_at, updated_at, university_id`
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json(data ?? null);
}
