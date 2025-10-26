import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

function mapDbStatusToTab(
  status: string
): "active" | "completed" | "cancelled" {
  switch (status) {
    case "Accepted":
    case "Pending":
    case "Processing":
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
        fulfillment_method,
        price,
        post:post_id (
          id,
          item_title,
          image_urls,
          post_type:post_type_id ( name )
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

  // Flatten results
  const transactions = (data || [])
    .map((row) => {
      const snap = row.snapshot || {};
      const txn = Array.isArray(row.transaction)
        ? row.transaction[0]
        : row.transaction || {};
      const post = Array.isArray(txn.post) ? txn.post[0] : txn.post || {};
      const postType =
        post.post_type && !Array.isArray(post.post_type)
          ? post.post_type
          : post.post_type?.[0] || {};

      const imageUrl =
        Array.isArray(post.image_urls) && post.image_urls.length > 0
          ? post.image_urls[0]
          : "/bluecart.png";

      const status = mapDbStatusToTab(txn.status || snap.status);
      const isBuyer = row.buyer_id === userId;
      const isSeller = row.seller_id === userId;

      //Cancelled items should only show to buyer, not seller
      if (status === "cancelled" && !isBuyer) return null;

      return {
        id: row.id,
        transaction_id: row.transaction_id,
        reference_code: row.reference_code,
        status,
        type: isBuyer ? "Purchases" : "Sales",
        method: txn.fulfillment_method || snap.fulfillment_method || "Meetup",
        title: post.item_title || snap.item_title || "Untitled Item",
        price: txn.price || snap.price || 0,
        total: snap.total_amount || snap.price || 0,
        created_at: snap.created_at,
        post_type: postType.name || snap.post_type || "Buy",
        image_url: imageUrl,
      };
    })
    .filter((t): t is NonNullable<typeof t> => !!t); // remove nulls (cancelled sellers)

  console.log("✅ Final transactions count:", transactions.length);

  return NextResponse.json({ transactions });
}
