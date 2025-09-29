import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get("limit") || "0");

  const query = supabase
    .from("posts_with_user")
    .select("*")
    .eq("status", "Listed")
    .neq("post_type_name", "Emergency Lending")
    .neq("post_type_name", "PasaBuy")
    .neq("post_type_name", "Giveaway")
    .neq("role", "Organization")
    .order("created_at", { ascending: false });

  if (limit > 0) query.limit(limit);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
