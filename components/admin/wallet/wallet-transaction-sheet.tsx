"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  User,
  Tag,
  Wallet,
  Truck,
  Receipt,
  CreditCard,
} from "lucide-react";

type WalletTransactionSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tx: any | null;
};

export default function WalletTransactionSheet({
  open,
  onOpenChange,
  tx,
}: WalletTransactionSheetProps) {
  if (!tx) return null;

  const t = tx.transactions;

  // Buyer/Seller Data
  const buyer = t?.buyer;
  const seller = t?.seller;

  // Price Fields
  const itemPrice = t?.price ?? 0;
  const deliveryFee = t?.delivery_fee ?? 0;

  // Commission from platform_wallet_transactions
  const commission = tx.amount ?? 0;

  // New Total Calculation
  const total = itemPrice + deliveryFee - commission;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[450px] sm:w-[500px] p-6 overflow-y-auto"
      >
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl font-semibold">
            Transaction Details
          </SheetTitle>
        </SheetHeader>

        {/* Reference Code */}
        <div className="p-4 rounded-xl border bg-gray-50 mb-6">
          <p className="text-sm text-gray-500">Reference Code</p>
          <p className="text-lg font-semibold text-gray-900">
            {t?.reference_code ?? "—"}
          </p>
        </div>

        {/* Buyer & Seller Cards */}
        <div className="grid grid-cols-1 gap-4 mb-6">
          {/* Buyer */}
          <div className="p-4 rounded-xl border bg-white flex items-center gap-4">
            <Avatar>
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs text-gray-500">Buyer</p>
              <p className="font-semibold text-gray-800">
                {buyer?.name ?? "—"}
              </p>
              <p className="text-xs text-gray-500">{buyer?.email ?? ""}</p>
            </div>
          </div>

          {/* Seller */}
          <div className="p-4 rounded-xl border bg-white flex items-center gap-4">
            <Avatar>
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs text-gray-500">Seller</p>
              <p className="font-semibold text-gray-800">
                {seller?.name ?? "—"}
              </p>
              <p className="text-xs text-gray-500">{seller?.email ?? ""}</p>
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="rounded-xl border bg-white p-5 space-y-4">
          {/* Item Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-gray-400" />
              <p className="text-gray-600">Item Price</p>
            </div>
            <p className="font-semibold text-gray-800">
              ₱{itemPrice.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Delivery Fee */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-gray-400" />
              <p className="text-gray-600">Delivery Fee</p>
            </div>
            <p className="font-semibold text-gray-800">
              ₱{deliveryFee.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Commission */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-gray-400" />
              <p className="text-gray-600">Commission Deducted</p>
            </div>
            <p className="font-semibold text-red-600">
              -₱{commission.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
            </p>
          </div>

          <hr />

          {/* TOTAL */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-gray-400" />
              <p className="font-semibold">Total</p>
            </div>
            <p className="text-lg font-bold text-gray-900">
              ₱{total.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Payment Method */}
        <div className="mt-6 p-4 rounded-xl border bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-gray-500" />
            <p className="text-gray-700 font-medium">Payment Method</p>
          </div>

          <p className="font-semibold text-gray-900 capitalize">
            {t?.payment_method ?? "—"}
          </p>
        </div>

        {/* Status */}
        <div className="mt-4 p-4 rounded-xl border bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-gray-500" />
            <p className="text-gray-700 font-medium">Status</p>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              t?.status === "Completed"
                ? "bg-green-100 text-green-700"
                : t?.status === "Cancelled"
                ? "bg-red-100 text-red-700"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {t?.status ?? "—"}
          </span>
        </div>
      </SheetContent>
    </Sheet>
  );
}
