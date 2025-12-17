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
import { createClient } from "@/utils/supabase/client";
import { useEffect } from "react";


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
    delivery_fee?: number | null;
    service_fee?: number | null;
    items_total?: number | null;
    cash_added?: number | null;
    rent_days?: number | null;
    rent_start_date?: string | null;
    rent_end_date?: string | null;
    pasabuy_items?: any[] | null;
    payment_method: string;
    method: string;
    type: string;
    post_type?: string;
    status: string;
    created_at?: string;
    post_id: string;
    buyer?: string;
    buyer_id: string;
    seller?: string;
    seller_id: string;
    address?: string;
    pickup_location?: string | null;   
    delivery_location?: string | null; 
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
  const supabase = createClient();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id ?? null);
    });
  }, []);

  const isSeller = currentUserId === data?.seller_id;

  if (!data) return null;

  const created =
    data.created_at ? new Date(data.created_at).toLocaleString() : null;

  const statusTone =
    data.status?.toLowerCase() === "active"
      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
      : data.status?.toLowerCase() === "pending"
      ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
      : "bg-slate-100 text-slate-700 ring-1 ring-slate-200";

  // Calculate rent days if not provided
  const rentDays =
    data.post_type === "Rent" && data.rent_start_date && data.rent_end_date
      ? data.rent_days ||
        Math.max(
          1,
          Math.ceil(
            (new Date(data.rent_end_date).getTime() -
              new Date(data.rent_start_date).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : data.rent_days;

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

  console.log("LOCATIONS", {
  method: data.method,
  pickup: data.pickup_location,
  dropoff: data.delivery_location,
});

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

          {/* PASABUY: Selected Items */}
          {data.post_type === "PasaBuy" && data.pasabuy_items && Array.isArray(data.pasabuy_items) && data.pasabuy_items.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-lg p-3 space-y-2 mb-4">
              <p className="text-xs text-gray-500 font-medium">SELECTED ITEMS</p>
              <div className="space-y-1.5">
                {data.pasabuy_items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-700">{item.product_name || item.name}</span>
                    <span className="font-medium text-amber-600">{peso(item.price)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PASABUY: Price Breakdown */}
          {data.post_type === "PasaBuy" && (
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-3 space-y-2 mb-4">
              <p className="text-xs text-amber-700 font-medium">PRICE BREAKDOWN</p>

              {data.items_total != null && data.items_total !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Items Total</span>
                  <span className="font-medium">{peso(data.items_total)}</span>
                </div>
              )}

              {data.service_fee != null && data.service_fee !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Service Fee</span>
                  <span className="font-medium">{peso(data.service_fee)}</span>
                </div>
              )}

              {data.delivery_fee != null && data.method === "Delivery" && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Delivery Fee</span>
                  <span className="font-medium">{peso(data.delivery_fee)}</span>
                </div>
              )}

              <div className="border-t border-amber-300 pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <p className="text-base font-bold text-gray-800">Total</p>
                  <p className="text-lg font-bold text-amber-700">
                    {peso(data.total)}
                  </p>
                </div>
              </div>

              {data.method === "Meetup" && (
                <p className="text-xs text-gray-600 mt-1 italic">
                  Meetup Transaction — No delivery fees
                </p>
              )}
            </div>
          )}

          {/* RENT: Price Breakdown */}
          {data.post_type === "Rent" && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 space-y-2 mb-4">
              <p className="text-xs text-blue-700 font-medium">RENT BREAKDOWN</p>

              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Price per Day</span>
                <span className="font-semibold text-[#E59E2C]">
                  {peso(data.price)}
                  <span className="text-xs"> /day</span>
                </span>
              </div>

              {rentDays != null && rentDays > 0 && (
                <>
                  {data.rent_start_date && data.rent_end_date && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Rent Duration</span>
                      <span className="font-medium text-gray-900">
                        {new Date(data.rent_start_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        →{" "}
                        {new Date(data.rent_end_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                        <span className="text-xs text-gray-500"> ({rentDays} {rentDays === 1 ? "day" : "days"})</span>
                      </span>
                    </div>
                  )}

                  {(!data.rent_start_date || !data.rent_end_date) && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Number of Days</span>
                      <span className="font-medium">{rentDays} {rentDays === 1 ? 'day' : 'days'}</span>
                    </div>
                  )}

                  <div className="border-t border-blue-300 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-semibold text-gray-700">Total Payment</p>
                      <p className="text-lg font-bold text-blue-700">
                        {peso(data.price * rentDays)}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TRADE: Price Breakdown */}
          {data.post_type === "Trade" && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3 space-y-2 mb-4">
              <p className="text-xs text-purple-700 font-medium">TRADE BREAKDOWN</p>

              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Item Value</span>
                <span className="font-medium">{peso(data.price)}</span>
              </div>

              {data.cash_added != null && data.cash_added > 0 && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Cash Top-up</span>
                    <span className="font-medium text-amber-600">{peso(data.cash_added)}</span>
                  </div>

                  <div className="border-t border-purple-300 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <p className="text-base font-bold text-gray-800">Total to Pay</p>
                      <p className="text-lg font-bold text-purple-700">
                        {peso(data.total)}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {(!data.cash_added || data.cash_added === 0) && (
                <p className="text-xs text-gray-600 italic">
                  No additional cash required
                </p>
              )}
            </div>
          )}

          {/* SALE/EMERGENCY/GIVEAWAY: Price Breakdown */}
          {(data.post_type === "Sale" || data.post_type === "Emergency Lending" || data.post_type === "Giveaway") && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 space-y-2 mb-4">
              <p className="text-xs text-green-700 font-medium">PRICE BREAKDOWN</p>

              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Item Price</span>
                <span className="font-medium">{peso(data.price)}</span>
              </div>

              {data.delivery_fee != null && data.delivery_fee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Delivery Fee</span>
                  <span className="font-medium">{peso(data.delivery_fee)}</span>
                </div>
              )}

              <div className="border-t border-green-300 pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <p className="text-base font-bold text-gray-800">Total</p>
                  <p className="text-lg font-bold text-green-700">
                    {peso(data.total)}
                  </p>
                </div>
              </div>

              {data.delivery_fee != null && data.delivery_fee > 0 && (
                <p className="text-xs text-gray-600 mt-1">
                  Includes delivery fee
                </p>
              )}

              {data.method === "Meetup" && (
                <p className="text-xs text-gray-600 mt-1 italic">
                  Meetup Transaction — No delivery fees
                </p>
              )}
            </div>
          )}

          {/* Payment Method Badge */}
          <div className="bg-white border border-gray-100 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Payment Method</span>
              <span className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
                {data.payment_method}
              </span>
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
            </div>

            {/* Date */}
            {created && (
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="h-4 w-4" />
                <span>{created}</span>
              </div>
            )}

            {/* LOCATION DETAILS */}
              {data.method === "Delivery" && isSeller &&  (
                <div className="space-y-2">
                  {/* PICKUP LOCATION (SELLER) */}
                  {data.pickup_location && (
                    <div className="flex items-start gap-2 text-slate-600">
                      <MapPin className="mt-0.5 h-4 w-4 text-blue-600 flex-none" />
                      <span className="break-words">
                        <span className="font-medium text-slate-700">
                          Pickup Location:
                        </span>{" "}
                        {data.pickup_location}
                      </span>
                    </div>
                  )}

                  {/* DROP-OFF LOCATION (BUYER) */}
                  {data.delivery_location && (
                    <div className="flex items-start gap-2 text-slate-600">
                      <MapPin className="mt-0.5 h-4 w-4 text-emerald-600 flex-none" />
                      <span className="break-words">
                        <span className="font-medium text-slate-700">
                          Drop-off Location:
                        </span>{" "}
                        {data.delivery_location}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* MEETUP */}
              {data.method === "Meetup" && data.address && (
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
