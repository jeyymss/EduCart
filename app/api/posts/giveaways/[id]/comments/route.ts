import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await context.params; // ✅ await params

  const { data, error } = await supabase.rpc("get_giveaway_comments", {
    input_post_id: id,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await context.params; // ✅ await params

  const { body, parentId } = await req.json();

  const { data, error } = await supabase.rpc("add_giveaway_comment", {
    input_post_id: id,
    input_parent_id: parentId ?? null,
    body,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}
