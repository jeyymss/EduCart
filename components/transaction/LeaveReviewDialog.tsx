"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Star } from "lucide-react";

type LeaveReviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: string;
  sellerId: string;
  buyerId: string;
  onReviewSubmitted?: () => void;
};

export default function LeaveReviewDialog({
  open,
  onOpenChange,
  transactionId,
  sellerId,
  buyerId,
  onReviewSubmitted,
}: LeaveReviewDialogProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  const handleSubmit = async () => {
    if (!rating) {
      toast.error("Please select a rating.");
      return;
    }
    setIsSubmitting(true);
    const { error } = await supabase.from("reviews").insert({
      transaction_id: transactionId,
      reviewer_id: buyerId,
      reviewed_user_id: sellerId,
      rating,
      comment,
    });

    if (error) {
      console.error(error);
      toast.error("Failed to submit review.");
      setIsSubmitting(false);
    } else {
      toast.success("Review submitted successfully!");

      // Reset form
      setRating(0);
      setComment("");
      setIsSubmitting(false);

      // Notify parent component
      onReviewSubmitted?.();

      // Close dialog
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      // Prevent closing while submitting
      if (isSubmitting) return;
      onOpenChange(newOpen);
    }}>
      <DialogContent
        className="max-w-md"
        onInteractOutside={(e) => {
          // Prevent closing on outside click while submitting
          if (isSubmitting) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Leave a Review</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">Rate your experience with the seller:</p>
          <div className="flex gap-2 justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={28}
                className={`cursor-pointer ${
                  (hoverRating ?? rating) >= star
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(null)}
              />
            ))}
          </div>

          <Textarea
            placeholder="Write your feedback (optional)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <DialogFooter className="mt-4">
          <Button
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white"
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
