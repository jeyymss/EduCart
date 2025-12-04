"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { toast } from "sonner";

type TradeActionsProps = {
  action: string;
  transactionId: string;
  type: "Purchases" | "Sales";
  onPrimary?: (id: string) => void;
  paymentMethod?: string;
};

export default function TradeActions({
  action,
  transactionId,
  type,
  onPrimary,
}: TradeActionsProps) {
  const [open, setOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // ================================
  // STATUS UPDATE REQUEST
  // ================================
  const updateTradeStatus = async (newStatus: string, successMsg: string) => {
    try {
      setIsUpdating(true);
      const loading = toast.loading("Updating transaction...");

      const res = await fetch("/api/status-update/trade", {
        method: "POST",
        body: JSON.stringify({ transactionId, newStatus }),
      });

      toast.dismiss(loading);

      if (!res.ok) throw new Error();

      toast.success(successMsg);
      onPrimary?.(transactionId);
    } catch (e) {
      toast.error("Failed to update transaction.");
    } finally {
      setIsUpdating(false);
      setOpen(false);
    }
  };

  // ================================
  // ACTION HANDLER LOGIC
  // ================================
  const handleAction = () => {
    // Buyer (Online Payment) – Pay Now
    if (action === "Pay Now")
      return updateTradeStatus("Paid", "Payment confirmed.");

    // Buyer (Cash on Hand or Online Payment) – Item Received
    if (action === "Item Received")
      return updateTradeStatus("Received", "Item marked as received.");

    // Buyer – Confirm Exchange (final step after Pickup)
    if (action === "Confirm Exchange")
      return updateTradeStatus("Completed", "Trade completed.");

    // Seller – Confirm Item Received
    if (action === "Confirm Item Received")
      return updateTradeStatus("Completed", "Trade completed.");

    // Seller – Mark as Exchanged
    if (action === "Mark as Exchanged")
      return updateTradeStatus("PickedUp", "Exchange marked as completed.");
  };

  // ================================
  // DISABLED STATES
  // ================================
  const disabledStates = [
    "Waiting for Buyer",
    "Waiting for Confirmation",
    "Waiting for Payment",
    "On Hold",
    "Completed",
    "Cancelled",
  ];

  if (disabledStates.includes(action)) {
    return (
      <Button
        size="sm"
        className="rounded-full text-xs px-5 h-8 bg-gray-400"
        disabled
      >
        {action}
      </Button>
    );
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          size="sm"
          className="rounded-full text-xs px-5 h-8 text-white bg-slate-900"
          disabled={isUpdating}
        >
          {isUpdating ? "Processing..." : action}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{action}</AlertDialogTitle>
          <AlertDialogDescription>
            {action === "Pay Now" &&
              "Proceed to pay the additional top-up amount."}

            {action === "Item Received" &&
              "Confirm that you have received the item from the seller."}

            {action === "Confirm Exchange" &&
              "Confirm that the exchange has been completed."}

            {action === "Confirm Item Received" &&
              "Confirm that you have received the buyer’s item."}

            {action === "Mark as Exchanged" &&
              "Mark the trade as exchanged. This indicates both parties have exchanged items."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleAction} disabled={isUpdating}>
            {isUpdating ? "Updating..." : "Confirm"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
