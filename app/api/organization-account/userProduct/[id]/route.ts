import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";


export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { id } = await params;

  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      id,
      item_title,
      item_description,
      item_condition,
      item_price,
      status,
      created_at,
      post_types (
        id,
        name
      )
    `
    )
    .eq("post_user_id", id)
    .order("created_at", { ascending: false });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

// update post status
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { id } = params;
  const { status } = await req.json();

  const { error } = await supabase
    .from("posts")
    .update({ status })
    .eq("id", id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, newStatus: status });
}

//delete a post
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { id } = params;

  const { error } = await supabase.from("posts").delete().eq("id", id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
