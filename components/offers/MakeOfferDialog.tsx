"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DollarSign } from "lucide-react";

interface MakeOfferDialogProps {
  itemTitle: string;
  itemPrice: number;
}

export default function MakeOfferDialog({ itemTitle, itemPrice }: MakeOfferDialogProps) {
  const [open, setOpen] = useState(false);
  const [offerPrice, setOfferPrice] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Backend logic will go here
    console.log("Offer submitted:", { offerPrice, message });

    // Reset form and close dialog
    setOfferPrice("");
    setMessage("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex-1 py-3 bg-transparent hover:cursor-pointer">
          Make an Offer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#102E4A]">Make an Offer</DialogTitle>
          <DialogDescription className="text-gray-600">
            Submit your best offer for {itemTitle}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <label htmlFor="itemPrice" className="text-sm font-medium text-gray-700">
              Item Price
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                id="itemPrice"
                value={itemPrice.toFixed(2)}
                disabled
                className="pl-9 bg-gray-50 text-gray-600"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="offerPrice" className="text-sm font-medium text-gray-700">
              Your Offer Price <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                id="offerPrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter your offer"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                className="pl-9"
                required
              />
            </div>
            {offerPrice && Number(offerPrice) > 0 && (
              <p className="text-xs text-gray-500">
                {Number(offerPrice) < itemPrice
                  ? `₱${(itemPrice - Number(offerPrice)).toFixed(2)} less than listing price`
                  : Number(offerPrice) > itemPrice
                  ? `₱${(Number(offerPrice) - itemPrice).toFixed(2)} more than listing price`
                  : "Same as listing price"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium text-gray-700">
              Message (Optional)
            </label>
            <Textarea
              id="message"
              placeholder="Add a message to the seller..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-24 resize-none"
            />
            <p className="text-xs text-gray-500">
              {message.length}/500 characters
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#577C8E] hover:bg-[#577C8E]/90 text-white"
              disabled={!offerPrice || Number(offerPrice) <= 0}
            >
              Submit Offer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
