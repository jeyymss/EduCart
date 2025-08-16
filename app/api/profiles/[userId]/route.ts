import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(
  _req: Request,
  context: { params: Promise<{ userId: string }> }
) {
  const { userId } = await context.params;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("public_user_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data)
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  return NextResponse.json(data);
}
