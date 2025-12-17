"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import PostTypeBadge from "@/components/postTypeBadge";
import { createClient } from "@/utils/supabase/client";
import { computeSaleActionLabel } from "../actions/saleAction";
import { computeRentActionLabel } from "../actions/rentAction";
import { computeTradeActionLabel } from "../actions/tradeAction";
import { computeEmergencyActionLabel } from "../actions/emergencyAction";
import { computeGiveawayActionLabel } from "../actions/giveawayAction";
import { computePasaBuyActionLabel } from "../actions/pasabuyAction";
import SaleActions from "../update-status/SaleActions";
import RentActions from "../update-status/RentActions";
import EmergencyActions from "../update-status/EmergencyActions";
import LeaveReviewDialog from "../LeaveReviewDialog";
import TradeActions from "../update-status/TradeActions";
import GiveawayActions from "../update-status/GiveawayActions";
import PasaBuyActions from "../update-status/PasaBuyActions";

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
  | "PickedUp"
  | "Returned";

export interface TransactionCardProps {
  id: string;               // transaction_records.id 
  transactionId: string;    // transactions.id
  type: TxSide;
  method: TxMethod;
  title: string;
  price: number;
  total?: number;
  image?: string;
  onView: (id: string) => void;
  onPrimary?: (id: string) => void;
  status?: TxStatus | string;
  postType?: string;
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
  status = "active",
  postType,
}: TransactionCardProps) {
  const [sellerId, setSellerId] = useState(null);
  const [buyerId, setBuyerId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [fulfillment, setFulfillment] = useState<string | null>(null);
  const [openReview, setOpenReview] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(status);
  const [hasReview, setHasReview] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  const badgeText = postType ?? (type === "Sales" ? "Sale" : "Buy");

  // Determine label - use currentStatus instead of prop status
  function resolveActionLabel() {
    const clean = postType?.toLowerCase();
    if (clean === "sale") return computeSaleActionLabel(type, currentStatus, paymentMethod ?? undefined, fulfillment ?? undefined);
    if (clean === "rent") return computeRentActionLabel(type, currentStatus, paymentMethod ?? undefined);
    if (clean === "trade") return computeTradeActionLabel(type, currentStatus, paymentMethod ?? undefined);
    if (clean === "emergency lending") return computeEmergencyActionLabel(type, currentStatus as any);
    if (clean === "giveaway") return computeGiveawayActionLabel(type, currentStatus as any, fulfillment ?? undefined);
    if (clean === "pasabuy") return computePasaBuyActionLabel(type, currentStatus, paymentMethod ?? undefined, fulfillment ?? undefined);

    return "";
  }

  const action = resolveActionLabel();

  // Handler to call parent's onPrimary callback
  const handlePrimaryAction = React.useCallback(async (txId: string) => {
    console.log("[TransactionCard] Action completed");

    // Call the parent's onPrimary if it exists
    onPrimary?.(txId);

    // Review dialog has been disabled - no automatic popup after completion
  }, [onPrimary]);

  // Get current user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch buyer/seller for review dialog and check if review exists
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("transactions")
        .select("buyer_id, seller_id, payment_method, fulfillment_method, status")
        .eq("id", transactionId)
        .single();

      console.log("[TransactionCard] Initial load - Transaction data:", data);
      console.log("[TransactionCard] Initial load - Type:", type);

      setBuyerId(data?.buyer_id);
      setSellerId(data?.seller_id);
      setPaymentMethod(data?.payment_method);
      setFulfillment(data?.fulfillment_method);
      setCurrentStatus(data?.status || status);

      // Check if review already exists
      if (data?.buyer_id) {
        const { data: reviewData } = await supabase
          .from("reviews")
          .select("id")
          .eq("transaction_id", transactionId)
          .eq("reviewer_id", data.buyer_id)
          .maybeSingle();

        setHasReview(!!reviewData);
        console.log("[TransactionCard] Review exists:", !!reviewData);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionId]);

  // Real-time subscription for this specific transaction
  useEffect(() => {
    const channel = supabase
      .channel(`transaction_${transactionId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "transactions",
          filter: `id=eq.${transactionId}`,
        },
        async (payload) => {
          const newData = payload.new as any;
          const oldData = payload.old as any;

          console.log("[Real-time] Transaction updated:", { newData, oldData, type });

          if (newData.status) {
            setCurrentStatus(newData.status);
            // Review dialog has been disabled - no automatic popup on completion
          }
          if (newData.payment_method) {
            setPaymentMethod(newData.payment_method);
          }
          if (newData.fulfillment_method) {
            setFulfillment(newData.fulfillment_method);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionId, type, buyerId]);

  return (
    <>
      <tr
        className="hover:bg-gray-50 cursor-pointer"
        onClick={() => onView(id)}
      >
        <td className="px-6 py-4 font-medium text-gray-900">{title}</td>

        <td className="px-6 py-4 font-semibold text-[#E59E2C] whitespace-nowrap">
          ₱{Number(total ?? price).toLocaleString()}
        </td>

        <td className="px-6 py-4">
          <PostTypeBadge type={badgeText as any} />
        </td>

        <td className="px-6 py-4">
          <span className="px-3 py-1 text-xs bg-gray-50 rounded-full border">
            {method}
          </span>
        </td>

        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
          {/* Show "Leave Review" button for completed transactions without review */}
          {currentStatus === "Completed" && type === "Purchases" && !hasReview ? (
            <Button
              size="sm"
              className="rounded-full text-xs px-5 h-8 text-white bg-amber-600 hover:bg-amber-700"
              onClick={() => setOpenReview(true)}
            >
              Leave Review
            </Button>
          ) : (
            <>
              {/* Post Type: Sale */}
              {postType === "Sale" && (
                <SaleActions
                  action={action}
                  transactionId={transactionId}
                  type={type}
                  onPrimary={handlePrimaryAction}
                />
              )}

              {/* Post Type: Rent */}
              {postType === "Rent" && (
                <RentActions
                  action={action}
                  transactionId={transactionId}
                  type={type}
                  onPrimary={handlePrimaryAction}
                />
              )}

              {postType === "Trade" && (
                <TradeActions
                  action={action}
                  transactionId={transactionId}
                  type={type}
                  onPrimary={handlePrimaryAction}
                />
              )}

              {/* EMERGENCY LENDING */}
              {postType === "Emergency Lending" && (
                <EmergencyActions
                  action={action}
                  transactionId={transactionId}
                  type={type}
                  onPrimary={handlePrimaryAction}
                />
              )}

              {postType === "Giveaway" && (
                <GiveawayActions
                  action={action}
                  transactionId={transactionId}
                  onPrimary={handlePrimaryAction}
                />
              )}

              {/* POST TYPE: PASABUY */}
              {postType === "PasaBuy" && (
                <PasaBuyActions
                  action={action}
                  transactionId={transactionId}
                  type={type}
                  onPrimary={handlePrimaryAction}
                />
              )}
            </>
          )}
        </td>
      </tr>

      {openReview && sellerId && buyerId && (
        <LeaveReviewDialog
          open={openReview}
          onOpenChange={(open) => {
            setOpenReview(open);
            // If review dialog is closed and was open before, mark that review exists
            if (!open && openReview) {
              setHasReview(true);
            }
          }}
          transactionId={transactionId}
          sellerId={sellerId}
          buyerId={buyerId}
          onReviewSubmitted={() => {
            setHasReview(true);
          }}
        />
      )}
    </>
  );
}
