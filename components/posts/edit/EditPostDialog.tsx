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

type EditPostDialogProps = {
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

  onSave: (updated: any) => void;
};

export default function EditPostDialog({
  open,
  onOpenChange,
  post,
  onSave,
}: EditPostDialogProps) {
  const [price, setPrice] = useState<number | null>(post.item_price);
  const [description, setDescription] = useState(post.item_description ?? "");
  const [tradeDetails, setTradeDetails] = useState(post.item_trade ?? "");
  const [serviceFee, setServiceFee] = useState<number | null>(
    post.item_service_fee
  );
  const [quantity, setQuantity] = useState<number | null>(post.quantity ?? 1);

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
    onSave({
        item_price: price,
        item_description: description,
        item_trade: isTrade ? tradeDetails : undefined,
        item_service_fee: isPasaBuy ? serviceFee : undefined,
        quantity: isSale ? quantity : undefined,
    });

    onOpenChange(false);
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

        <Button className="w-full" onClick={handleSave}>
          Save Changes
        </Button>
      </DialogContent>
    </Dialog>
  );
}
