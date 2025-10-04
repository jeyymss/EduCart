"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import PostTypeBadge from "@/components/postTypeBadge";

export type TxMethod = "Meetup" | "Delivery";
export type TxSide = "Purchases" | "Sales";

export type TransactionCardProps = {
  id: string;
  type: TxSide;              // "Purchases" | "Sales"
  method: TxMethod;          // "Meetup" | "Delivery"
  title: string;
  price: number;
  total?: number;
  image?: string;            // default /bluecart.png
  onView: (id: string) => void;
  onPrimary?: (id: string) => void;
  primaryLabel?: string;     
};

function computeLabel(type: TxSide, method: TxMethod): string {
  if (type === "Purchases") return "Received";
  // Sales
  return method === "Delivery" ? "Add Delivery" : "Delivered";
}

export default function TransactionCard({
  id,
  type,
  method,
  title,
  price,
  total,
  image,
  onView,
  onPrimary,
  primaryLabel,
}: TransactionCardProps) {
  const img = image ?? "/bluecart.png";
  const badgeText = type === "Sales" ? "Sale" : "Buy";
  const action = primaryLabel ?? computeLabel(type, method);

  return (
    <div className="relative rounded-md overflow-hidden border border-gray-200 shadow hover:shadow-md transition bg-white flex flex-col h-full">
      {/* Image (same as ItemCard) */}
      <div className="relative w-full h-60">
        <Image src={img} alt={title} fill className="object-cover" />
        <PostTypeBadge type={badgeText as any} className="absolute top-2 left-2 shadow" />
        {/* Optional tiny chip for method */}
        <span className="absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-300">
          {method}
        </span>
      </div>

      <div className="p-3 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-lg font-semibold text-[#333333] line-clamp-2">{title}</h2>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full text-xs px-3 py-0.5 h-7"
            onClick={() => onView(id)}
          >
            View
          </Button>
        </div>

        <p className="text-[#E59E2C] font-medium text-sm">
          ₱{price.toLocaleString()}
        </p>

        {/* Footer: Total inline with button */}
        <div className="mt-auto flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Total:</span>{" "}
            <span className="text-[#E59E2C]">₱{(total ?? price).toLocaleString()}</span>
          </div>

          {onPrimary && (
            <Button
              size="sm"
              className="rounded-full text-xs px-4 h-8"
              onClick={() => onPrimary(id)}
            >
              {action}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}