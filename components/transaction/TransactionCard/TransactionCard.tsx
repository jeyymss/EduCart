"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import PostTypeBadge from "@/components/postTypeBadge";
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
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import LeaveReviewDialog from "../LeaveReviewDialog";

export type TxMethod = "Meetup" | "Delivery";
export type TxSide = "Purchases" | "Sales";
export type TxStatus =
  | "active"
  | "completed"
  | "cancelled"
  | "Accepted"
  | "Completed"
  | "Cancelled"
  | "Pending"
  | "Processing"
  | "Paid"
  | "PickedUp";

export type TransactionCardProps = {
  id: string; // transaction_records.id (for viewing)
  transactionId: string; // transactions.id (for updates)
  type: TxSide;
  method: TxMethod;
  title: string;
  price: number;
  total?: number;
  image?: string;
  onView: (id: string) => void;
  onPrimary?: (id: string) => void;
  primaryLabel?: string;
  // 👇 REAL DB STATUS (Paid, PickedUp, Completed, etc.)
  status?: TxStatus | string;
  postType?: string;
};

function computeActionLabel(type: TxSide, status?: string): string {
  if (!status) return "";

  const s = status.toLowerCase();

  // BUYER VIEW
  if (type === "Purchases") {
    if (s === "paid") return "Waiting for Delivery";
    if (s === "pickedup") return "Order Received";
    if (s === "completed") return "Completed";
    if (s === "cancelled") return "Cancelled";
    return "";
  }

  // SELLER VIEW
  if (type === "Sales") {
    if (s === "paid") return "Order Picked Up";
    if (s === "pickedup") return "On Hold";
    if (s === "completed") return "Completed";
    if (s === "cancelled") return "Cancelled";
    return "";
  }

  return "";
}

