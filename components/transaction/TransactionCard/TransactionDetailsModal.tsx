"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  BadgeCheck,
  Package,
  ReceiptText,
  Calendar,
  MapPin,
  X,
} from "lucide-react";
import * as React from "react";

type TransactionDetailsModalProps = {
  open: boolean;
  onClose: () => void;
  data?: {
    id: string;
    reference_code: string | undefined;
    title: string;
    price: number;
    total: number;
    method: string;
    type: string;
    status: string;
    created_at?: string;
    buyer?: string;
    seller?: string;
    address?: string;
  };
};

const peso = (n: number) =>
  `₱${(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

function Tag({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={
        "inline-flex items-center rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-700 " +
        className
      }
    >
      {children}
    </span>
  );
}

export default function TransactionDetailsModal({
  open,
  onClose,
  data,
}: TransactionDetailsModalProps) {
  if (!data) return null;

  const created =
    data.created_at ? new Date(data.created_at).toLocaleString() : null;

  const statusTone =
    data.status?.toLowerCase() === "active"
      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
      : data.status?.toLowerCase() === "pending"
      ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
      : "bg-slate-100 text-slate-700 ring-1 ring-slate-200";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="max-w-lg overflow-hidden rounded-2xl p-0 shadow-xl"
        aria-describedby={undefined}
      >
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 rounded-t-2xl bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800" />

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3.5 top-2.5 z-10 text-white transition-colors hover:text-gray-300 hover:cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="relative flex items-center gap-3 px-6 py-5 text-white">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 ring-1 ring-white/20">
              <ReceiptText className="h-5 w-5" />
            </div>

            <div className="flex-1">
              <DialogHeader className="p-0">
                <DialogTitle className="text-base font-semibold">
                  Order Summary
                </DialogTitle>
              </DialogHeader>
              <p className="text-xs text-white/70">
                Ref: <span className="font-mono">{data.reference_code}</span>
              </p>
            </div>

            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusTone}`}
            >
              <BadgeCheck className="h-3.5 w-3.5" />
              <span className="capitalize">{data.status}</span>
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <div className="mb-4 flex items-start gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 ring-1 ring-slate-200">
              <Package className="h-4.5 w-4.5 text-slate-700" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500">Item</p>
              <p className="truncate text-sm font-semibold text-slate-900">
                {data.title}
              </p>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-xs font-medium text-slate-500">Price</p>
              <p className="text-sm font-semibold text-slate-900">
                {peso(data.price)}
              </p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs font-medium text-amber-700">Total</p>
              <p className="text-sm font-extrabold text-amber-700">
                {peso(data.total)}
              </p>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-2 text-sm text-slate-700">
            <div className="flex items-center gap-2">
              <Tag>{data.type}</Tag>

              <span className="inline-flex items-center text-xs px-3 py-1 rounded-full border bg-gray-50 text-gray-700">
                {data.method}
              </span>
            </div>

            {created && (
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="h-4 w-4" />
                <span>{created}</span>
              </div>
            )}

            {data.address && (
              <div className="flex items-start gap-2 text-slate-600">
                <MapPin className="mt-0.5 h-4 w-4 flex-none" />
                <span className="break-words">{data.address}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-slate-500">
              {data.buyer && (
                <div>
                  <p className="font-medium text-slate-600">Buyer</p>
                  <p className="truncate">{data.buyer}</p>
                </div>
              )}
              {data.seller && (
                <div>
                  <p className="font-medium text-slate-600">Seller</p>
                  <p className="truncate">{data.seller}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
