import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();

  //get user session
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    return NextResponse.json({ error: sessionError.message }, { status: 500 });
  }
  if (!session) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  //set user id
  const userId = session.user.id;

  //get user info
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
    .eq("user_id", userId)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
