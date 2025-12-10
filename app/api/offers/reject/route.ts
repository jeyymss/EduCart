import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { offer_id, seller_id } = await req.json();

  // Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== seller_id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch offer
  const { data: offer } = await supabase
    .from("offers")
    .select("*")
    .eq("id", offer_id)
    .single();

  if (!offer) {
    return NextResponse.json({ error: "Offer not found" }, { status: 404 });
  }

  // 1. Reject offer
  await supabase
    .from("offers")
    .update({ status: "Rejected" })
    .eq("id", offer_id);

  // 2. Notify buyer
  await supabase.from("notifications").insert({
    user_id: offer.buyer_id,
    sender_user_id: seller_id,
    category: "Transaction",
    title: "Offer Rejected",
    body: `Your offer of ₱${offer.offered_price} was rejected.`,
    related_table: "offers",
    related_id: offer_id,
  });

  return NextResponse.json({ success: true });
}
