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

  // Parse PasaBuy data from offered_item
  const pasabuyData = postType === "PasaBuy" && txn.offered_item
    ? (() => {
        try {
          return JSON.parse(txn.offered_item);
        } catch {
          return null;
        }
      })()
    : null;

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

  // Load Wallet Balance - only when PaymentDialog is opened
  useEffect(() => {
    if (!showPaymentDialog) return;

    async function load() {
      const res = await fetch("/api/wallet/balance");
      const data = await res.json();
      setBalance(data.balance);
    }
    load();
  }, [showPaymentDialog]);

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

    // ========================
    // PASABUY
    // ========================
    if (postType === "PasaBuy") {
      // For PasaBuy, the price field already contains the total
      // (items + service fee + delivery fee if delivery)
      setTotalPayment(Number(txn.price));

      // Set delivery fee and distance if it's a delivery
      if (txn.fulfillment_method === "Delivery" && txn.delivery_fee !== null) {
        setDeliveryFee(Number(txn.delivery_fee));
        setDistanceKm(Number(txn.delivery_distance_km ?? 0));
      } else {
        setDeliveryFee(null);
        setDistanceKm(null);
      }
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

  const formatCurrency = (v?: number | null) =>
    v != null ? `₱${v.toLocaleString()}` : "—";

  function formatDate(dateStr: string) {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function formatTime(timeStr: string) {
    if (!timeStr) return "—";
    const date = new Date(`1970-01-01T${timeStr}`);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  // Determine status badge color
  const getStatusColor = () => {
    switch (txn.status) {
      case "Accepted":
        return "bg-green-100 text-green-700";
      case "Paid":
        return "bg-blue-100 text-blue-700";
      case "PickedUp":
        return "bg-purple-100 text-purple-700";
      case "Completed":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="border border-gray-200 rounded-2xl p-6 bg-gradient-to-br from-white to-gray-50 shadow-lg hover:shadow-xl transition-all">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <p className="font-bold text-lg text-[#102E4A]">
            Transaction Accepted
          </p>
        </div>
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor()}`}>
          {txn.status}
        </span>
      </div>

      {/* PAY NOW BUTTON - Prominent placement for Online Payment */}
      {txn.status === "Accepted" &&
        txn.payment_method === "Online Payment" &&
        currentUserRole === "buyer" && (
          <Button
            className="w-full mb-5 rounded-xl py-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all"
            onClick={() => setShowPaymentDialog(true)}
          >
            💳 Pay Now - {formatCurrency(totalPayment)}
          </Button>
      )}

      {/* DETAILS */}
      <div className="space-y-3 text-sm">
        {/* Item Title - Highlighted */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
          <p className="text-xs text-blue-600 font-medium mb-1">ITEM</p>
          <p className="font-semibold text-gray-900">{itemTitle || "—"}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Transaction Type */}
          <div className="bg-white border border-gray-100 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Type</p>
            <p className="font-medium text-gray-900">{postType}</p>
          </div>

          {/* Price */}
          <div className="bg-white border border-gray-100 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Price</p>
            <p className="font-semibold text-[#E59E2C]">
              {formatCurrency(txn.price)}
              {postType === "Rent" && <span className="text-xs"> /day</span>}
            </p>
          </div>
        </div>

        {/* RENT DURATION */}
        {postType === "Rent" && txn.rent_start_date && txn.rent_end_date && (
          <div className="bg-white border border-gray-100 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Rent Duration</p>
            <p className="font-medium text-gray-900">
              {formatDate(txn.rent_start_date)} → {formatDate(txn.rent_end_date)}
              {rentDays && <span className="text-xs text-gray-500"> ({rentDays} days)</span>}
            </p>
          </div>
        )}

        {/* Fulfillment & Payment */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white border border-gray-100 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Fulfillment</p>
            <p className="font-medium text-gray-900">{txn.fulfillment_method || "—"}</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Payment</p>
            <p className="font-medium text-gray-900">{txn.payment_method || "—"}</p>
          </div>
        </div>

        {/* LOCATION DETAILS */}
        {(txn.meetup_location || txn.meetup_date || txn.meetup_time) && (
          <div className="bg-white border border-gray-100 rounded-lg p-3 space-y-2">
            <p className="text-xs text-gray-500 font-medium">MEETUP DETAILS</p>
            {txn.meetup_location && (
              <p className="text-sm text-gray-700">
                <span className="font-medium">📍</span> {txn.meetup_location}
              </p>
            )}
            {txn.meetup_date && (
              <p className="text-sm text-gray-700">
                <span className="font-medium">📅</span> {formatDate(txn.meetup_date)}
              </p>
            )}
            {txn.meetup_time && (
              <p className="text-sm text-gray-700">
                <span className="font-medium">🕐</span> {formatTime(txn.meetup_time)}
              </p>
            )}
          </div>
        )}

        {/* PASABUY: Selected Items */}
        {postType === "PasaBuy" && pasabuyData?.items && Array.isArray(pasabuyData.items) && pasabuyData.items.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-lg p-3 space-y-2">
            <p className="text-xs text-gray-500 font-medium">SELECTED ITEMS</p>
            <div className="space-y-1.5">
              {pasabuyData.items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-gray-700">{item.product_name}</span>
                  <span className="font-medium text-amber-600">₱{Number(item.price).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PASABUY: Price Breakdown */}
        {postType === "PasaBuy" && (
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-3 space-y-2">
            <p className="text-xs text-amber-700 font-medium">PRICE BREAKDOWN</p>

            {pasabuyData?.itemsTotal !== null && pasabuyData?.itemsTotal !== undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Items Total</span>
                <span className="font-medium">{formatCurrency(pasabuyData.itemsTotal)}</span>
              </div>
            )}

            {pasabuyData?.serviceFee !== null && pasabuyData?.serviceFee !== undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Service Fee</span>
                <span className="font-medium">{formatCurrency(pasabuyData.serviceFee)}</span>
              </div>
            )}

            {txn.delivery_fee !== null && txn.fulfillment_method === "Delivery" && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Delivery Fee</span>
                <span className="font-medium">{formatCurrency(txn.delivery_fee)}</span>
              </div>
            )}

            <div className="border-t border-amber-300 pt-2 mt-2">
              <div className="flex justify-between items-center">
                <p className="text-base font-bold text-gray-800">Total</p>
                <p className="text-lg font-bold text-amber-700">
                  {formatCurrency(totalPayment)}
                </p>
              </div>
            </div>

            {txn.delivery_distance_km !== null && txn.fulfillment_method === "Delivery" && (
              <p className="text-xs text-gray-600 mt-1">
                Distance: {Number(txn.delivery_distance_km).toFixed(2)} km
              </p>
            )}

            {txn.fulfillment_method === "Meetup" && (
              <p className="text-xs text-gray-600 mt-1 italic">
                Meetup Transaction — No delivery fees
              </p>
            )}
          </div>
        )}

        {/* TOTAL PAYMENT - If delivery or rent (non-PasaBuy) */}
        {postType !== "PasaBuy" && totalPayment !== null && totalPayment !== txn.price && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <p className="text-sm font-semibold text-gray-700">Total Payment</p>
              <p className="text-lg font-bold text-blue-700">
                {formatCurrency(totalPayment)}
              </p>
            </div>
            {deliveryFee !== null && (
              <p className="text-xs text-gray-600 mt-1">
                Includes delivery fee of {formatCurrency(deliveryFee)} ({distanceKm?.toFixed(2)} km)
              </p>
            )}
          </div>
        )}
      </div>


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
          pasabuyItems={pasabuyData?.items}
          itemsTotal={pasabuyData?.itemsTotal}
          serviceFee={pasabuyData?.serviceFee}
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
