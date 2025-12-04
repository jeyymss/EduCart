"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import PostTypeBadge from "@/components/postTypeBadge";
import { createClient } from "@/utils/supabase/client";
import { computeSaleActionLabel } from "../actions/saleAction";
import { computeRentActionLabel } from "../actions/rentAction";
import SaleActions from "../update-status/SaleActions";
import RentActions from "../update-status/RentActions";
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
  const [openReview, setOpenReview] = useState(false);
  const supabase = createClient();

  const badgeText = postType ?? (type === "Sales" ? "Sale" : "Buy");

  // Determine label
  function resolveActionLabel() {
    const clean = postType?.toLowerCase();
    if (clean === "sale") return computeSaleActionLabel(type, status, paymentMethod ?? undefined);
    if (clean === "rent") return computeRentActionLabel(type, status);
    return "";
  }

  const action = resolveActionLabel();

  // Fetch buyer/seller for review dialog
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("transactions")
        .select("buyer_id, seller_id, payment_method")
        .eq("id", transactionId)
        .single();

      setBuyerId(data?.buyer_id);
      setSellerId(data?.seller_id);
      setPaymentMethod(data?.payment_method);
    };
    load();
  }, []);

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
          {/* Post Type: Sale */}
          {postType === "Sale" && (
            <SaleActions
              action={action}
              transactionId={transactionId}
              type={type}
              onPrimary={onPrimary}
            />
          )}

          {/* Post Type: Rent */}
          {postType === "Rent" && (
            <RentActions
              action={action}
              transactionId={transactionId}
              type={type}
              onPrimary={onPrimary}
            />
          )}
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
