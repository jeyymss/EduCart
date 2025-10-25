"use client";

import { useState } from "react";
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
import { AddDeliveryDialog } from "@/components/transaction/AddDelivery";

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
  | "Processing";

export type TransactionCardProps = {
  id: string;
  type: TxSide; // "Purchases" | "Sales"
  method: TxMethod; // "Meetup" | "Delivery"
  title: string;
  price: number;
  total?: number;
  image?: string;
  onView: (id: string) => void;
  onPrimary?: (id: string) => void;
  primaryLabel?: string;
  status?: TxStatus;
  postType?: string;
};

// 🧠 Dynamic action label logic
function computeActionLabel(type: TxSide, status?: TxStatus): string {
  if (!status) return type === "Purchases" ? "Received" : "Add Delivery";

  switch (status) {
    case "Cancelled":
    case "cancelled":
      return "Cancelled";
    case "Completed":
    case "completed":
      return "Completed";
    case "Accepted":
      return type === "Purchases" ? "Received" : "Add Delivery";
    default:
      return type === "Purchases" ? "Received" : "Add Delivery";
  }
}

export default function TransactionCard({
  id,
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
  const [openReceived, setOpenReceived] = useState(false);
  const [openDelivery, setOpenDelivery] = useState(false);

  const badgeText = postType ?? (type === "Sales" ? "Sale" : "Buy");
  const action = primaryLabel ?? computeActionLabel(type, status);
  const isCancelled =
    status?.toLowerCase?.() === "cancelled" ||
    status?.toLowerCase?.() === "completed";

  const handleConfirmReceived = () => {
    setOpenReceived(false);
    if (onPrimary) onPrimary(id);
  };

  return (
    <>
      {/* 🚚 AddDeliveryDialog */}
      {action === "Add Delivery" && (
        <AddDeliveryDialog
          open={openDelivery}
          onOpenChange={setOpenDelivery}
          transactionId={id}
        />
      )}

      <tr
        className={`hover:bg-gray-50 transition-colors cursor-pointer ${
          isCancelled ? "opacity-80" : ""
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
          ₱{(total ?? price).toLocaleString()}
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
        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
          {onPrimary && (
            <>
              {action === "Received" ? (
                <AlertDialog open={openReceived} onOpenChange={setOpenReceived}>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      className="rounded-full text-xs px-5 h-8 text-white bg-slate-900 hover:bg-slate-800 hover:cursor-pointer"
                    >
                      {action}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Receipt</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you&apos;ve received the item? Once confirmed,
                        the transaction will be marked as completed.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="hover:cursor-pointer">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleConfirmReceived}
                        className="hover:cursor-pointer"
                      >
                        Yes, Received
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : action === "Add Delivery" ? (
                <Button
                  size="sm"
                  className="rounded-full text-xs px-5 h-8 text-white bg-slate-900 hover:bg-slate-800 hover:cursor-pointer"
                  onClick={() => setOpenDelivery(true)}
                >
                  {action}
                </Button>
              ) : (
                <Button
                  size="sm"
                  className={`rounded-full text-xs px-5 h-8 text-white ${
                    action === "Cancelled"
                      ? "bg-red-600"
                      : action === "Completed"
                      ? "bg-green-600"
                      : "bg-slate-900 hover:bg-slate-800"
                  }`}
                  disabled={action === "Cancelled" || action === "Completed"}
                >
                  {action}
                </Button>
              )}
            </>
          )}
        </td>
      </tr>
    </>
  );
}
