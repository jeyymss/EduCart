"use client";

import React from "react";
import { Button } from "../ui/button";

interface PastTransactionDetails {
  postType: string;
  itemTitle?: string;
  createdAt?: string; // ✅ added this
  txn: {
    price?: number | string | null;
    rent_start_date: string;
    rent_end_date: string;
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
  createdAt,
  txn,
}: PastTransactionDetails) {
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

      {txn.status === "Accepted" && txn.payment_method === "Online Payment" && (
        <Button>
          Pay now
        </Button>
      )}

      {/* ✅ Timestamp at bottom */}
      {formattedTime && (
        <p className="text-xs text-gray-500 text-right mt-2">{formattedTime}</p>
      )}
    </div>
  );
}
