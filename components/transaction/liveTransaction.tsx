"use client";

import { Button } from "@/components/ui/button";

type LiveTransactionCard = {
  txn: any; // You can replace 'any' with your transaction type later
  formattedTime: string;
  currentUserRole: "buyer" | "seller";
  handleUpdateTransaction: (id: string, status: string) => void;
};

export default function LiveTransactionCard({
  txn,
  formattedTime,
  currentUserRole,
  handleUpdateTransaction,
}: LiveTransactionCard) {
  return (
    <div className="bg-slate-100 border rounded-lg p-4 text-sm max-w-md">
      <p className="font-semibold mb-2">Transaction Form Completed</p>

      <p>
        <strong>Transaction type:</strong> {txn.post_types?.name || "--"}
      </p>

      <p>
        <strong>Item:</strong> {txn.item_title || "--"}
      </p>

      <p>
        <strong>Price (₱):</strong> {txn.price?.toLocaleString() || "--"}
      </p>

      <p>
        <strong>Preferred method:</strong> {txn.fulfillment_method || "--"}
      </p>

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
