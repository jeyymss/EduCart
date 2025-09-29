import React from "react";

const typeBadgeStyles: Record<string, string> = {
  Sale: "bg-[#4B657A] text-white",
  Giveaway: "bg-[#7A2E2E] text-white",
  Rent: "bg-[#54766B] text-white",
  PasaBuy: "bg-[#785A28] text-white",
  "Emergency Lending": "bg-[#A02B2B] text-white",
  Trade: "bg-red-600 text-white",
};

type PostTypeBadgeProps = {
  type: keyof typeof typeBadgeStyles; // restricts to valid keys
  className?: string; // allow extra styles if needed
};

export default function PostTypeBadge({ type, className }: PostTypeBadgeProps) {
  const styles = typeBadgeStyles[type] || "bg-gray-300 text-black";

  return (
    <span
      className={`px-2 py-1 rounded text-xs font-medium ${styles} ${
        className ?? ""
      }`}
    >
      {type}
    </span>
  );
}
