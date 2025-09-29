import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();

  // query your view
  const { data, error } = await supabase
    .from("giveaway_posts_with_meta")
    .select("*")
    .order("created_at", { ascending: false });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json(
    data.map((r: any) => ({
      id: r.id,
      item_title: r.item_title,
      item_description: r.item_description,
      image_urls: r.image_urls ?? [],
      created_at: r.created_at,
      like_count: r.like_count ?? 0,
      comment_count: r.comment_count ?? 0,
      is_liked: r.is_liked ?? false,
      category_name: r.category_name ?? undefined,
      condition: r.item_condition ?? undefined,
      user: r.full_name
        ? { full_name: r.full_name, avatar_url: r.avatar_url ?? undefined }
        : undefined,
    }))
  );
}
