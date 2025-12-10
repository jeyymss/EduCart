"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface MakeOfferDialogProps {
  postId: string;
  sellerId: string;
  itemTitle: string;
}

export default function MakeOfferDialog({
  postId,
  sellerId,
  itemTitle,
}: MakeOfferDialogProps) {
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset form when dialog closes
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setPrice("");
      setMessage("");
      setError("");
    }
  };

  const submitOffer = async () => {
    // Validation
    if (!price || Number(price) <= 0) {
      setError("Please enter a valid price");
      return;
    }

    setLoading(true);
    setError("");

    const res = await fetch("/api/offers/create", {
      method: "POST",
      body: JSON.stringify({
        post_id: postId,
        seller_id: sellerId,
        offered_price: Number(price),
        message,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.error) {
      setError(data.error);
      return;
    }

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex-1 py-3 bg-transparent hover:bg-gray-50 border-2 border-[#102E4A] text-[#102E4A] font-semibold hover:cursor-pointer transition-all"
        >
          Make Offer
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#102E4A]">
            Make an Offer
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Submit your offer for <span className="font-semibold">{itemTitle}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-4">
          {/* Price Input */}
          <div className="space-y-2">
            <Label htmlFor="price" className="text-sm font-medium text-gray-700">
              Offered Price <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                ₱
              </span>
              <Input
                id="price"
                type="number"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="pl-8 h-11 text-base border-gray-300 focus:border-[#102E4A] focus:ring-[#102E4A]"
              />
            </div>
          </div>

          {/* Message Input */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium text-gray-700">
              Message (Optional)
            </Label>
            <Textarea
              id="message"
              placeholder="Add a message to the seller..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none border-gray-300 focus:border-[#102E4A] focus:ring-[#102E4A]"
            />
            <p className="text-xs text-gray-500">
              Explain why you&apos;re offering this price or ask questions
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            className="w-full h-11 bg-gradient-to-r from-[#102E4A] to-[#1a3d5f] text-white font-semibold hover:from-[#1a3d5f] hover:to-[#102E4A] shadow-md hover:shadow-lg transition-all"
            onClick={submitOffer}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Send Offer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