export default function TransactionCard({
  id,
  transactionId,
  type,
  method,
  title,
  price,
  total,
  onView,
  onPrimary,
  primaryLabel,
  status = "active",
  postType,
}: TransactionCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [openBuyerReceived, setOpenBuyerReceived] = useState(false);
  const [openSellerPickedUp, setOpenSellerPickedUp] = useState(false);
  const [openReview, setOpenReview] = useState(false);
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [buyerId, setBuyerId] = useState<string | null>(null);

  const supabase = createClient();

  const badgeText = postType ?? (type === "Sales" ? "Sale" : "Buy");
  const action = primaryLabel ?? computeActionLabel(type, status?.toString());
  const isTerminal =
    status?.toString().toLowerCase() === "cancelled" ||
    status?.toString().toLowerCase() === "completed";

  // Fetch buyer/seller for review dialog
  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("buyer_id, seller_id")
        .eq("id", transactionId)
        .single();

      if (error) {
        console.warn("User fetch failed:", error);
        return;
      }
      setBuyerId(data?.buyer_id ?? null);
      setSellerId(data?.seller_id ?? null);
    };

    if (transactionId) fetchUsers();
  }, [transactionId, supabase]);

  // SELLER: mark as PickedUp
  const handleSellerPickedUp = async () => {
    try {
      setIsUpdating(true);
      const loadingToast = toast.loading("Updating transaction...");

      const { error } = await supabase
        .from("transactions")
        .update({ status: "PickedUp" })
        .eq("id", transactionId);

      if (error) throw error;

      toast.success("✅ Order marked as picked up.");
      toast.dismiss(loadingToast);
      onPrimary?.(transactionId);
    } catch (err) {
      console.error("Error updating transaction (PickedUp):", err);
      toast.error("❌ Failed to update transaction.");
    } finally {
      setIsUpdating(false);
      setOpenSellerPickedUp(false);
    }
  };

  // BUYER: mark as Completed
  const handleBuyerReceived = async () => {
    try {
      setIsUpdating(true);
      const loadingToast = toast.loading("Updating transaction...");

      const { error } = await supabase
        .from("transactions")
        .update({ status: "Completed" })
        .eq("id", transactionId);

      if (error) throw error;

      toast.success("✅ Transaction marked as completed!");
      toast.dismiss(loadingToast);

      // Open review dialog
      setTimeout(() => setOpenReview(true), 300);
      onPrimary?.(transactionId);
    } catch (err) {
      console.error("Error updating transaction (Completed):", err);
      toast.error("❌ Failed to update transaction.");
    } finally {
      setIsUpdating(false);
      setOpenBuyerReceived(false);
    }
  };

  // Decide which kind of button to show
  const renderActionButton = () => {
    if (!onPrimary || !action) return null;

    // Disabled states
    if (
      action === "Waiting for Delivery" ||
      action === "On Hold" ||
      action === "Completed" ||
      action === "Cancelled"
    ) {
      const baseColor =
        action === "Completed"
          ? "bg-green-600"
          : action === "Cancelled"
          ? "bg-red-600"
          : "bg-gray-400";

      return (
        <Button
          size="sm"
          className={`rounded-full text-xs px-5 h-8 text-white ${baseColor}`}
          disabled
        >
          {action}
        </Button>
      );
    }

    // BUYER: Order Received
    if (action === "Order Received" && type === "Purchases") {
      return (
        <AlertDialog
          open={openBuyerReceived}
          onOpenChange={setOpenBuyerReceived}
        >
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              className="rounded-full text-xs px-5 h-8 text-white bg-slate-900 hover:bg-slate-800 hover:cursor-pointer"
              disabled={isUpdating}
            >
              {isUpdating ? "Processing..." : action}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Receipt</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you’ve received the item? Once confirmed, the
                transaction will be marked as completed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="hover:cursor-pointer">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleBuyerReceived}
                className="hover:cursor-pointer"
                disabled={isUpdating}
              >
                {isUpdating ? "Updating..." : "Yes, Received"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    }

    // SELLER: Order Picked Up
    if (action === "Order Picked Up" && type === "Sales") {
      return (
        <AlertDialog
          open={openSellerPickedUp}
          onOpenChange={setOpenSellerPickedUp}
        >
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              className="rounded-full text-xs px-5 h-8 text-white bg-slate-900 hover:bg-slate-800 hover:cursor-pointer"
              disabled={isUpdating}
            >
              {isUpdating ? "Processing..." : action}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Mark as Picked Up</AlertDialogTitle>
              <AlertDialogDescription>
                Confirm that the courier or buyer has picked up the order. The
                status will change to <strong>PickedUp</strong>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="hover:cursor-pointer">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleSellerPickedUp}
                className="hover:cursor-pointer"
                disabled={isUpdating}
              >
                {isUpdating ? "Updating..." : "Yes, Picked Up"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    }

    // Fallback (should rarely be used)
    return (
      <Button
        size="sm"
        className="rounded-full text-xs px-5 h-8 text-white bg-slate-900 hover:bg-slate-800 hover:cursor-pointer"
        disabled={isUpdating}
      >
        {isUpdating ? "Processing..." : action}
      </Button>
    );
  };

  return (
    <>
      <tr
        className={`hover:bg-gray-50 transition-colors cursor-pointer ${
          isTerminal ? "opacity-80" : ""
        }`}
        onClick={() => onView(id)}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onView(id);
        }}
      >
        {/* Name */}
        <td className="px-6 py-4 font-medium text-gray-900">{title}</td>

        {/* Total Price */}
        <td className="px-6 py-4 font-semibold text-[#E59E2C] whitespace-nowrap">
          ₱{Number(total ?? price ?? 0).toLocaleString()}
        </td>

        {/* Listing Type */}
        <td className="px-6 py-4">
          <PostTypeBadge type={badgeText as any} className="shadow-sm" />
        </td>

        {/* Transaction Type */}
        <td className="px-6 py-4">
          <span className="inline-flex items-center text-xs px-3 py-1 rounded-full border bg-gray-50 text-gray-700">
            {method}
          </span>
        </td>

        {/* Action Button */}
        <td
          className="px-6 py-4 text-right"
          onClick={(e) => e.stopPropagation()}
        >
          {renderActionButton()}
        </td>
      </tr>

      {openReview && sellerId && buyerId && (
        <LeaveReviewDialog
          open={openReview}
          onOpenChange={setOpenReview}
          transactionId={transactionId}
          sellerId={sellerId}
          buyerId={buyerId}
        />
      )}
    </>
  );
}
