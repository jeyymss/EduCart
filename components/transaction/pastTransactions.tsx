"use client";

import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import Image from "next/image";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { calculateDeliveryFee } from "@/utils/deliveryFee";
import { createClient } from "@/utils/supabase/client";
import { getRoadDistanceKm } from "@/utils/getRoadDistance";
import { Wallet, X } from "lucide-react";

interface PastTransactionDetails {
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
  transaction_id
}: PastTransactionDetails) {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [totalPayment, setTotalPayment] = useState<number | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [isPaying, setIsPaying] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
      async function load() {
          const res = await fetch("/api/wallet/get");
          const data = await res.json();

          setBalance(data.balance);
      }

      load();
  }, []);

  useEffect(() => {
    const fetchDistanceAndFee = async () => {
      const supabase = createClient();
      const { data: post } = await supabase
        .from("posts")
        .select("pickup_lat, pickup_lng")
        .eq("id", txn.post_id)
        .single();

      if (!post || !txn.delivery_lat || !txn.delivery_lng) return;

      const distanceKm = await getRoadDistanceKm(
        post.pickup_lat,
        post.pickup_lng,
        txn.delivery_lat,
        txn.delivery_lng
      );

      const fee = calculateDeliveryFee(distanceKm);
      const total = Number(txn.price) + fee;

      setDistanceKm(distanceKm);
      setDeliveryFee(fee);
      setTotalPayment(total);
    };

    fetchDistanceAndFee();
  }, [txn]);

  const formatCurrency = (value?: number | string | null) => {
    if (!value) return "—";
    const num = typeof value === "string" ? parseFloat(value) : value;
    return `₱${num.toLocaleString()}`;
  };

  const formattedTime = createdAt
    ? new Date(createdAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : null;

  const insufficientBalance =
    paymentMethod === "wallet" &&
    totalPayment !== null &&
    balance < totalPayment;

  const handleWalletPayment = async () => {
    if (paymentMethod !== "wallet") {
      // later you will handle GCash here
      return;
    }

    if (!totalPayment) return;

    setIsPaying(true);
    setSuccessMsg("");

    try {
      const res = await fetch("/api/wallet/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionId: transaction_id, // ⚠️ make sure txn has .id = transactions.id
          amount: totalPayment,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        alert(data.error || "Payment failed");
        setIsPaying(false);
        return;
      }

      // Update local balance using value from API
      if (typeof data.newBalance === "number") {
        setBalance(data.newBalance);
      } else {
        // fallback: manually subtract
        setBalance((prev) => (prev ?? 0) - totalPayment);
      }

      setSuccessMsg("Payment successful!");

      // You might also want to update txn.status locally if you want:
      // txn.status = "Paid"; (or lift this state up in parent)

      setTimeout(() => {
        setIsPaying(false);
        setShowPaymentDialog(false);
      }, 1200);
    } catch (err) {
      console.error(err);
      alert("Something went wrong while processing payment.");
      setIsPaying(false);
    }
  };

  console.log("transaction_id:", transaction_id);

  return (
    <div className="border rounded-xl p-5 bg-white shadow-md transition-all">
      <p className="font-semibold text-base mb-4 text-[#102E4A]">
        Transaction Form Completed
      </p>

      <div className="space-y-2 text-[15px] leading-relaxed text-gray-800">
        <p>
          <strong>Transaction type:</strong> {postType}
        </p>

        {itemTitle && (
          <p>
            <strong>Item:</strong> {itemTitle}
          </p>
        )}

        {postType === "Sale" && (
          <>
            <p>
              <strong>Price:</strong> {formatCurrency(txn.price)}
            </p>
            <p>
              <strong>Preferred method:</strong>{" "}
              {txn.fulfillment_method ?? "—"}
            </p>
          </>
        )}

        {postType === "Rent" && (
          <>
            <p>
              <strong>Rent Duration:</strong>{" "}
              {txn.rent_start_date} → {txn.rent_end_date}
            </p>
            <p>
              <strong>Price:</strong> {formatCurrency(txn.price)}
            </p>
          </>
        )}

        {postType === "Trade" && (
          <>
            <p>
              <strong>Offered Item:</strong> {txn.offered_item ?? "N/A"}
            </p>
            <p>
              <strong>Cash Added:</strong>{" "}
              {formatCurrency(txn.cash_added)}
            </p>
          </>
        )}

        {postType === "Pasabuy" && (
          <>
            <p>
              <strong>Pasabuy Location:</strong>{" "}
              {txn.pasabuy_location ?? "N/A"}
            </p>
            <p>
              <strong>Cutoff:</strong> {txn.pasabuy_cutoff ?? "N/A"}
            </p>
            {txn.service_fee && (
              <p>
                <strong>Service Fee:</strong>{" "}
                {formatCurrency(txn.service_fee)}
              </p>
            )}
          </>
        )}

        {txn.meetup_location && (
          <p>
            <strong>Location:</strong> {txn.meetup_location}
          </p>
        )}
        {txn.meetup_date && (
          <p>
            <strong>Date:</strong> {txn.meetup_date}
          </p>
        )}
        {txn.meetup_time && (
          <p>
            <strong>Time:</strong> {txn.meetup_time}
          </p>
        )}
        {txn.payment_method && (
          <p>
            <strong>Payment method:</strong> {txn.payment_method}
          </p>
        )}

        {txn.status && (
          <p>
            <strong>Status:</strong>{" "}
            <span
              className={
                txn.status === "Accepted"
                  ? "text-green-600 font-semibold"
                  : txn.status === "Cancelled"
                  ? "text-red-500 font-semibold"
                  : "text-gray-600"
              }
            >
              {txn.status}
            </span>
          </p>
        )}
      </div>

      {txn.status === "Accepted" &&
        txn.payment_method === "Online Payment" &&
        currentUserRole === "buyer" && (
          <Button
            className="mt-4 w-full rounded-lg py-2 text-black hover:cursor-pointer"
            style={{ backgroundColor: "#C7D9E5" }}
            onClick={() => setShowPaymentDialog(true)}
          >
            Pay now
          </Button>
        )}

      {/* PAYMENT MODAL */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent
          className="
            space-y-4 p-4 sm:p-6
            fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
            w-full max-w-[90%] sm:max-w-md
            rounded-lg sm:rounded-xl
          "
          onOpenAutoFocus={(e) => e.preventDefault()}
        >

          <button
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 transition hover:cursor-pointer"
            onClick={() => setShowPaymentDialog(false)}
          >
            <X className="w-5 h-5" />
          </button>

          <DialogHeader>
            <DialogTitle className="text-[#102E4A]">
              Online Payment
            </DialogTitle>
            <DialogDescription>
              Review fees and choose a payment method.
            </DialogDescription>
          </DialogHeader>

          {/* PAYMENT SUMMARY */}
          <div className="p-4 border rounded-lg bg-gray-50 space-y-3">
            <p className="font-semibold text-lg">{itemTitle}</p>

            <div className="flex justify-between text-sm">
              <span>Item Price</span>
              <span>{formatCurrency(txn.price)}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Delivery Fee</span>
              <span>
                {deliveryFee !== null
                  ? formatCurrency(deliveryFee)
                  : "Calculating..."}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Distance</span>
              <span>
                {distanceKm !== null
                  ? `${distanceKm.toFixed(2)} km`
                  : "Computing..."}
              </span>
            </div>

            <hr />

            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span className="text-blue-900">
                {totalPayment !== null
                  ? formatCurrency(totalPayment)
                  : "—"}
              </span>
            </div>
          </div>

          <div className="space-y-4 p-4 border rounded-xl bg-white">

          <h2 className="text-lg font-semibold">Payment Method</h2>

          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">

            {/* WALLET */}
            <div
              className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition cursor-pointer"
              onClick={() => setPaymentMethod("wallet")}
            >
              <div className="flex items-center gap-3">
                <Wallet width={28} height={28} />
                <div>
                  <p className="font-medium text-base">Wallet</p>
                  <p className="text-sm text-gray-500">₱ {balance.toFixed(2)}</p>
                </div>
              </div>

              <RadioGroupItem value="wallet" id="wallet" className="h-5 w-5" />
            </div>

            {/* GCASH */}
            <div
              className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition cursor-pointer"
              onClick={() => setPaymentMethod("gcash")}
            >
              <div className="flex items-center gap-3">
                <Image src="/GCASH.png" alt="gcash" width={32} height={32} />
                <p className="font-medium text-base text-blue-600">GCash</p>
              </div>

              <RadioGroupItem value="gcash" id="gcash" className="h-5 w-5" />
            </div>

          </RadioGroup>

          {/* Continue Payment */}
          <Button
            className="w-full mt-4"
            disabled={insufficientBalance || isPaying}
            onClick={handleWalletPayment}
          >
            {isPaying
              ? "Processing..."
              : insufficientBalance
              ? "Insufficient Balance"
              : "Continue Payment"}
          </Button>

          {successMsg && (
            <p className="mt-2 text-center text-sm font-medium text-green-600">
              {successMsg}
            </p>
          )}

        </div>


        </DialogContent>
      </Dialog>

      {formattedTime && (
        <p className="text-xs text-gray-500 text-right mt-3">
          {formattedTime}
        </p>
      )}
    </div>
  );
}
