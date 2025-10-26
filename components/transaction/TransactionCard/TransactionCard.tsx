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
import { AddDeliveryDialog } from "@/components/transaction/AddDelivery";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { CourierStatusDialog } from "@/components/transaction/CourierStatusDialog";

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
  id: string; // transaction_records.id (for viewing)
  transactionId: string; // ✅ transactions.id (for updates)
  type: TxSide;
  method: TxMethod;
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
  const [openReceived, setOpenReceived] = useState(false);
  const [openDelivery, setOpenDelivery] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [courierId, setCourierId] = useState<number | null>(null); // ✅ new state
  const supabase = createClient();

  const badgeText = postType ?? (type === "Sales" ? "Sale" : "Buy");
  const action = primaryLabel ?? computeActionLabel(type, status);
  const isTerminal =
    status?.toLowerCase?.() === "cancelled" ||
    status?.toLowerCase?.() === "completed";

  // ✅ Fetch courier_id for this transaction
  useEffect(() => {
    const fetchCourier = async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("courier_id")
        .eq("id", transactionId)
        .single();

      if (error) {
        console.warn("Failed to fetch courier_id:", error);
        return;
      }
      setCourierId(data?.courier_id ?? null);
    };

    if (transactionId) fetchCourier();
  }, [transactionId, supabase]);

  const handleConfirmReceived = async () => {
    try {
      setIsUpdating(true);
      const loadingToast = toast.loading("Updating transaction...");

      const { data, error } = await supabase
        .from("transactions")
        .update({ status: "Completed" })
        .eq("id", transactionId)
        .select("*");

      if (error) throw error;
      if (!data?.length) {
        console.warn("No rows updated. Check RLS or wrong transactionId.", {
          transactionId,
        });
      }

      toast.success("✅ Transaction marked as completed!");
      onPrimary?.(transactionId);
      window.location.reload();
    } catch (err) {
      console.error("Error updating transaction:", err);
      toast.error("❌ Failed to update transaction.");
    } finally {
      setIsUpdating(false);
      setOpenReceived(false);
    }
  };

  const isReceivedDisabled = !courierId; // ✅ disable if courier_id is null

  return (
    <>
      {/* 🚚 AddDeliveryDialog uses the real transactionId */}
      {action === "Add Delivery" && (
        <AddDeliveryDialog
          open={openDelivery}
          onOpenChange={setOpenDelivery}
          transactionId={transactionId}
          onUpdated={() => {
          setCourierId(1); // Mock instant refresh — ideally refetch
          onPrimary?.(transactionId);
        }}
        />
      )}

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
          {onPrimary && (
            <>
              {action === "Received" ? (
                <AlertDialog open={openReceived} onOpenChange={setOpenReceived}>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      className={`rounded-full text-xs px-5 h-8 text-white ${
                        isReceivedDisabled
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-slate-900 hover:bg-slate-800 hover:cursor-pointer"
                      }`}
                      disabled={isUpdating || isReceivedDisabled}
                    >
                      {isUpdating
                        ? "Processing..."
                        : isReceivedDisabled
                        ? "Waiting for courier"
                        : action}
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
                        onClick={handleConfirmReceived}
                        className="hover:cursor-pointer"
                        disabled={isUpdating}
                      >
                        {isUpdating ? "Updating..." : "Yes, Received"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : action === "Add Delivery" ? (
                <>
                  {!courierId ? (
                    // ✨ Seller hasn’t added courier yet
                    <Button
                      size="sm"
                      className="rounded-full text-xs px-5 h-8 text-white bg-slate-900 hover:bg-slate-800 hover:cursor-pointer"
                      onClick={() => setOpenDelivery(true)}
                    >
                      Add Delivery
                    </Button>
                  ) : (
                    // ✅ Courier already added — show status modal
                      <>
                        <Button
                          size="sm"
                          className="rounded-full text-xs px-5 h-8 text-white bg-blue-600 hover:bg-blue-700 hover:cursor-pointer"
                          onClick={() => setOpenDelivery(true)} // reuse dialog toggle
                        >
                          Courier Added
                        </Button>

                        <CourierStatusDialog
                          open={openDelivery}
                          onOpenChange={setOpenDelivery}
                          transactionId={transactionId}
                        />
                      </>
                    )}
                </>
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
