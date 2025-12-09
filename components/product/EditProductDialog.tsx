"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useUpdatePost } from "@/hooks/mutations/useUpdatePost";

type EditProductDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  post: {
    post_id: string;
    item_price: number | null;
    item_description: string | null;
    item_trade: string | null;
    item_service_fee: number | null;
    quantity: number | null;
    post_type_name: string;
  };
};

export default function EditProductDialog({
  open,
  onOpenChange,
  post,
}: EditProductDialogProps) {
  const [price, setPrice] = useState<number | null>(post.item_price);
  const [description, setDescription] = useState(post.item_description ?? "");
  const [tradeDetails, setTradeDetails] = useState(post.item_trade ?? "");
  const [serviceFee, setServiceFee] = useState<number | null>(
    post.item_service_fee
  );
  const [quantity, setQuantity] = useState<number | null>(post.quantity ?? 1);

  const updatePostMutation = useUpdatePost(post.post_id);

  // ==== POST TYPE CHECKS ====
  const isSale = post.post_type_name === "Sale";
  const isRent = post.post_type_name === "Rent";
  const isTrade = post.post_type_name === "Trade";
  const isPasaBuy = post.post_type_name === "PasaBuy";
  const isEmergency = post.post_type_name === "Emergency Lending";
  const isDonation = post.post_type_name === "Giveaway";

  // Reset dialog when switching posts
  useEffect(() => {
    setPrice(post.item_price);
    setDescription(post.item_description ?? "");
    setTradeDetails(post.item_trade ?? "");
    setServiceFee(post.item_service_fee);
    setQuantity(post.quantity ?? 1);
  }, [post]);

  function handleSave() {
    const updateData: any = {
      item_description: description,
    };

    // Add fields based on post type
    if (isSale || isRent || isTrade) {
      updateData.item_price = price;
    }

    if (isTrade) {
      updateData.item_trade = tradeDetails;
    }

    if (isPasaBuy) {
      updateData.item_service_fee = serviceFee;
    }

    if (isSale) {
      updateData.quantity = quantity;
    }

    updatePostMutation.mutate(updateData, {
      onSuccess: () => {
        onOpenChange(false);
        window.location.reload();
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg space-y-4">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* PRICE */}
          {(isSale || isRent || isTrade) && (
            <div>
              <label className="text-sm font-medium">
                {isTrade ? "Price (Optional)" : "Item Price"}
              </label>
              <Input
                type="number"
                value={price ?? ""}
                placeholder={isTrade ? "Leave blank if not applicable" : ""}
                onChange={(e) =>
                  setPrice(e.target.value === "" ? null : Number(e.target.value))
                }
              />
            </div>
          )}

          {/* DESCRIPTION */}
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* TRADE DETAILS */}
          {isTrade && (
            <div>
              <label className="text-sm font-medium">
                Items Accepted for Trade
              </label>
              <Input
                value={tradeDetails}
                onChange={(e) => setTradeDetails(e.target.value)}
              />
            </div>
          )}

          {/* SERVICE FEE — ONLY PASABUY */}
          {isPasaBuy && (
            <div>
              <label className="text-sm font-medium">Service Fee</label>
              <Input
                type="number"
                value={serviceFee ?? ""}
                onChange={(e) => setServiceFee(Number(e.target.value))}
              />
            </div>
          )}

          {/* QUANTITY — ONLY SALE */}
          {isSale && (
            <div>
              <label className="text-sm font-medium">Quantity / Stock</label>
              <Input
                type="number"
                value={quantity ?? ""}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>
          )}
        </div>

        <Button
          className="w-full"
          onClick={handleSave}
          disabled={updatePostMutation.isPending}
        >
          {updatePostMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
