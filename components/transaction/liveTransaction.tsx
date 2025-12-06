"use client";

import { Button } from "@/components/ui/button";

type LiveTransactionCard = {
  txn: any;
  post_type: string;
  formattedTime: string;
  currentUserRole: "buyer" | "seller";
  handleUpdateTransaction: (id: string, status: string) => void;
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(timeStr: string) {
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
    <div className={`border rounded-xl p-5 shadow-md transition-all max-w-md ${
      txn.status === "Accepted"
        ? "bg-green-50 border-green-300"
        : txn.status === "Cancelled"
        ? "bg-red-50 border-red-300"
        : "bg-white"
    }`}>
      {/* TITLE */}
      <p className="font-semibold text-base mb-4 text-[#102E4A]">
        {txn.status === "Accepted" && "✅ Transaction Accepted"}
        {txn.status === "Cancelled" && "❌ Transaction Cancelled"}
        {txn.status === "Pending" && "⏳ Transaction Pending"}
        {!["Accepted", "Cancelled", "Pending"].includes(txn.status) && "Transaction Form Completed"}
      </p>

      {/* DETAILS */}
      <div className="space-y-2 text-[15px] leading-relaxed text-gray-800">
        <p>
          <strong>Transaction type:</strong> {post_type}
        </p>

        <p>
          <strong>Item:</strong> {txn.item_title || "—"}
        </p>

        {/* PRICE */}
        {post_type === "Rent" ? (
          <p>
            <strong>Price:</strong> ₱
            {txn.price?.toLocaleString() || "—"} / day
          </p>
        ) : (
          <p>
            <strong>Price:</strong> ₱
            {txn.price?.toLocaleString() || "—"}
          </p>
        )}

        <p>
          <strong>Preferred method:</strong>{" "}
          {txn.fulfillment_method || "—"}
        </p>

        {/* RENT DURATION */}
        {post_type === "Rent" && (
          <p>
            <strong>Rent Duration:</strong>{" "}
            {formatDate(txn.rent_start_date)} →{" "}
            {formatDate(txn.rent_end_date)}
          </p>
        )}

        {/* LOCATION */}
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
          <strong>Payment method:</strong> {txn.payment_method || "—"}
        </p>

        {/* STATUS WITH COLORS */}
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
      </div>

      {/* BUTTONS */}
      {txn.status === "Pending" && (
        <div className="mt-4 flex flex-col gap-3">
          {post_type === "Giveaway" && currentUserRole === "buyer" ? (
            <>
              <Button
                onClick={() =>
                  handleUpdateTransaction(txn.id, "Accepted")
                }
                className="bg-green-600 text-white hover:bg-green-700 w-full"
              >
                Accept
              </Button>

              <Button
                onClick={() =>
                  handleUpdateTransaction(txn.id, "Cancelled")
                }
                className="bg-red-600 text-white hover:bg-red-700 w-full"
              >
                Cancel
              </Button>
            </>
          ): (
            <>
              {post_type !== "Giveaway" && currentUserRole === "seller" ? (
              <>
                <Button
                  onClick={() =>
                    handleUpdateTransaction(txn.id, "Accepted")
                  }
                  className="bg-green-600 text-white hover:bg-green-700 w-full"
                >
                  Accept
                </Button>

                <Button
                  onClick={() =>
                    handleUpdateTransaction(txn.id, "Cancelled")
                  }
                  className="bg-red-600 text-white hover:bg-red-700 w-full"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                onClick={() =>
                  handleUpdateTransaction(txn.id, "Cancelled")
                }
                className="bg-red-600 text-white hover:bg-red-700 w-full"
              >
                Cancel
              </Button>
            )}
            </>              
          )}

          
        </div>
      )}

      {/* TIMESTAMP */}
      <p className="text-xs text-gray-500 text-right mt-3">
        {formattedTime}
      </p>
    </div>
  );
}
