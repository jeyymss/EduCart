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

interface CreditPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  pkgTitle: string;
  pkgPrice: number;
  pkgCredits: number;

  balance: number;

  paymentMethod: string;
  setPaymentMethod: (value: string) => void;

  onWalletPay: () => void;
  onGCashPay: () => void;

  isProcessing: boolean;
}

export default function CreditPaymentDialog({
  open,
  onOpenChange,
  pkgTitle,
  pkgPrice,
  pkgCredits,
  balance,
  paymentMethod,
  setPaymentMethod,
  onWalletPay,
  onGCashPay,
  isProcessing,
}: CreditPaymentDialogProps) {
  const formatMoney = (v: number) =>
    `₱${v.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

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
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <DialogHeader>
          <DialogTitle className="text-[#102E4A]">Purchase Credits</DialogTitle>
          <DialogDescription>
            Review your package and choose a payment method.
          </DialogDescription>
        </DialogHeader>

        {/* Summary */}
        <div className="p-4 border rounded-lg bg-gray-50 space-y-3">
          <p className="font-semibold text-lg">{pkgTitle}</p>

          <div className="flex justify-between text-sm">
            <span>Credits</span>
            <span>{pkgCredits}</span>
          </div>

          <div className="flex justify-between text-sm font-semibold">
            <span>Total Payment</span>
            <span className="text-blue-700">{formatMoney(pkgPrice)}</span>
          </div>
        </div>

        {/* Payment Method */}
        <div className="space-y-4 p-4 border rounded-xl bg-white">
          <h2 className="text-lg font-semibold">Payment Method</h2>

          <RadioGroup
            value={paymentMethod}
            onValueChange={setPaymentMethod}
            className="space-y-3"
          >
            {/* WALLET OPTION */}
            <div
              className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 cursor-pointer"
              onClick={() => setPaymentMethod("wallet")}
            >
              <div className="flex items-center gap-3">
                <Wallet width={28} height={28} />
                <div>
                  <p className="font-medium">Wallet</p>
                  <p className="text-sm text-gray-500">
                    Balance: {formatMoney(balance)}
                  </p>
                </div>
              </div>

              <RadioGroupItem value="wallet" className="h-5 w-5" />
            </div>

            {/* GCASH OPTION */}
            <div
              className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 cursor-pointer"
              onClick={() => setPaymentMethod("gcash")}
            >
              <div className="flex items-center gap-3">
                <Image src="/GCASH.png" alt="gcash" width={32} height={32} />
                <p className="font-medium text-blue-700">GCash</p>
              </div>

              <RadioGroupItem value="gcash" className="h-5 w-5" />
            </div>
          </RadioGroup>

          {/* Button */}
          <Button
            className="w-full mt-3"
            disabled={isProcessing}
            onClick={() => {
              if (paymentMethod === "wallet") onWalletPay();
              else onGCashPay();
            }}
          >
            {isProcessing ? "Processing..." : "Continue to Pay"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
