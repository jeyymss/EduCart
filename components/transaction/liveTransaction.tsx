"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  return (
    <div className="border border-gray-200 rounded-2xl p-6 bg-gradient-to-br from-white to-gray-50 shadow-lg hover:shadow-xl transition-all max-w-md">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          <p className="font-bold text-lg text-[#102E4A]">
            Pending Transaction
          </p>
        </div>
        <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
          {txn.status}
        </span>
      </div>

      {/* DETAILS */}
      <div className="space-y-3 text-sm">
        {/* Item Title - Highlighted */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
          <p className="text-xs text-blue-600 font-medium mb-1">ITEM</p>
          <p className="font-semibold text-gray-900">{txn.item_title || "—"}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Transaction Type */}
          <div className="bg-white border border-gray-100 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Type</p>
            <p className="font-medium text-gray-900">{post_type}</p>
          </div>

          {/* Price */}
          <div className="bg-white border border-gray-100 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Price</p>
            <p className="font-semibold text-[#E59E2C]">
              ₱{txn.price?.toLocaleString() || "—"}
              {post_type === "Rent" && <span className="text-xs"> /day</span>}
            </p>
          </div>
        </div>

        {/* RENT DURATION */}
        {post_type === "Rent" && txn.rent_start_date && txn.rent_end_date && (
          <div className="bg-white border border-gray-100 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Rent Duration</p>
            <p className="font-medium text-gray-900">
              {formatDate(txn.rent_start_date)} → {formatDate(txn.rent_end_date)}
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
      </div>

      {/* BUTTONS */}
      {txn.status === "Pending" && (
        <div className="mt-5 flex flex-col gap-2">
          {post_type === "Giveaway" && currentUserRole === "buyer" ? (
            <>
              <Button
                onClick={async () => {
                  await handleUpdateTransaction(txn.id, "Accepted");
                  router.push("/profile#transactions");
                }}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 w-full rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
              >
                ✓ Accept Transaction
              </Button>

              <Button
                onClick={() =>
                  handleUpdateTransaction(txn.id, "Cancelled")
                }
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 w-full rounded-lg font-medium border border-gray-300 transition-all"
              >
                ✕ Cancel
              </Button>
            </>
          ): (
            <>
              {post_type !== "Giveaway" && currentUserRole === "seller" ? (
              <>
                <Button
                  onClick={async () => {
                    await handleUpdateTransaction(txn.id, "Accepted");
                    router.push("/profile#transactions");
                  }}
                  className="bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 w-full rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  ✓ Accept Transaction
                </Button>

                <Button
                  onClick={() =>
                    handleUpdateTransaction(txn.id, "Cancelled")
                  }
                  className="bg-gray-100 text-gray-700 hover:bg-gray-200 w-full rounded-lg font-medium border border-gray-300 transition-all"
                >
                  ✕ Cancel
                </Button>
              </>
            ) : (
              <Button
                onClick={() =>
                  handleUpdateTransaction(txn.id, "Cancelled")
                }
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 w-full rounded-lg font-medium border border-gray-300 transition-all"
              >
                ✕ Cancel Transaction
              </Button>
            )}
            </>
          )}
        </div>
      )}

      {/* TIMESTAMP */}
      <p className="text-xs text-gray-400 text-right mt-4">
        {formattedTime}
      </p>
    </div>
  );
}
