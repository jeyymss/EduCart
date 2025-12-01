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
  txn: {
    price?: number | string | null;
    post_id: string;
    rent_start_date: string;
    rent_end_date: string;
    delivery_lat: number | null;
    delivery_lng: number | null;
    fulfillment_method?: string | null;
    meetup_location?: string | null;
    meetup_date?: string | null;
    meetup_time?: string | null;
    payment_method?: string | null;
    status?: string | null;
    cash_added?: number | string | null;
    offered_item?: string | null;
    pasabuy_location?: string | null;
    pasabuy_cutoff?: string | null;
    service_fee?: number | string | null;
  };
}

export default function PastTransactionDetails({
  postType,
  itemTitle,
  currentUserRole,
  createdAt,
  txn,
  transaction_id,
}: PastTransactionDetailsProps) {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const [deliveryFee, setDeliveryFee] = useState<number | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [totalPayment, setTotalPayment] = useState<number | null>(null);

  const [balance, setBalance] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [isPaying, setIsPaying] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Load wallet balance
  useEffect(() => {
    async function load() {
      const res = await fetch("/api/wallet/get");
      const data = await res.json();
      setBalance(data.balance);
    }
    load();
  }, []);

  // Compute delivery fee
  useEffect(() => {
    const fetchDistanceAndFee = async () => {
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

    fetchDistanceAndFee();
  }, [txn]);

  const insufficientBalance =
    paymentMethod === "wallet" &&
    totalPayment !== null &&
    balance < totalPayment;

  // Wallet payment API call
  const handleWalletPayment = async () => {
    if (paymentMethod !== "wallet") return;

    if (!totalPayment) return;
    setIsPaying(true);
    setSuccessMsg("");

    try {
      const res = await fetch("/api/wallet/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionId: transaction_id,
          amount: totalPayment,
          deliveryFee,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        alert(data.error || "Payment failed");
        setIsPaying(false);
        return;
      }

      if (typeof data.newBalance === "number") {
        setBalance(data.newBalance);
      }

      setSuccessMsg("Payment successful!");

      setTimeout(() => {
        setIsPaying(false);
        setShowPaymentDialog(false);
      }, 1200);
    } catch (err) {
      console.error(err);
      alert("Something went wrong processing the payment.");
      setIsPaying(false);
    }
  };

  // Format date/time
  const formattedTime = createdAt
    ? new Date(createdAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : null;

  const formatCurrency = (value?: number | string | null) =>
    value != null ? `₱${Number(value).toLocaleString()}` : "—";

  return (
    <div className="border rounded-xl p-5 bg-white shadow-md transition-all">
      <p className="font-semibold text-base mb-4 text-[#102E4A]">Transaction Form Completed</p>

      {/* --- TRANSACTION DETAILS HERE (unchanged) --- */}

      {txn.status === "Accepted" &&
        txn.payment_method === "Online Payment" &&
        currentUserRole === "buyer" && (
          <Button
            className="mt-4 w-full rounded-lg py-2 text-black hover:cursor-pointer"
            style={{ backgroundColor: "#C7D9E5" }}
            onClick={() => setShowPaymentDialog(true)}
          >
            Pay Now
          </Button>
        )}

      {/* ----- PAYMENT DIALOG COMPONENT ----- */}
      <PaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        itemTitle={itemTitle}
        txnPrice={txn.price}
        distanceKm={distanceKm}
        deliveryFee={deliveryFee}
        totalPayment={totalPayment}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        balance={balance}
        insufficientBalance={insufficientBalance}
        isPaying={isPaying}
        handleWalletPayment={handleWalletPayment}
        successMsg={successMsg}
      />

      {formattedTime && (
        <p className="text-xs text-gray-500 text-right mt-3">{formattedTime}</p>
      )}
    </div>
  );
}
