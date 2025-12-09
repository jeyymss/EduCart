import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Update post details
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { id } = await params;

  // Get current user
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Verify ownership
  const { data: post, error: fetchError } = await supabase
    .from("posts")
    .select("post_user_id")
    .eq("id", id)
    .single();

  if (fetchError || !post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  if (post.post_user_id !== session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Get update data from request
  const updateData = await req.json();

  // Only allow certain fields to be updated
  const allowedFields = [
    "item_price",
    "item_description",
    "item_trade",
    "item_service_fee",
    "quantity",
  ];

  const filteredData: Record<string, any> = {};
  for (const key of allowedFields) {
    if (key in updateData) {
      filteredData[key] = updateData[key];
    }
  }

  // Update the post
  const { error: updateError } = await supabase
    .from("posts")
    .update(filteredData)
    .eq("id", id);

  if (updateError) {
    return NextResponse.json(
      { error: updateError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
