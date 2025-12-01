"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Wallet, X } from "lucide-react";
import Image from "next/image";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  itemTitle?: string;
  txnPrice?: number | string | null;

  distanceKm: number | null;
  deliveryFee: number | null;
  totalPayment: number | null;

  paymentMethod: string;
  setPaymentMethod: (value: string) => void;

  balance: number;
  insufficientBalance: boolean;
  isPaying: boolean;

  handleWalletPayment: () => void;
  successMsg: string;
}

export default function PaymentDialog({
  open,
  onOpenChange,
  itemTitle,
  txnPrice,
  distanceKm,
  deliveryFee,
  totalPayment,
  paymentMethod,
  setPaymentMethod,
  balance,
  insufficientBalance,
  isPaying,
  handleWalletPayment,
  successMsg,
}: PaymentDialogProps) {
  const formatCurrency = (v?: number | string | null) =>
    v != null ? `₱${Number(v).toLocaleString()}` : "—";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          space-y-4 p-4 sm:p-6
          fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
          w-full max-w-[90%] sm:max-w-md
          rounded-lg sm:rounded-xl
        "
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* Close button */}
        <button
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 transition hover:cursor-pointer"
          onClick={() => onOpenChange(false)}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <DialogHeader>
          <DialogTitle className="text-[#102E4A]">Online Payment</DialogTitle>
          <DialogDescription>
            Review fees and choose a payment method.
          </DialogDescription>
        </DialogHeader>

        {/* PAYMENT SUMMARY */}
        <div className="p-4 border rounded-lg bg-gray-50 space-y-3">
          <p className="font-semibold text-lg">{itemTitle}</p>

          <div className="flex justify-between text-sm">
            <span>Item Price</span>
            <span>{formatCurrency(txnPrice)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>Delivery Fee</span>
            <span>
              {deliveryFee !== null
                ? formatCurrency(deliveryFee)
                : "Calculating..."}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span>Distance</span>
            <span>
              {distanceKm !== null ? `${distanceKm.toFixed(2)} km` : "Computing..."}
            </span>
          </div>

          <hr />

          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span className="text-blue-900">
              {totalPayment !== null ? formatCurrency(totalPayment) : "—"}
            </span>
          </div>
        </div>

        {/* PAYMENT METHOD */}
        <div className="space-y-4 p-4 border rounded-xl bg-white">
          <h2 className="text-lg font-semibold">Payment Method</h2>

          <RadioGroup
            value={paymentMethod}
            onValueChange={setPaymentMethod}
            className="space-y-3"
          >
            {/* Wallet */}
            <div
              className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition cursor-pointer"
              onClick={() => setPaymentMethod("wallet")}
            >
              <div className="flex items-center gap-3">
                <Wallet width={28} height={28} />
                <div>
                  <p className="font-medium text-base">Wallet</p>
                  <p className="text-sm text-gray-500">
                    ₱ {balance.toLocaleString()}
                  </p>
                </div>
              </div>

              <RadioGroupItem value="wallet" className="h-5 w-5" />
            </div>

            {/* GCash */}
            <div
              className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition cursor-pointer"
              onClick={() => setPaymentMethod("gcash")}
            >
              <div className="flex items-center gap-3">
                <Image src="/GCASH.png" alt="gcash" width={32} height={32} />
                <p className="font-medium text-base text-blue-600">GCash</p>
              </div>

              <RadioGroupItem value="gcash" className="h-5 w-5" />
            </div>
          </RadioGroup>

          {/* Continue Payment */}
          <Button
            className="w-full mt-4"
            disabled={insufficientBalance || isPaying}
            onClick={handleWalletPayment}
          >
            {isPaying
              ? "Processing..."
              : insufficientBalance
              ? "Insufficient Balance"
              : "Continue Payment"}
          </Button>

          {successMsg && (
            <p className="mt-2 text-center text-sm font-medium text-green-600">
              {successMsg}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
