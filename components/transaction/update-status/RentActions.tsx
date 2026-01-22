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


type RentActionsProps = {
  action: string;                                 
  transactionId: string;                          
  type: "Purchases" | "Sales";                   
  onPrimary?: (id: string) => void;               
};

export default function RentActions({
  action,
  transactionId,
  type,
  onPrimary,
}: RentActionsProps) {
  const [open, setOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [balance, setBalance] = useState(0);
  const [isPaying, setIsPaying] = useState(false);
  const [txData, setTxData] = useState<any>(null);
  const [totalPayment, setTotalPayment] = useState<number | null>(null);
  const [rentDays, setRentDays] = useState<number | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const supabase = createClient();

  // TYPE ENDPOINTS to stop implicit any errors
  const updateRentStatus = async (
    endpoint: "pickedup" | "return" | "confirm-return" | "accept" | "reject",
    successMsg: string
  ) => {
    try {
      setIsUpdating(true);
      const loading = toast.loading("Updating...");

      const res = await fetch(`/api/status-update/rent/${endpoint}`, {
        method: "POST",
        body: JSON.stringify({ transactionId }),
      });

      toast.dismiss(loading);

      if (!res.ok) throw new Error("Failed to update.");

      toast.success(successMsg);
      onPrimary?.(transactionId);
    } catch {
      toast.error("Failed to update rent status.");
    } finally {
      setIsUpdating(false);
      setOpen(false);
    }
  };

  const handleAccept = () => {
    updateRentStatus("accept", "Order accepted.");
  };

  const handleReject = () => {
    updateRentStatus("reject", "Order rejected.");
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

    // Calculate rent days and total payment
    if (transaction.rent_start_date && transaction.rent_end_date) {
      const days = Math.max(
        1,
        Math.ceil(
          (new Date(transaction.rent_end_date).getTime() -
            new Date(transaction.rent_start_date).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      );
      setRentDays(days);
      setTotalPayment(Number(transaction.posts?.item_price || 0) * days);
    } else {
      setRentDays(null);
      setTotalPayment(Number(transaction.posts?.item_price || 0));
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
          rentDays,
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
          rentDays,
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

  // Maps UI action → API endpoint
  const handleAction = () => {
    if (action === "Mark as Picked Up")
      return updateRentStatus("pickedup", "Item marked as picked up.");

    if (action === "Return Item")
      return updateRentStatus("return", "Item returned.");

    if (action === "Confirm Return")
      return updateRentStatus(
        "confirm-return",
        "Rent completed. Review unlocked."
      );
  };

  // Disabled states
  const disabledStates = [
    "Waiting for Seller",
    "Waiting for Payment",
    "Waiting for Pickup",
    "On Rent",
    "Waiting for Review",
    "Completed",
    "Cancelled",
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
            postType="Rent"
            rentDays={rentDays}
            itemTitle={txData.posts?.title}
            txnPrice={txData.posts?.item_price}
            distanceKm={null}
            deliveryFee={null}
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
        className="rounded-full text-xs px-5 h-8 bg-gray-400 text-white"
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
            {action === "Mark as Picked Up" &&
              "Confirm that the buyer picked up the rented item."}

            {action === "Return Item" &&
              "Confirm that you are returning the rented item."}

            {action === "Confirm Return" &&
              "Confirm that the rented item has been returned safely."}
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
