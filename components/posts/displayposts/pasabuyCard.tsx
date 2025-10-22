import { Clock, ShoppingBag } from "lucide-react";
import { getRelativeTime } from "@/utils/getRelativeTime";

type PasabuyCardProps = {
  id: string;
  title: string;
  description: string;
  serviceFee: number;
  created_at: string;
};

export function PasabuyCard({
  title,
  description,
  serviceFee,
  created_at,
}: PasabuyCardProps) {
  return (
    <div
      className={[
        "group relative overflow-hidden rounded-xl border bg-white",
        "shadow-sm hover:shadow-lg transition hover:border-slate-200",
        "h-[150px] p-4 flex flex-col justify-between",
      ].join(" ")}
    >
      {/* Left accent ribbon (PasaBuy) */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-[#9FC9FF] to-[#6EAEEA]" />

      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#E8F3FF] opacity-60 blur" />

      {/* Header: title + pill */}
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-800 line-clamp-1">
          {title}
        </h2>

        <span
          className={[
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
            "bg-[#E8F3FF] text-[#102E4A] border border-[#9FC9FF] ring-1 ring-inset ring-[#CDE7FF]",
          ].join(" ")}
          title="Group buy / PasaBuy"
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          PasaBuy
        </span>
      </div>

      {/* Body */}
      <p className="text-sm text-slate-600 line-clamp-2">
        {description}
      </p>

      {/* Footer: price + time */}
      <div className="mt-auto flex items-center justify-between">
        <span className="text-[#E59E2C] font-semibold text-sm">
          {serviceFee != null ? `₱${serviceFee.toLocaleString()}` : "Price not listed"}
        </span>

        <div className="flex items-center text-xs text-slate-500">
          <Clock className="w-4 h-4 mr-1" />
          <span>{getRelativeTime(created_at)}</span>
        </div>
      </div>

      {/* Hover outline */}
      <div className="pointer-events-none absolute inset-0 rounded-xl ring-0 ring-transparent transition group-hover:ring-1 group-hover:ring-[#CDE7FF]" />
    </div>
  );
}
