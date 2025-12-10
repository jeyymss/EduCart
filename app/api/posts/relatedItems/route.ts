import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get("postId");
  const category = searchParams.get("category");
  const postType = searchParams.get("postType");
  const limit = parseInt(searchParams.get("limit") || "6");

  if (!postId || !category || !postType) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // First, get the category_id and post_type_id from the names
  const { data: categoryData } = await supabase
    .from("categories")
    .select("id")
    .eq("name", category)
    .single();

  const { data: postTypeData } = await supabase
    .from("post_types")
    .select("id")
    .eq("name", postType)
    .single();

  if (!categoryData || !postTypeData) {
    return NextResponse.json(
      { error: "Invalid category or post type" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      id,
      item_title,
      item_price,
      image_urls,
      status,
      categories!inner(name),
      post_types!inner(name)
    `
    )
    .eq("category_id", categoryData.id)
    .eq("post_type_id", postTypeData.id)
    .eq("status", "Listed")
    .neq("id", postId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching related items:", error);
    return NextResponse.json(
      { error: "Failed to fetch related items" },
      { status: 500 }
    );
  }

  // Transform the data to match the expected format
  const transformedData = data?.map((item: any) => ({
    id: item.id,
    item_title: item.item_title,
    item_price: item.item_price,
    image_urls: item.image_urls,
    category_name: item.categories.name,
    post_type_name: item.post_types.name,
    status: item.status,
  }));

  return NextResponse.json(transformedData || []);
}
