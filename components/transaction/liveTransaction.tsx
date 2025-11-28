"use client";

import { Button } from "@/components/ui/button";

type LiveTransactionCard = {
  txn: any; // You can replace 'any' with your transaction type later
  post_type: string;
  formattedTime: string;
  currentUserRole: "buyer" | "seller";
  handleUpdateTransaction: (id: string, status: string) => void;
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



export default function LiveTransactionCard({
  txn,
  post_type,
  formattedTime,
  currentUserRole,
  handleUpdateTransaction,
}: LiveTransactionCard) {
  return (
    <div className="bg-slate-100 border rounded-lg p-4 text-sm max-w-md">
      <p className="font-semibold mb-2">Transaction Form Completed</p>

      <p>
        <strong>Transaction type:</strong> {post_type}
      </p>

      <p>
        <strong>Item:</strong> {txn.item_title || "--"}
      </p>

      {post_type === "Rent" ? (
        <p>
          <strong>Price (₱):</strong> {txn.price?.toLocaleString() || "--"} / Day
        </p>
      ) : (
        <p>
          <strong>Price (₱):</strong> {txn.price?.toLocaleString() || "--"}
        </p>
      )}

      <p>
        <strong>Preferred method:</strong> {txn.fulfillment_method || "--"}
      </p>

      {post_type === "Rent" && (
        <p>
          <strong>Rent Duration:</strong> {formatDate(txn.rent_start_date)} → {formatDate(txn.rent_end_date)}
        </p>
      )}

      {txn.meetup_location && (
        <p>
          <strong>Location:</strong> {txn.meetup_location}
        </p>
      )}

      {txn.meetup_date && (
        <p>
          <strong>Date:</strong> {formatDate(txn.meetup_date)}
        </p>
      )}

      {txn.meetup_time && (
        <p>
          <strong>Time:</strong> {formatTime(txn.meetup_time)}
        </p>
      )}

      <p>
        <strong>Payment method:</strong> {txn.payment_method || "--"}
      </p>

      <p>
        <strong>Status:</strong> {txn.status || "--"}
      </p>

      {/* ✅ Action buttons */}
      {txn.status === "Pending" && (
        <div className="mt-3 flex gap-2">
          {currentUserRole === "seller" ? (
            <>
              <Button
                onClick={() => handleUpdateTransaction(txn.id, "Accepted")}
                className="bg-green-600 text-white"
              >
                Accept
              </Button>
              <Button
                onClick={() => handleUpdateTransaction(txn.id, "Cancelled")}
                className="bg-red-600 text-white"
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              onClick={() => handleUpdateTransaction(txn.id, "Cancelled")}
              className="bg-red-600 text-white"
            >
              Cancel
            </Button>
          )}
        </div>
      )}

      {/* 🕒 Timestamp */}
      <p className="text-xs text-gray-500 text-right mt-2">{formattedTime}</p>
    </div>
  );
}
