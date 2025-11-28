"use client";

import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Label } from "../ui/label";
import { calculateDistanceKm, calculateDeliveryFee } from "@/utils/deliveryFee";
import { createClient } from "@/utils/supabase/client";
import { getRoadDistanceKm } from "@/utils/getRoadDistance";


interface PastTransactionDetails {
  postType: string;
  itemTitle?: string;
  currentUserRole: string;
  createdAt?: string; // ✅ added this
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
}: PastTransactionDetails) {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [totalPayment, setTotalPayment] = useState<number | null>(null);

  useEffect(() => {
  const fetchDistanceAndFee = async () => {
    const supabase = createClient();

    // Get seller location
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
    if (value == null || value === "") return "—";
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num)) return "—";
    return `₱${num.toLocaleString()}`;
  };

  function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",   // "Nov"
    day: "numeric",   // "29"
    year: "numeric",  // "2025"
  });
}

function formatTime(timeStr: string) {
  // timeStr = "16:21:00"
  const date = new Date(`1970-01-01T${timeStr}`);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

  const formattedTime = createdAt
    ? new Date(createdAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : null;

  return (


    <div className="space-y-2 text-sm border rounded-md p-4 bg-white shadow-sm">
      <p className="font-semibold mb-2">Transaction Form Completed</p>

      <p>
        <strong>Transaction type:</strong> {postType ?? "Unknown"}
      </p>
      {itemTitle && (
        <p>
          <strong>Item:</strong> {itemTitle}
        </p>
      )}

      {/* --- SALE --- */}
      {postType === "Sale" && (
        <>
          <p>
            <strong>Price:</strong> {formatCurrency(txn.price)}
          </p>
          <p>
            <strong>Preferred method:</strong> {txn.fulfillment_method ?? "—"}
          </p>
        </>
      )}

      {/* --- RENT --- */}
      {postType === "Rent" && (
        <>
          <p>
            <strong>Rent Duration:</strong> {formatDate(txn.rent_start_date)} → {formatDate(txn.rent_end_date)}
          </p>
          <p>
            <strong>Price:</strong> {formatCurrency(txn.price)}
          </p>
        </>
      )}

      {/* --- TRADE --- */}
      {postType === "Trade" && (
        <>
          <p>
            <strong>Offered Item:</strong> {txn.offered_item ?? "N/A"}
          </p>
          <p>
            <strong>Cash Added:</strong> {formatCurrency(txn.cash_added)}
          </p>
        </>
      )}

      {/* --- PASABUY --- */}
      {postType === "Pasabuy" && (
        <>
          <p>
            <strong>Pasabuy Location:</strong> {txn.pasabuy_location ?? "N/A"}
          </p>
          <p>
            <strong>Cutoff Date:</strong> {txn.pasabuy_cutoff ?? "N/A"}
          </p>
          {txn.service_fee && (
            <p>
              <strong>Service Fee:</strong> {formatCurrency(txn.service_fee)}
            </p>
          )}
        </>
      )}

      {/* --- EMERGENCY LENDING --- */}
      {postType === "Emergency Lending" && txn.price && (
        <p>
          <strong>Estimated Value:</strong> {formatCurrency(txn.price)}
        </p>
      )}

      {/* --- COMMON FIELDS --- */}
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
          <strong>Time:</strong>{" "}
          {new Date(`1970-01-01T${txn.meetup_time}`).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })}
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
                ? "text-green-600 font-medium"
                : txn.status === "Cancelled"
                ? "text-red-500 font-medium"
                : "text-gray-700"
            }
          >
            {txn.status}
          </span>
        </p>
      )}

      {txn.status === "Accepted" &&
        txn.payment_method === "Online Payment" &&
        currentUserRole === "buyer" && (
          <Button onClick={() => setShowPaymentDialog(true)}>
            Pay now
          </Button>
      )}

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="space-y-4"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Online Payment</DialogTitle>
            <DialogDescription>
              Proceed with your payment. Choose your preferred method.
            </DialogDescription>
          </DialogHeader>

          
          <div className="space-y-3">
            <div className="p-4 rounded-lg border bg-gray-50 space-y-4">

              {/* Item name */}
              <p className="font-semibold text-lg">{itemTitle}</p>

              {/* Price breakdown */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Item Price</span>
                <span className="font-medium">{formatCurrency(txn.price)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Delivery Fee</span>
                <span className="font-medium">
                  {deliveryFee !== null ? formatCurrency(deliveryFee) : "Calculating..."}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Distance</span>
                <span className="font-medium">
                  {distanceKm !== null ? `${distanceKm.toFixed(2)} km` : "Computing..."}
                </span>
              </div>

              <hr />

              {/* Total */}
              <div className="flex justify-between text-base font-semibold">
                <span>Total Payment</span>
                <span className="text-blue-700">
                  {totalPayment !== null ? formatCurrency(totalPayment) : "—"}
                </span>
              </div>

            </div>


            <div className="flex gap-4 justify-center">
              <Button className="w-1/2">
                Wallet
              </Button>
              <Button className="w-1/2">
                Gcash
              </Button>
            </div>
            
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>



      {/* ✅ Timestamp at bottom */}
      {formattedTime && (
        <p className="text-xs text-gray-500 text-right mt-2">{formattedTime}</p>
      )}
    </div>
  );
}
