"use server";

import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json();

    const { transactionId, amount, deliveryFee } = body;

    if (!transactionId || amount == null) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 }
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { data: txn, error: txnFetchErr } = await supabase
      .from("transactions")
      .select("buyer_id")
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

    const updatePayload: Record<string, any> = {
      status: "Paid",
      payment_channel: "Wallet",
    };

    if (deliveryFee != null) {
      updatePayload.delivery_fee = deliveryFee;
    }

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

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("wallet/pay server error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
