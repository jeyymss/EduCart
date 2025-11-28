"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
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
  Flag,
} from "lucide-react";
import * as React from "react";
import ReportTransacDialog from "@/components/report/reportTransacDialog";
import { submitTransacReport } from "@/app/api/reports/reportTransac/route";

type TransactionDetailsModalProps = {
  open: boolean;
  onClose: () => void;
  data?: {
    id: string;
    transaction_id: string;
    reference_code: string | undefined;
    title: string;
    price: number;
    total: number;
    payment_method: string;
    method: string;
    type: string;
    status: string;
    created_at?: string;
    post_id: string;
    buyer?: string;
    buyer_id: string;
    seller?: string;
    seller_id: string;
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
  const [showReport, setShowReport] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState("");

  if (!data) return null;

  const created =
    data.created_at ? new Date(data.created_at).toLocaleString() : null;

  const statusTone =
    data.status?.toLowerCase() === "active"
      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
      : data.status?.toLowerCase() === "pending"
      ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
      : "bg-slate-100 text-slate-700 ring-1 ring-slate-200";

  const reportSubmit = async () => {
    if (!selectedReportReason) {
      alert("Please select a reason.");
      return;
    }

    const { error } = await submitTransacReport({
      reportedTransacId: data.transaction_id,
      reportedItemId: data.post_id,
      reportedUserId: data.seller_id!,
      reportType: selectedReportReason,
    });

    if (error) {
      console.error(error);
      alert("Failed to submit report.");
      return;
    }

    alert("Report submitted successfully.");
    setShowReport(false);
    setSelectedReportReason("");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="
          w-full max-w-lg 
          p-0 rounded-2xl shadow-xl 
          overflow-hidden 
          max-h-[95vh] 
          flex flex-col
        "
        aria-describedby={undefined}
      >
        {/* HEADER */}
        <div className="relative">
          <div className="absolute inset-0 rounded-t-2xl bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800" />

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 z-10 text-white hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="relative flex items-center gap-3 px-6 py-5 text-white">
            {/* Icon */}
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 ring-1 ring-white/20">
              <ReceiptText className="h-5 w-5" />
            </div>

            {/* Title */}
            <div className="flex-1 min-w-0">
              <DialogHeader className="p-0">
                <DialogTitle className="text-base font-semibold truncate">
                  Order Summary
                </DialogTitle>
              </DialogHeader>
              <p className="text-xs text-white/70 truncate">
                Ref: <span className="font-mono">{data.reference_code}</span>
              </p>
            </div>

            {/* Status */}
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusTone}`}
            >
              <BadgeCheck className="h-3.5 w-3.5" />
              <span className="capitalize">{data.status}</span>
            </span>
          </div>
        </div>

        {/* BODY  */}
        <div className="px-6 py-5 overflow-y-auto">
          {/* ITEM + REPORT BUTTON */}
          <div className="mb-4 flex justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 ring-1 ring-slate-200">
                <Package className="h-4.5 w-4.5 text-slate-700" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500">Item</p>
                <p className="truncate text-sm font-semibold text-slate-900 max-w-[200px] sm:max-w-[260px]">
                  {data.title}
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReport(true)}
              className="text-gray-400 hover:text-red-600"
            >
              <Flag className="h-4.5 w-4.5" />
            </Button>

            <ReportTransacDialog
              open={showReport}
              onOpenChange={setShowReport}
              selectedReportReason={selectedReportReason}
              setSelectedReportReason={setSelectedReportReason}
              onSubmit={reportSubmit}
            />
          </div>

          {/* PRICE BOXES */}
          <div className="grid grid-cols-2 gap-3 mb-4">
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

          {/* DETAILS */}
          <div className="space-y-3 text-sm text-slate-700">
            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2">
              <Tag>{data.type}</Tag>
              <span className="inline-flex items-center text-xs px-3 py-1 rounded-full border bg-gray-50 text-gray-700">
                {data.method}
              </span>
              <span className="inline-flex items-center text-xs px-3 py-1 rounded-full border bg-gray-50 text-gray-700">
                {data.payment_method}
              </span>
            </div>

            {/* Date */}
            {created && (
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="h-4 w-4" />
                <span>{created}</span>
              </div>
            )}

            {/* Address */}
            {data.address && (
              <div className="flex items-start gap-2 text-slate-600">
                <MapPin className="mt-0.5 h-4 w-4 flex-none" />
                <span className="break-words">{data.address}</span>
              </div>
            )}

            {/* Buyer / Seller */}
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
