import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError)
    return NextResponse.json({ error: sessionError.message }, { status: 500 });

  if (!session)
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const userId = session.user.id;

  const { data, error } = await supabase
    .from("organizations")
    .select(
      `
        user_id,
        organization_name,
        organization_description,
        email,
        role,
        avatar_url,
        background_url,
        bio,
        post_credits_balance,
        is_gcash_linked,
        total_earnings,
        business_type,
        documents,
        created_at,
        updated_at,
        university_id,
        universities:university_id (
          id,
          abbreviation
        )
      `
    )
    .eq("user_id", userId)
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  if (!data)
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  // ✅ NORMALIZE HERE
  return NextResponse.json({
    ...data,
    user_id: data.user_id,
    full_name: data.organization_name, // ⭐ KEY FIX
  });
}
