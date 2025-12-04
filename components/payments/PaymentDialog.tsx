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

  postType: string;

  itemTitle?: string;
  txnPrice?: number | string | null;

  // SALE
  distanceKm: number | null;
  deliveryFee?: number | null;

  // RENT
  rentDays?: number | null;

  cash_added: number | null;

  totalPayment: number | null;

  fulfillmentMethod: string; // "Delivery" | "Meetup"

  paymentMethod: string;
  setPaymentMethod: (value: string) => void;

  balance: number;
  insufficientBalance: boolean;
  isPaying: boolean;

  handleWalletPayment: () => void;
  handleGCashPayment: () => void;

  successMsg: string;
}

export default function PaymentDialog({
  open,
  onOpenChange,
  postType,
  itemTitle,
  txnPrice,
  distanceKm,
  deliveryFee,
  rentDays,
  cash_added,
  totalPayment,
  fulfillmentMethod,
  paymentMethod,
  setPaymentMethod,
  balance,
  insufficientBalance,
  isPaying,
  handleWalletPayment,
  handleGCashPayment,
  successMsg,
}: PaymentDialogProps) {
  const formatCurrency = (v?: number | string | null) =>
    v != null ? `₱${Number(v).toLocaleString()}` : "—";

  const isRent = postType === "Rent";
  const isSale = postType === "Sale";
  const isTrade = postType === "Trade";

  const isDelivery =
    fulfillmentMethod === "Delivery" && !isTrade; 

  const isMeetup =
    fulfillmentMethod === "Meetup" || isTrade; 


  if (postType === "Trade") {
    totalPayment = cash_added ?? 0;
  }

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
        <button
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 transition"
          onClick={() => onOpenChange(false)}
        >
          <X className="w-5 h-5" />
        </button>

        <DialogHeader>
          <DialogTitle className="text-[#102E4A]">Online Payment</DialogTitle>
          <DialogDescription>
            Review fees and choose a payment method.
          </DialogDescription>
        </DialogHeader>

        {/* PAYMENT SUMMARY */}
        <div className="p-4 border rounded-lg bg-gray-50 space-y-3">
          <p className="font-semibold text-lg">{itemTitle}</p>

          {/* Price */}
          <div className="flex justify-between text-sm">
            <span>{isRent ? "Price per Day" : isTrade ? "Trade Value" : "Item Price"}</span>
            <span>{formatCurrency(txnPrice)}</span>
          </div>

          {/* RENT: Duration */}
          {isRent && (
            <div className="flex justify-between text-sm">
              <span>Duration of Rent</span>
              <span>{rentDays} day(s)</span>
            </div>
          )}

          {/* SALE: Delivery Fee & Distance */}
          {isSale && isDelivery && !isTrade && (
            <>
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
                  {distanceKm !== null
                    ? `${Number(distanceKm).toFixed(2)} km`
                    : "Computing..."}
                </span>
              </div>
            </>
          )}

          {/* SALE: MEETUP — No delivery fee or distance */}
          {isSale && isMeetup && (
            <div className="text-sm text-gray-600 italic">
              Meetup Transaction — No delivery fees.
            </div>
          )}


          {/* Total */}
          <hr />
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>

              <span className="text-blue-900">
                {isTrade
                  ? formatCurrency(totalPayment)    
                  : isSale && isMeetup
                    ? formatCurrency(txnPrice)
                    : totalPayment !== null
                      ? formatCurrency(totalPayment)
                      : "—"}
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

          <Button
            className="w-full mt-4"
            disabled={isPaying}
            onClick={() => {
              if (paymentMethod === "wallet") handleWalletPayment();
              else if (paymentMethod === "gcash") handleGCashPayment();
            
            console.log("totalPayment:", totalPayment);
            }}
          >
            {isPaying ? "Processing..." : "Continue Payment"}
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
