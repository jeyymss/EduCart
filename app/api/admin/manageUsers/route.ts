import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const query = supabase
    .from("users")
    .select(
      `
          full_name,
          email,
          role,
          university_id,
          verification_status,
          created_at,
          universities(abbreviation)
        `
    )
    .neq("role", "Admin")
    .order("created_at", { ascending: false });

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
