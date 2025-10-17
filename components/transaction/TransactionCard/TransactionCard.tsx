"use client";

import { Button } from "@/components/ui/button";
import PostTypeBadge from "@/components/postTypeBadge";

export type TxMethod = "Meetup" | "Delivery";
export type TxSide = "Purchases" | "Sales";
export type TxStatus = "active" | "completed" | "cancelled";

export type TransactionCardProps = {
  id: string;
  type: TxSide;            // "Purchases" | "Sales"
  method: TxMethod;        // "Meetup" | "Delivery"
  title: string;
  price: number;
  total?: number;
  image?: string;        
  onView: (id: string) => void;
  onPrimary?: (id: string) => void;
  primaryLabel?: string;
  status?: TxStatus;
  postType?: string;      
};

function computeLabel(type: TxSide, method: TxMethod, status?: TxStatus) {
  if (status === "cancelled") return "Cancelled";
  if (type === "Purchases") return "Received";
  return method === "Delivery" ? "Add Delivery" : "Delivered";
}

export default function TransactionCard({
  id,
  type,
  method,
  title,
  price,
  total,
  onView,
  onPrimary,
  primaryLabel,
  status = "active",
  postType,
}: TransactionCardProps) {
  const badgeText = postType ?? (type === "Sales" ? "Sale" : "Buy");
  const action = primaryLabel ?? computeLabel(type, method, status);
  const isCancelled = status === "cancelled";

  return (
    <tr
      className={`hover:bg-gray-50 transition-colors cursor-pointer ${isCancelled ? "opacity-80" : ""}`}
      onClick={() => onView(id)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onView(id);
      }}
    >
      {/* Name */}
      <td className="px-6 py-4 font-medium text-gray-900">
        {title}
      </td>

      {/* Total Price (one only) */}
      <td className="px-6 py-4 font-semibold text-[#E59E2C] whitespace-nowrap">
        ₱{(total ?? price).toLocaleString()}
      </td>

      {/* Listing type (Rent/Sale/Trade) */}
      <td className="px-6 py-4">
        <PostTypeBadge type={badgeText as any} className="shadow-sm" />
      </td>

      {/* Transaction type (Meetup/Delivery) */}
      <td className="px-6 py-4">
        <span className="inline-flex items-center text-xs px-3 py-1 rounded-full border bg-gray-50 text-gray-700">
          {method}
        </span>
      </td>

      {/* Action */}
      <td
        className="px-6 py-4 text-right"
        onClick={(e) => e.stopPropagation()} 
      >
        {onPrimary && (
          <Button
            size="sm"
            className={`rounded-full text-xs px-5 h-8 text-white ${
              isCancelled ? "bg-red-600 hover:bg-red-700" : "bg-slate-900 hover:bg-slate-800"
            }`}
            disabled={isCancelled}
            onClick={() => onPrimary(id)}
          >
            {action}
          </Button>
        )}
      </td>
    </tr>
  );
}
