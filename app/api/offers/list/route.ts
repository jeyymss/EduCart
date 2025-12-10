import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get("postId");

  if (!postId) {
    return NextResponse.json(
      { error: "Post ID is required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // Verify user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch offers + buyer profile (full_name, avatar)
  const { data, error } = await supabase
    .from("offers")
    .select(`
      id,
      post_id,
      buyer_id,
      seller_id,
      offered_price,
      message,
      status,
      created_at,
      individuals!buyer_id (
        full_name,
        avatar_url
      )
    `)
    .eq("post_id", postId)
    .order("created_at", { ascending: false });


  if (error) {
    console.error("Error fetching offers:", error);
    return NextResponse.json(
      { error: "Failed to fetch offers", details: error.message },
      { status: 500 }
    );
  }

  console.log("Fetched offers:", JSON.stringify(data, null, 2));

  return NextResponse.json({ offers: data || [] });
}
