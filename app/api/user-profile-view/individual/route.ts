import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }
  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  // IMPORTANT: select/alias the columns to match your `UserProfile` type
  const { data, error } = await supabase
    .from("individuals")
    .select(
      `
      id:user_id,
      full_name,
      email,
      role,
      avatar_url,
      background_url,
      post_credits_balance,
      created_at,
      updated_at,
      universities:university_id (
        id,
        abbreviation
      ),
      bio
    `
    )
    .eq("user_id", user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
