"use client";

import Link from "next/link";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import MessageSellerButton from "@/components/messages/MessageSellerBtn";
import { getRelativeTime } from "@/utils/getRelativeTime";

import type { PasaBuyPost } from "@/hooks/queries/displayItems";

interface PasabuyModalProps {
  post: PasaBuyPost | null;
  onClose: () => void;
}

export default function PasabuyModal({ post, onClose }: PasabuyModalProps) {
  if (!post) return null;

  return (
    <Dialog open={!!post} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg rounded-2xl p-6">

        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#102E4A]">
            {post.item_title}
          </DialogTitle>
        </DialogHeader>

        {/* BODY */}
        <div className="mt-4 space-y-3 text-sm text-gray-700">
          <p>
            <span className="font-semibold text-[#102E4A]">Description:</span>{" "}
            {post.item_description}
          </p>

          <p>
            <span className="font-semibold text-[#102E4A]">Service Fee:</span>{" "}
            ₱{post.item_service_fee}
          </p>

          <p>
            <span className="font-semibold text-[#102E4A]">Name:</span>{" "}
            {post.full_name}
          </p>

          <p>
            <span className="font-semibold text-[#102E4A]">University:</span>{" "}
            {post.university_abbreviation}
          </p>

          <p>
            <span className="font-semibold text-[#102E4A]">Role:</span>{" "}
            {post.role}
          </p>

          <p>
            <span className="font-semibold text-[#102E4A]">Posted:</span>{" "}
            {getRelativeTime(post.created_at)}
          </p>
        </div>

        {/* FOOTER */}
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4">

          {/* VIEW LISTER */}
          <Link href={`/${post.post_user_id}`} className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full py-2 font-medium rounded-lg border-[#102E4A] text-[#102E4A] hover:bg-[#102E4A] hover:text-white transition"
            >
              View Lister
            </Button>
          </Link>

          {/* MESSAGE SELLER */}
          <MessageSellerButton
            postId={post.post_id}
            sellerId={post.post_user_id}
            className="w-full sm:w-auto bg-[#F3D58D] hover:bg-[#e8c880] text-black font-medium py-2 rounded-lg"
          />
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}
