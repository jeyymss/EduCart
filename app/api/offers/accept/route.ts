import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { offer_id, post_id, seller_id } = await req.json();

  // Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== seller_id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch the offer
  const { data: offer } = await supabase
    .from("offers")
    .select("*")
    .eq("id", offer_id)
    .single();

  if (!offer) {
    return NextResponse.json({ error: "Offer not found" }, { status: 404 });
  }

  // 1. Mark as Accepted
  await supabase
    .from("offers")
    .update({ status: "Accepted" })
    .eq("id", offer_id);

  // 2. Start chat with RPC
  const { data: convo_id, error: chatErr } = await supabase.rpc("start_chat_from_offer", {
    input_offer_id: offer_id,
    input_post_id: post_id,
  });


  if (chatErr) {
    return NextResponse.json({ error: "Chat creation failed" }, { status: 500 });
  }

  // 3. Insert system message into chat
  await supabase.from("messages").insert({
    conversation_id: convo_id,
    sender_user_id: seller_id,
    body: `Your offer of ₱${offer.offered_price} was accepted. Please proceed to submit the transaction form.`,
    type: "offer_accepted",
  });

  // 4. Notify buyer
  await supabase.from("notifications").insert({
    user_id: offer.buyer_id,
    sender_user_id: seller_id,
    category: "Transaction",
    title: "Offer Accepted",
    body: `Your offer of ₱${offer.offered_price} was accepted.`,
    related_table: "offers",
    related_id: offer_id,
  });

  return NextResponse.json({ success: true, convo_id });
}
