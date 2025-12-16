import { Clock, ShoppingBag } from "lucide-react";
import { getRelativeTime } from "@/utils/getRelativeTime";

type PasabuyItem = {
  id: string;
  product_name: string;
  price: number;
};

type PasabuyCardProps = {
  id: string;
  title: string;
  description: string;
  serviceFee: number;
  created_at: string;
  items: PasabuyItem[];
};

export function PasabuyCard({
  title,
  description,
  serviceFee,
  created_at,
  items,
}: PasabuyCardProps) {
  return (
    <div
      className={[
        "group relative overflow-hidden rounded-xl border bg-white",
        "shadow-sm hover:shadow-lg transition hover:border-slate-200",
        "h-[180px] p-4 flex flex-col",
      ].join(" ")}
    >
      {/* Left accent */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-[#9FC9FF] to-[#6EAEEA]" />

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-800 line-clamp-1">
          {title}
        </h2>

        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-[#E8F3FF] text-[#102E4A] border border-[#9FC9FF]">
          <ShoppingBag className="h-3.5 w-3.5" />
          PasaBuy
        </span>
      </div>

      {/* Description */}
      <p className="mt-1 text-sm text-slate-600 line-clamp-2">
        {description}
      </p>

      {/* Items preview */}
      {items?.length > 0 && (
        <div className="mt-2 space-y-1 text-xs text-slate-600">
          {items.slice(0, 2).map((item) => (
            <div key={item.id} className="flex justify-between gap-2">
              <span className="truncate">{item.product_name}</span>
              <span className="font-medium text-slate-700">
                ₱{item.price.toLocaleString()}
              </span>
            </div>
          ))}

          {items.length > 2 && (
            <span className="text-[11px] text-slate-400">
              +{items.length - 2} more item{items.length - 2 > 1 ? "s" : ""}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between pt-2">
        <span className="text-[#E59E2C] font-semibold text-sm">
          {serviceFee != null
            ? `Service Fee: ₱${serviceFee.toLocaleString()}`
            : "Service fee not listed"}
        </span>

        <div className="flex items-center text-xs text-slate-500">
          <Clock className="w-4 h-4 mr-1" />
          <span>{getRelativeTime(created_at)}</span>
        </div>
      </div>

      {/* Hover ring */}
      <div className="pointer-events-none absolute inset-0 rounded-xl ring-0 ring-transparent transition group-hover:ring-1 group-hover:ring-[#CDE7FF]" />
    </div>
  );
}
