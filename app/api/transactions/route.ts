import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

function mapDbStatusToTab(
  status: string
): "active" | "completed" | "cancelled" {
  switch (status) {
    case "Accepted":
    case "Pending":
    case "Processing":
    case "Paid":
    case "PickedUp":
      return "active";
    case "Completed":
      return "completed";
    case "Cancelled":
      return "cancelled";
    default:
      return "active";
  }
}

export async function GET(req: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("transaction_records")
    .select(
      `
        id,
        transaction_id,
        reference_code,
        buyer_id,
        seller_id,
        snapshot,

        transaction:transaction_id (
          id,
          status,
          payment_method,
          fulfillment_method,
          price,

          buyer:buyer_id (
            id,
            name
          ),

          seller:seller_id (
            id,
            name
          ),

          post:post_id (
            id,
            item_title,
            image_urls,
            post_type:post_type_id (name)
          )
        )
      `
    )
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Supabase error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const transactions = (data || [])
    .map((row) => {
      const snap = row.snapshot || {};

      // Extract transaction
      const txn = Array.isArray(row.transaction)
        ? row.transaction[0]
        : row.transaction || {};

      // Extract post
      const post = Array.isArray(txn.post) ? txn.post[0] : txn.post || {};

      // Extract post type
      const postType =
        post.post_type && !Array.isArray(post.post_type)
          ? post.post_type
          : post.post_type?.[0] || {};

      // Buyer / seller extracted from inside "transaction"
      const buyerObj = Array.isArray(txn.buyer) ? txn.buyer[0] : txn.buyer;
      const sellerObj = Array.isArray(txn.seller) ? txn.seller[0] : txn.seller;

      const imageUrl =
        Array.isArray(post.image_urls) && post.image_urls.length > 0
          ? post.image_urls[0]
          : "/bluecart.png";

      const rawStatus: string = txn.status || snap.status || "Pending";
      const statusTab = mapDbStatusToTab(rawStatus);

      const isBuyer = row.buyer_id === userId;

      // Cancelled items should not show for seller
      if (statusTab === "cancelled" && !isBuyer) return null;

      return {
        id: row.id,
        transaction_id: row.transaction_id,
        reference_code: row.reference_code,

        // 🟢 For tabs & filters
        status: statusTab,

        // 🟡 REAL DB STATUS (Paid, PickedUp, Completed, etc.)
        raw_status: rawStatus,

        type: isBuyer ? "Purchases" : "Sales",
        method: txn.fulfillment_method || snap.fulfillment_method || "Meetup",
        payment_method: txn.payment_method || snap.payment_method,
        title: post.item_title || snap.item_title || "Untitled Item",
        price: txn.price || snap.price || 0,
        total: snap.total_amount || snap.price || 0,
        created_at: snap.created_at,
        post_type: postType.name || snap.post_type || "Buy",
        image_url: imageUrl,

        buyer: buyerObj?.name || "",
        seller: sellerObj?.name || "",

        buyer_id: row.buyer_id,
        seller_id: row.seller_id,

        post_id: post.id,
      };
    })
    .filter(Boolean);

  return NextResponse.json({ transactions });
}
