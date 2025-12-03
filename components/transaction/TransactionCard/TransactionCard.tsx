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
import { computeSaleActionLabel } from "../actions/saleAction";
import { computeRentActionLabel } from "../actions/rentAction";

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
  status?: TxStatus | string;
  postType?: string;
};

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

  // 🟡 NEW — UNIVERSAL ACTION LABEL RESOLVER
  function resolveActionButtonLabel() {
    const clean = postType?.toLowerCase();

    if (clean === "sale") return computeSaleActionLabel(type, status);
    if (clean === "rent") return computeRentActionLabel(type, status);

    // ★ later you will insert:
    // if (clean === "rent") return computeRentLabel(...)
    // if (clean === "trade") return computeTradeLabel(...)
    // if (clean === "pasabuy") return computePasabuyLabel(...)

    return "";
  }

  const action = primaryLabel ?? resolveActionButtonLabel();

  const isTerminal =
    status?.toString().toLowerCase() === "cancelled" ||
    status?.toString().toLowerCase() === "completed";

  // Load buyer/seller for review dialog
  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("buyer_id, seller_id")
        .eq("id", transactionId)
        .single();

      if (!error) {
        setBuyerId(data?.buyer_id ?? null);
        setSellerId(data?.seller_id ?? null);
      }
    };

    if (transactionId) fetchUsers();
  }, [transactionId, supabase]);

  // SELLER — mark as PickedUp
  const handleSellerPickedUp = async () => {
    try {
      setIsUpdating(true);
      const loading = toast.loading("Updating transaction...");

      const { error } = await supabase
        .from("transactions")
        .update({ status: "PickedUp" })
        .eq("id", transactionId);

      if (error) throw error;

      toast.success("Order marked as picked up.");
      toast.dismiss(loading);
      onPrimary?.(transactionId);
    } catch {
      toast.error("Failed to update transaction.");
    } finally {
      setIsUpdating(false);
      setOpenSellerPickedUp(false);
    }
  };

  // BUYER — mark as Completed
  const handleBuyerReceived = async () => {
    try {
      setIsUpdating(true);
      const loading = toast.loading("Updating transaction...");

      const { error } = await supabase
        .from("transactions")
        .update({ status: "Completed" })
        .eq("id", transactionId);

      if (error) throw error;

      toast.success("Transaction completed.");
      toast.dismiss(loading);

      // open review
      setTimeout(() => setOpenReview(true), 300);
      onPrimary?.(transactionId);
    } catch {
      toast.error("Failed to update transaction.");
    } finally {
      setIsUpdating(false);
      setOpenBuyerReceived(false);
    }
  };

  // 🟡 MAIN BUTTON HANDLER
  const renderActionButton = () => {
    if (!onPrimary || !action) return null;

    // disabled states
    if (
      action === "Waiting for Delivery" ||
      action === "On Hold" ||
      action === "Completed" ||
      action === "Cancelled"
    ) {
      const color =
        action === "Completed"
          ? "bg-green-600"
          : action === "Cancelled"
          ? "bg-red-600"
          : "bg-gray-400";

      return (
        <Button
          size="sm"
          className={`rounded-full text-xs px-5 h-8 text-white ${color}`}
          disabled
        >
          {action}
        </Button>
      );
    }

    // BUYER — Order Received
    if (action === "Order Received" && type === "Purchases") {
      return (
        <AlertDialog
          open={openBuyerReceived}
          onOpenChange={setOpenBuyerReceived}
        >
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              className="rounded-full text-xs px-5 h-8 text-white bg-slate-900 hover:bg-slate-800"
              disabled={isUpdating}
            >
              {isUpdating ? "Processing..." : action}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Receipt</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you received the item? This will complete the
                transaction.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleBuyerReceived}
                disabled={isUpdating}
              >
                {isUpdating ? "Updating..." : "Yes, Received"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    }

    // SELLER — Order Picked Up
    if (action === "Order Picked Up" && type === "Sales") {
      return (
        <AlertDialog
          open={openSellerPickedUp}
          onOpenChange={setOpenSellerPickedUp}
        >
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              className="rounded-full text-xs px-5 h-8 text-white bg-slate-900 hover:bg-slate-800"
              disabled={isUpdating}
            >
              {isUpdating ? "Processing..." : action}
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Mark as Picked Up</AlertDialogTitle>
              <AlertDialogDescription>
                Confirm that the courier/buyer has picked up the order.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleSellerPickedUp}
                disabled={isUpdating}
              >
                {isUpdating ? "Updating..." : "Yes, Picked Up"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    }

    // fallback
    return (
      <Button
        size="sm"
        className="rounded-full text-xs px-5 h-8 text-white bg-slate-900 hover:bg-slate-800"
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
      >
        <td className="px-6 py-4 font-medium text-gray-900">{title}</td>

        <td className="px-6 py-4 font-semibold text-[#E59E2C] whitespace-nowrap">
          ₱{Number(total ?? price ?? 0).toLocaleString()}
        </td>

        <td className="px-6 py-4">
          <PostTypeBadge type={badgeText as any} className="shadow-sm" />
        </td>

        <td className="px-6 py-4">
          <span className="inline-flex items-center text-xs px-3 py-1 rounded-full border bg-gray-50 text-gray-700">
            {method}
          </span>
        </td>

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
