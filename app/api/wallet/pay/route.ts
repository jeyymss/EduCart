"use server";

import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json();

    const { transactionId, amount, deliveryFee, rentDays } = body;

    // -----------------------------
    // Validate required parameters
    // -----------------------------
    if (!transactionId || amount == null) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 }
      );
    }

    // -----------------------------
    // Get logged-in user
    // -----------------------------
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // -----------------------------
    // Fetch transaction (ensure user is buyer)
    // -----------------------------
    const { data: txn, error: txnFetchErr } = await supabase
      .from("transactions")
      .select("buyer_id, fulfillment_method, price, cash_added")
      .eq("id", transactionId)
      .single();

    if (txnFetchErr || !txn) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    if (txn.buyer_id !== user.id) {
      return NextResponse.json(
        { error: "You are not the buyer for this transaction." },
        { status: 403 }
      );
    }

    // -----------------------------
    // Fetch wallet balance
    // -----------------------------
    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("current_balance")
      .eq("user_id", user.id)
      .single();

    if (walletError || !wallet) {
      return NextResponse.json(
        { error: "Wallet not found" },
        { status: 404 }
      );
    }

    if (wallet.current_balance < amount) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    // -----------------------------
    // Prepare transaction update
    // -----------------------------
    const updatePayload: Record<string, any> = {
      status: "Paid",
      payment_channel: "Wallet",
    };

    // Set delivery fee ONLY when provided (Sale + Delivery)
    if (deliveryFee != null) {
      updatePayload.delivery_fee = deliveryFee;
    }

    // Optional: store rentDays when provided
    if (rentDays != null) {
      updatePayload.rent_days_paid = rentDays;
    }

    // -----------------------------
    // Update transaction
    // (trigger will handle escrow & wallet deduction)
    // -----------------------------
    const { error: updateErr } = await supabase
      .from("transactions")
      .update(updatePayload)
      .eq("id", transactionId);

    if (updateErr) {
      console.error("Transaction update error:", updateErr);
      return NextResponse.json(
        { error: "Failed to update transaction status" },
        { status: 500 }
      );
    }

    // -----------------------------
    // SUCCESS
    // -----------------------------
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("wallet/pay server error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
