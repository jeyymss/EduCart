import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get("id");

  if (!postId) {
    return NextResponse.json({ error: "Missing post id" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select(`
      id,
      item_title,
      item_description,
      item_service_fee,
      item_pasabuy_location,
      item_pasabuy_cutoff,
      created_at,
      pasabuy_items (
        id,
        product_name,
        price
      )
      post_user_id (
        name
      )
    `)
    .eq("id", postId)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
