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

type GiveawayActionsProps = {
  action: string;                // UI label: “Mark as Picked Up”, “Mark as Delivered”, “Mark as Received”
  transactionId: string;
  onPrimary?: (id: string) => void;
};

export default function GiveawayActions({
  action,
  transactionId,
  onPrimary,
}: GiveawayActionsProps) {
  const [open, setOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Disabled / final statuses
  const disabledStates = ["Completed", "Cancelled", "Waiting for Pickup", "Waiting for Buyer"];

  if (disabledStates.includes(action)) {
    return (
      <Button
        size="sm"
        className="rounded-full text-xs px-5 h-8 bg-gray-400 text-white"
        disabled
      >
        {action}
      </Button>
    );
  }

  // ----- API CALL HANDLER -----
  const updateGiveawayStatus = async (
    endpoint: "pickedup" | "delivered" | "received",
    successMsg: string
    ) => {
    try {
        setIsUpdating(true);
        const loading = toast.loading("Updating...");

        const res = await fetch(`/api/status-update/giveaway/${endpoint}`, {
        method: "POST",
        body: JSON.stringify({ transactionId }),
        });

        toast.dismiss(loading);

        if (!res.ok) throw new Error("Failed to update.");

        toast.success(successMsg);
        onPrimary?.(transactionId);
    } catch (err) {
        toast.error("Failed to update giveaway status.");
    } finally {
        setIsUpdating(false);
        setOpen(false);
    }
    };


  // ----- Map UI Action → API endpoint -----
  const handleAction = () => {
    if (action === "Mark as Picked Up")
      return updateGiveawayStatus("pickedup", "Marked as picked up.");

    if (action === "Mark as Delivered")
      return updateGiveawayStatus("delivered", "Item marked as delivered.");

    if (action === "Mark as Received")
      return updateGiveawayStatus("received", "Giveaway completed!");
  };

  // ----- UI Component -----
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
            {action === "Mark as Picked Up" &&
              "Confirm that the item has been picked up by the receiver."}

            {action === "Mark as Delivered" &&
              "Confirm that the item has been shipped/delivered to the receiver."}

            {action === "Mark as Received" &&
              "Confirm that you have received the giveaway item."}
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
