"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function GiveawayActions({
  action,
  transactionId,
  onPrimary,
}: {
  action: string;
  transactionId: string;
  onPrimary?: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (
    !action ||
    action === "Completed" ||
    action === "Cancelled"
  ) {
    return <Button disabled size="sm">{action || "Completed"}</Button>;
  }

  const nextStatus =
    {
      "Item PickedUp": "PickedUp",
      Shipped: "Shipped",
      Received: "Completed",
    }[action] || null;

  const handleUpdate = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/status-update/giveaway", {
        method: "POST",
        body: JSON.stringify({
          transactionId,
          status: nextStatus,
        }),
      });

      if (!res.ok) throw new Error();

      toast.success("Status updated.");
      onPrimary?.(transactionId);
    } catch {
      toast.error("Failed to update giveaway status.");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button size="sm">{action}</Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogDescription>
            Confirm action: <strong>{action}</strong>?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleUpdate} disabled={loading}>
            {loading ? "Updating..." : "Confirm"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
