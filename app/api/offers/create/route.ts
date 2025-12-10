import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { post_id, seller_id, offered_price, message } = await req.json();

  // Get buyer user from auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const buyer_id = user.id;

  // Insert offer
  const { data: offer, error } = await supabase
    .from("offers")
    .insert({
      post_id,
      buyer_id,
      seller_id,
      offered_price,
      message: message || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Notify seller
  await supabase.from("notifications").insert({
    user_id: seller_id,
    sender_user_id: buyer_id,
    category: "Transaction",
    title: "New Offer Received",
    body: `Someone offered ₱${offered_price} on your item.`,
    related_table: "offers",
    related_id: offer.id,
  });

  return NextResponse.json({ success: true, offer });
}
