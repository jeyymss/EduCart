"use client";

import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { calculateDeliveryFee } from "@/utils/deliveryFee";
import { createClient } from "@/utils/supabase/client";
import { getRoadDistanceKm } from "@/utils/getRoadDistance";
import PaymentDialog from "@/components/payments/PaymentDialog";

interface PastTransactionDetailsProps {
  postType: string;
  itemTitle?: string;
  currentUserRole: string;
  createdAt?: string;
  transaction_id: string;
  conversation_id: string;
  txn: any;
}

export default function PastTransactionDetails({
  postType,
  itemTitle,
  currentUserRole,
  createdAt,
  txn,
  transaction_id,
  conversation_id,
}: PastTransactionDetailsProps) {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const [deliveryFee, setDeliveryFee] = useState<number | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [totalPayment, setTotalPayment] = useState<number | null>(null);

  const [balance, setBalance] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [isPaying, setIsPaying] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // ========================
  // COMPUTE RENT DAYS
  // ========================
  const rentDays =
    txn?.rent_start_date && txn?.rent_end_date
      ? Math.max(
          1,
          Math.ceil(
            (new Date(txn.rent_end_date).getTime() -
              new Date(txn.rent_start_date).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : null;

  // Detect GCash redirect success
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("paid") === "true") {
      setSuccessMsg("Payment successful!");
      setTimeout(() => {
        window.location.href = `/messages/${conversation_id}`;
      }, 2000);
    }
  }, []);

  // Load Wallet Balance
  useEffect(() => {
    async function load() {
      const res = await fetch("/api/wallet/get");
      const data = await res.json();
      setBalance(data.balance);
    }
    load();
  }, []);

  // ========================
  // COMPUTE TOTAL PAYMENT
  // ========================
  useEffect(() => {
    // RENT
    if (postType === "Rent") {
      if (!rentDays || !txn?.price) return;

      const total = Number(txn.price) * rentDays;
      setTotalPayment(total);
      setDeliveryFee(null);
      setDistanceKm(null);
      return;
    }

    // ========================
    // TRADE (cash only)
    // ========================
    if (postType === "Trade") {
      const total = Number(txn.cash_added ?? 0);
      setTotalPayment(total);
      setDeliveryFee(null);
      setDistanceKm(null);
      return;
    }


    // ======================
    // SALE + MEETUP
    // ======================
    if (postType === "Sale" && txn.fulfillment_method === "Meetup") {
      setTotalPayment(Number(txn.price));   // FIX
      setDeliveryFee(null);
      setDistanceKm(null);
      return;
    }

    // ======================
    // SALE + DELIVERY
    // ======================
    const fetchData = async () => {
      const supabase = createClient();
      const { data: post } = await supabase
        .from("posts")
        .select("pickup_lat, pickup_lng")
        .eq("id", txn.post_id)
        .single();

      if (!post || !txn.delivery_lat || !txn.delivery_lng) return;

      const km = await getRoadDistanceKm(
        post.pickup_lat,
        post.pickup_lng,
        txn.delivery_lat,
        txn.delivery_lng
      );

      const fee = calculateDeliveryFee(km);
      const total = Number(txn.price) + fee;

      setDistanceKm(km);
      setDeliveryFee(fee);
      setTotalPayment(total);
    };

    fetchData();
  }, [txn, postType, rentDays]);


  const insufficientBalance =
    paymentMethod === "wallet" &&
    totalPayment !== null &&
    balance < totalPayment;

  // WALLET PAYMENT
  const handleWalletPayment = async () => {
    if (totalPayment === null) return;

    setIsPaying(true);

    const res = await fetch("/api/wallet/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transactionId: transaction_id,
        amount: totalPayment,
        deliveryFee,
        rentDays,
      }),
    });

    const data = await res.json();
    setIsPaying(false);

    if (data.error) return alert(data.error);

    setSuccessMsg("Payment successful!");
    setTimeout(() => setShowPaymentDialog(false), 1500);

    window.location.reload();
  };

  // GCASH PAYMENT
  const handleGCashPayment = async () => {
    if (totalPayment === null) return;

    setIsPaying(true);

    const res = await fetch("/api/payments/gcash", {
      method: "POST",
      body: JSON.stringify({
        amount: totalPayment,
        transactionId: transaction_id,
        conversationId: conversation_id,
        reference: `TXN-${transaction_id}`,
        totalPayment,
        rentDays,
      }),
    });

    const data = await res.json();
    setIsPaying(false);

    if (data?.checkout_url) {
      window.location.href = data.checkout_url;
    } else {
      alert("Failed to initialize GCash payment.");
    }
  };

  return (
    <div className="border rounded-xl p-5 bg-white shadow-md transition-all">
      <p className="font-semibold text-base mb-4 text-[#102E4A]">
        Transaction Form Completed
      </p>

      {txn.status === "Accepted" &&
        txn.payment_method === "Online Payment" &&
        currentUserRole === "buyer" &&
        txn.status !== "Paid" && (
          <Button
            className="mt-4 w-full rounded-lg py-2"
            style={{ backgroundColor: "#C7D9E5" }}
            onClick={() => setShowPaymentDialog(true)}
          >
            Pay Now
          </Button>
      )}


      {txn.status !== "Paid" && (
        <PaymentDialog
          open={showPaymentDialog}
          onOpenChange={setShowPaymentDialog}
          postType={postType}
          rentDays={rentDays}
          cash_added={txn.cash_added}
          itemTitle={itemTitle}
          txnPrice={txn.price}
          distanceKm={distanceKm}
          deliveryFee={deliveryFee}
          totalPayment={totalPayment}
          fulfillmentMethod={txn.fulfillment_method}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          balance={balance}
          insufficientBalance={insufficientBalance}
          isPaying={isPaying}
          handleWalletPayment={handleWalletPayment}
          handleGCashPayment={handleGCashPayment}
          successMsg={successMsg}
        />
      )}
    </div>
  );
}
