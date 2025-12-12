import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();

  // 1. Get session
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    return NextResponse.json(
      { error: sessionError.message },
      { status: 500 }
    );
  }

  if (!session) {
    return NextResponse.json(
      { error: "Not logged in" },
      { status: 401 }
    );
  }

  const userId = session.user.id;

  // 2. Fetch individual profile
  const { data, error } = await supabase
    .from("individuals")
    .select(
      `
        user_id,
        full_name,
        email,
        role,
        avatar_url,
        background_url,
        bio,
        post_credits_balance,
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

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json(
      { error: "Profile not found" },
      { status: 404 }
    );
  }

  // 3. Return normalized data
  return NextResponse.json({
    ...data,
    user_id: data.user_id, // 👈 explicit & consistent
  });
}
