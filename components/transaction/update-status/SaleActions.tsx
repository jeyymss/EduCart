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
import PaymentDialog from "@/components/payments/PaymentDialog";
import { createClient } from "@/utils/supabase/client";
import { calculateDeliveryFee } from "@/utils/deliveryFee";
import { getRoadDistanceKm } from "@/utils/getRoadDistance";

type SaleActionsProps = {
  action: string;
  transactionId: string;
  type: "Purchases" | "Sales";
  onPrimary?: (id: string) => void;
};

export default function SaleActions({
  action,
  transactionId,
  type,
  onPrimary,
}: SaleActionsProps) {
  const [open, setOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [balance, setBalance] = useState(0);
  const [isPaying, setIsPaying] = useState(false);
  const [txData, setTxData] = useState<any>(null);
  const [totalPayment, setTotalPayment] = useState<number | null>(null);
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const supabase = createClient();

  const updateSaleStatus = async (newStatus: string, successMsg: string) => {
    try {
      setIsUpdating(true);
      const loading = toast.loading("Updating transaction...");

      const res = await fetch("/api/status-update/sale", {
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

  const handlePayNowClick = async () => {
    // Fetch transaction data
    const { data: transaction } = await supabase
      .from("transactions")
      .select("*, posts(*)")
      .eq("id", transactionId)
      .single();

    if (!transaction) {
      toast.error("Failed to load transaction details");
      return;
    }

    // Fetch user's wallet balance
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: wallet } = await supabase
        .from("wallets")
        .select("current_balance")
        .eq("user_id", user.id)
        .single();
      setBalance(wallet?.current_balance || 0);
    }

    // Store conversation ID
    setConversationId(transaction.conversation_id);

    // Calculate total payment based on fulfillment method
    if (transaction.fulfillment_method === "Meetup") {
      setTotalPayment(Number(transaction.posts?.item_price || 0));
      setDeliveryFee(null);
      setDistanceKm(null);
    } else if (transaction.fulfillment_method === "Delivery") {
      // Calculate delivery fee
      const post = transaction.posts;
      if (post && transaction.delivery_lat && transaction.delivery_lng) {
        const km = await getRoadDistanceKm(
          post.pickup_lat,
          post.pickup_lng,
          transaction.delivery_lat,
          transaction.delivery_lng
        );
        const fee = calculateDeliveryFee(km);
        const total = Number(transaction.posts?.item_price || 0) + fee;

        setDistanceKm(km);
        setDeliveryFee(fee);
        setTotalPayment(total);
      } else {
        setTotalPayment(Number(transaction.posts?.item_price || 0));
        setDeliveryFee(null);
        setDistanceKm(null);
      }
    }

    setTxData(transaction);
    setShowPaymentDialog(true);
  };

  const handleWalletPayment = async () => {
    if (totalPayment === null) return;

    try {
      setIsPaying(true);
      const loading = toast.loading("Processing payment...");

      const res = await fetch("/api/wallet/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionId,
          amount: totalPayment,
          deliveryFee
        }),
      });

      toast.dismiss(loading);

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      toast.success("Payment successful!");
      setShowPaymentDialog(false);
      onPrimary?.(transactionId);
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "Payment failed");
    } finally {
      setIsPaying(false);
    }
  };

  const handleGCashPayment = async () => {
    if (totalPayment === null) return;

    try {
      setIsPaying(true);
      const loading = toast.loading("Creating payment session...");

      const res = await fetch("/api/payments/gcash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalPayment,
          transactionId,
          conversationId,
          reference: `TXN-${transactionId}`,
          totalPayment,
        }),
      });

      toast.dismiss(loading);

      const data = await res.json();

      if (data?.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        throw new Error("Failed to initialize GCash payment.");
      }
    } catch (error: any) {
      toast.error(error.message || "Payment failed");
      setIsPaying(false);
    }
  };

  const handleAccept = () => {
    updateSaleStatus("Accepted", "Order accepted.");
  };

  const handleReject = () => {
    updateSaleStatus("Cancelled", "Order rejected.");
  };

  const handleAction = () => {
    if (action === "Order Picked Up")
      return updateSaleStatus("PickedUp", "Order marked as picked up.");

    if (action === "Order Received")
      return updateSaleStatus("Completed", "Transaction completed.");

    // NEW: CASH ON HAND → Buyer marks as completed
    if (action === "Item Received")
      return updateSaleStatus("Completed", "Transaction completed.");
  };

  const disabledStates = [
    "Waiting for Seller",
    "Waiting for Payment",
    "Waiting for Confirmation",
    "On Hold",
    "Completed",
    "Cancelled",
    "Waiting for Delivery",
  ];

  // Handle "Action" button for sellers
  if (action === "Action") {
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
            <AlertDialogTitle>Transaction Action</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to accept or reject this transaction?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isUpdating}
              className="mr-2"
            >
              {isUpdating ? "Rejecting..." : "Reject"}
            </Button>
            <AlertDialogAction onClick={handleAccept} disabled={isUpdating}>
              {isUpdating ? "Accepting..." : "Accept"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // Handle "Pay Now" button
  if (action === "Pay Now") {
    return (
      <>
        <Button
          size="sm"
          className="rounded-full text-xs px-5 h-8 text-white bg-blue-600 hover:bg-blue-700"
          onClick={handlePayNowClick}
        >
          {action}
        </Button>

        {showPaymentDialog && txData && (
          <PaymentDialog
            open={showPaymentDialog}
            onOpenChange={setShowPaymentDialog}
            postType="Sale"
            itemTitle={txData.posts?.title}
            txnPrice={txData.posts?.item_price}
            distanceKm={distanceKm}
            deliveryFee={deliveryFee}
            cash_added={null}
            totalPayment={totalPayment}
            fulfillmentMethod={txData.fulfillment_method}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            balance={balance}
            insufficientBalance={balance < (totalPayment || 0)}
            isPaying={isPaying}
            handleWalletPayment={handleWalletPayment}
            handleGCashPayment={handleGCashPayment}
            successMsg=""
          />
        )}
      </>
    );
  }

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
            {action === "Accept Order" &&
              "Confirm that you want to accept this order."}

            {action === "Item Received" &&
              "Confirm that you have received the item. This will complete the transaction."}

            {action === "Order Picked Up" &&
              "Confirm that the buyer or courier picked up the order."}

            {action === "Order Received" &&
              "Confirm that you have received the item. This will complete the transaction."}
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
