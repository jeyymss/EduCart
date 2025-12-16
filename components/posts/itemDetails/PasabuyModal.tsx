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
import { usePasabuyDetails } from "@/hooks/queries/usePasabuyDetailts";

import type { PasaBuyPost } from "@/hooks/queries/displayItems";

interface PasabuyModalProps {
  post: PasaBuyPost | null;
  onClose: () => void;
}

export default function PasabuyModal({ post, onClose }: PasabuyModalProps) {
  const { data, isLoading } = usePasabuyDetails(post?.post_id ?? null);

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

        {isLoading ? (
          <p className="text-sm text-gray-500">Loading details…</p>
        ) : (
          <>
            {/* BODY */}
            <div className="mt-4 space-y-3 text-sm text-gray-700">
                <p>
                  <span className="font-semibold text-[#102E4A]">
                    Description:
                  </span>{" "}
                  {post.item_description}
                </p>

                <p>
                  <span className="font-semibold text-[#102E4A]">
                    Service Fee:
                  </span>{" "}
                  ₱{post.item_service_fee}
                </p>

                {/* ✅ NEW: PASABUY LOCATION */}
                {data?.item_pasabuy_location && (
                  <p>
                    <span className="font-semibold text-[#102E4A]">
                      Shopping Location:
                    </span>{" "}
                    {data.item_pasabuy_location}
                  </p>
                )}

                <p>
                  <span className="font-semibold text-[#102E4A]">
                    Posted:
                  </span>{" "}
                  {getRelativeTime(post.created_at)}
                </p>
            </div>


            {/* ITEMS LIST */}
            <div className="mt-5">
              <h3 className="font-semibold text-[#102E4A] mb-2">
                Items Available
              </h3>

              {data?.pasabuy_items?.length ? (
                <div className="space-y-2">
                  {data.pasabuy_items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between rounded-lg border p-2 text-sm"
                    >
                      <span>{item.product_name}</span>
                      <span className="font-semibold">
                        ₱{item.price.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500">
                  No items listed.
                </p>
              )}
            </div>
          </>
        )}

        {/* FOOTER */}
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4">
          <Link href={`/${post.post_user_id}`} className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full py-2 font-medium rounded-lg"
            >
              View Lister
            </Button>
          </Link>

          <MessageSellerButton
            postId={post.post_id}
            sellerId={post.post_user_id}
            className="w-full sm:w-auto bg-[#F3D58D]"
          />
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}
