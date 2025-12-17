import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

/* ===================== TYPES ===================== */

type StatusTab = "active" | "completed" | "cancelled";

type MappedTransaction = {
  id: string;
  transaction_id: string;
  reference_code: string;
  status: StatusTab;
  raw_status: string;
  type: "Purchases" | "Sales";
  method: string;
  payment_method: string | null;
  title: string;
  price: number;
  total: number;
  delivery_fee: number | null;
  service_fee: number | null;
  items_total: number | null;
  cash_added: number | null;
  rent_days: number | null;
  rent_start_date: string | null;
  rent_end_date: string | null;
  pasabuy_items: any[] | null;
  created_at: string;
  post_type: string;
  image_url: string;
  buyer: string;
  seller: string;
  buyer_id: string;
  seller_id: string;
  post_id: string;
  address: string | null;
};

/* ===================== HELPERS ===================== */

function mapDbStatusToTab(status: string): StatusTab {
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

/* ===================== API ===================== */

export async function GET(req: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  /* ===================== FETCH TRANSACTION RECORDS ===================== */

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
        buyer:buyer_id ( id, name ),
        seller:seller_id ( id, name ),
        post:post_id (
          id,
          item_title,
          image_urls,
          post_type:post_type_id ( name ),
          pasabuy_items (
            id,
            product_name,
            price
          )
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

  /* ===================== MAP RECORDS ===================== */

  const transactions = (data || [])
    .map((row): MappedTransaction | null => {
      const snap = row.snapshot || {};
      const txn = Array.isArray(row.transaction)
        ? row.transaction[0]
        : row.transaction;

      if (!txn) return null;

      const post = Array.isArray(txn.post) ? txn.post[0] : txn.post;
      const postType =
        post?.post_type && !Array.isArray(post.post_type)
          ? post.post_type
          : post?.post_type?.[0];

      const buyerObj = Array.isArray(txn.buyer) ? txn.buyer[0] : txn.buyer;
      const sellerObj = Array.isArray(txn.seller) ? txn.seller[0] : txn.seller;

      const rawStatus = txn.status || snap.status || "Pending";
      const statusTab = mapDbStatusToTab(rawStatus);
      const isBuyer = row.buyer_id === userId;

      if (statusTab === "cancelled" && !isBuyer) return null;

      const itemPrice = txn.price || snap.price || 0;
      const deliveryFee = snap.delivery_fee ?? null;
      const serviceFee = snap.service_fee ?? null;
      const itemsTotal = snap.items_total ?? null;
      const cashAdded = snap.cash_added ?? null;
      const rentDays = snap.rent_days ?? null;

      // Get PasaBuy items from post relation or snapshot
      let pasabuyItems: any[] | null = null;
      if (postType?.name === "PasaBuy") {
        // First try to get from post relation
        if (post?.pasabuy_items && Array.isArray(post.pasabuy_items) && post.pasabuy_items.length > 0) {
          pasabuyItems = post.pasabuy_items;
        }
        // Fallback to snapshot if available
        else if (snap.pasabuy_items_snapshot) {
          try {
            pasabuyItems =
              typeof snap.pasabuy_items_snapshot === "string"
                ? JSON.parse(snap.pasabuy_items_snapshot)
                : snap.pasabuy_items_snapshot;
          } catch {
            pasabuyItems = null;
          }
        }
      }

      let totalAmount = 0;
      const postTypeName = postType?.name || snap.post_type;

      if (postTypeName === "PasaBuy") {
        const itemsSum =
          pasabuyItems?.reduce(
            (sum, item) => sum + (Number(item.price) || 0),
            0
          ) || itemsTotal || 0;
        totalAmount = itemsSum + (serviceFee || 0) + (deliveryFee || 0);
      } else if (postTypeName === "Rent") {
        totalAmount = itemPrice * (rentDays || 1);
      } else if (postTypeName === "Trade") {
        totalAmount = cashAdded || 0;
      } else {
        totalAmount = itemPrice + (deliveryFee || 0);
      }

      return {
        id: row.id,
        transaction_id: row.transaction_id,
        reference_code: row.reference_code,
        status: statusTab,
        raw_status: rawStatus,
        type: isBuyer ? "Purchases" : "Sales",
        method: txn.fulfillment_method || snap.fulfillment_method || "Meetup",
        payment_method: txn.payment_method || snap.payment_method,
        title: post?.item_title || snap.item_title || "Untitled Item",
        price: itemPrice,
        total: totalAmount,
        delivery_fee: deliveryFee,
        service_fee: serviceFee,
        items_total: itemsTotal,
        cash_added: cashAdded,
        rent_days: rentDays,
        rent_start_date: snap.rent_start_date || null,
        rent_end_date: snap.rent_end_date || null,
        pasabuy_items: pasabuyItems,
        created_at: snap.created_at,
        post_type: postTypeName || "Buy",
        image_url:
          post?.image_urls?.[0] || "/bluecart.png",
        buyer: buyerObj?.name || "",
        seller: sellerObj?.name || "",
        buyer_id: row.buyer_id,
        seller_id: row.seller_id,
        post_id: post?.id,
        address: snap.delivery_address || null,
      };
    })
    .filter((t): t is MappedTransaction => t !== null);

  /* ===================== FETCH PENDING TRANSACTIONS ===================== */

  const { data: pendingData } = await supabase
    .from("transactions")
    .select(
      `
      id,
      status,
      payment_method,
      fulfillment_method,
      price,
      delivery_fee,
      items_total,
      cash_added,
      rent_days,
      rent_start_date,
      rent_end_date,
      pasabuy_items_snapshot,
      delivery_address,
      meetup_location,
      created_at,
      buyer_id,
      seller_id,
      buyer:buyer_id ( id, name ),
      seller:seller_id ( id, name ),
      post:post_id (
        id,
        item_title,
        item_price,
        item_service_fee,
        image_urls,
        post_type:post_type_id ( name ),
        pasabuy_items (
          id,
          product_name,
          price
        )
      )
    `
    )
    .eq("status", "Pending")
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);

  /* ===================== MAP PENDING ===================== */

  const pendingTransactions = (pendingData || [])
    .map((txn): MappedTransaction | null => {
      if (transactions.some(t => t.transaction_id === txn.id)) return null;

      const post = Array.isArray(txn.post) ? txn.post[0] : txn.post;
      const postType =
        post?.post_type && !Array.isArray(post.post_type)
          ? post.post_type
          : post?.post_type?.[0];

      const buyerObj = Array.isArray(txn.buyer) ? txn.buyer[0] : txn.buyer;
      const sellerObj = Array.isArray(txn.seller) ? txn.seller[0] : txn.seller;

      const rawStatus = txn.status || "Pending";
      const statusTab = mapDbStatusToTab(rawStatus);
      const isBuyer = txn.buyer_id === userId;

      const itemPrice = post?.item_price || txn.price || 0;
      const deliveryFee = txn.delivery_fee ?? null;
      const serviceFee = post?.item_service_fee ?? null;
      const itemsTotal = txn.items_total ?? null;
      const cashAdded = txn.cash_added ?? null;
      const rentDays = txn.rent_days ?? null;

      // Get PasaBuy items from post relation or snapshot
      let pasabuyItems = null;
      if (postType?.name === "PasaBuy") {
        // First try to get from post relation
        if (post?.pasabuy_items && Array.isArray(post.pasabuy_items) && post.pasabuy_items.length > 0) {
          pasabuyItems = post.pasabuy_items;
        }
        // Fallback to snapshot if available
        else if (txn.pasabuy_items_snapshot) {
          try {
            pasabuyItems = typeof txn.pasabuy_items_snapshot === 'string'
              ? JSON.parse(txn.pasabuy_items_snapshot)
              : txn.pasabuy_items_snapshot;
          } catch {
            pasabuyItems = null;
          }
        }
      }

      // Calculate total amount based on transaction type
      let totalAmount = 0;
      const postTypeName = postType?.name;

      if (postTypeName === "PasaBuy") {
        // PasaBuy: Sum of all selected items + service_fee + delivery_fee
        if (pasabuyItems && Array.isArray(pasabuyItems) && pasabuyItems.length > 0) {
          const itemsSum = pasabuyItems.reduce((sum, item) => {
            return sum + (Number(item.price) || 0);
          }, 0);
          totalAmount = itemsSum + (serviceFee || 0) + (deliveryFee || 0);
        } else {
          // Fallback to itemsTotal if pasabuyItems not available
          totalAmount = (itemsTotal || 0) + (serviceFee || 0) + (deliveryFee || 0);
        }
      } else if (postTypeName === "Rent") {
        // Rent: price_per_day × rent_days
        const days = rentDays || 1;
        totalAmount = itemPrice * days;
      } else if (postTypeName === "Trade") {
        // Trade: cash_added (the amount buyer needs to pay on top of trade)
        totalAmount = cashAdded || 0;
      } else {
        // Sale, Emergency, Giveaway: item_price + delivery_fee
        totalAmount = itemPrice + (deliveryFee || 0);
      }

      return {
        id: txn.id,
        transaction_id: txn.id,
        reference_code: `TXN-${txn.id.slice(0, 8)}`,
        status: statusTab,
        raw_status: rawStatus,
        type: isBuyer ? "Purchases" : "Sales",
        method: txn.fulfillment_method || "Meetup",
        payment_method: txn.payment_method,
        title: post?.item_title || "Untitled Item",
        price: itemPrice,
        total: totalAmount,
        delivery_fee: deliveryFee,
        service_fee: serviceFee,
        items_total: itemsTotal,
        cash_added: cashAdded,
        rent_days: rentDays,
        rent_start_date: txn.rent_start_date || null,
        rent_end_date: txn.rent_end_date || null,
        pasabuy_items: pasabuyItems,
        created_at: txn.created_at,
        post_type: postType?.name || "Buy",
        image_url: post?.image_urls?.[0] || "/bluecart.png",
        buyer: buyerObj?.name || "",
        seller: sellerObj?.name || "",
        buyer_id: txn.buyer_id,
        seller_id: txn.seller_id,
        post_id: post?.id,
        address: txn.delivery_address || txn.meetup_location,
      };
    })
    .filter((t): t is MappedTransaction => t !== null);

  /* ===================== RESPONSE ===================== */

  return NextResponse.json({
    transactions: [...transactions, ...pendingTransactions],
  });
}
