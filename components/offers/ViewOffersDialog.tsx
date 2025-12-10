"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { User } from "lucide-react";

interface Offer {
  id: string;
  post_id: string;
  buyer_id: string;
  seller_id: string;
  offered_price: number;
  message: string | null;
  status: "Pending" | "Accepted" | "Rejected";
  created_at: string;

  buyer_full_name: string | null;
  buyer_avatar_url?: string | null;
}


interface ViewOffersDialogProps {
  postId: string;
  sellerId: string;
  itemTitle: string;
}

export default function ViewOffersDialog({
  postId,
  sellerId,
  itemTitle,
}: ViewOffersDialogProps) {
  const [open, setOpen] = useState(false);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);

  const loadOffers = async () => {
    setLoading(true);

    try {
      const res = await fetch(`/api/offers/list?postId=${postId}`);
      const data = await res.json();

      if (!res.ok) {
        console.error(data.error || "Failed to fetch offers");
        setOffers([]);
      } else {
        setOffers(data.offers || []);
      }

      console.log(data)
    } catch (error) {
      console.error("Error fetching offers:", error);
      setOffers([]);
    } finally {
      setLoading(false);
    }

    
  };

  useEffect(() => {
    if (open) loadOffers();
  }, [open]);

  const acceptOffer = async (offer: Offer) => {
    await fetch("/api/offers/accept", {
      method: "POST",
      body: JSON.stringify({
        offer_id: offer.id,
        post_id: postId,
        seller_id: sellerId,
      }),
    });

    loadOffers();
  };

  const rejectOffer = async (offer: Offer) => {
    await fetch("/api/offers/reject", {
      method: "POST",
      body: JSON.stringify({
        offer_id: offer.id,
      }),
    });

    loadOffers();
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      Pending: "bg-amber-100 text-amber-700",
      Accepted: "bg-green-100 text-green-700",
      Rejected: "bg-red-100 text-red-700",
    };
    return styles[status as keyof typeof styles] || "";
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#F3D58D] text-black hover:bg-[#E59E2C]">
          View Offers
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#102E4A]">
            Offers for {itemTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading offers...</div>
          ) : offers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No offers yet for this item.
            </div>
          ) : (
            offers.map((offer) => (
              <div
                key={offer.id}
                className="border border-gray-200 rounded-xl p-5 bg-gradient-to-br from-white to-gray-50 shadow-sm hover:shadow-md transition-all"
              >
                {/* Header with buyer info and status */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {offer.buyer_full_name ? (
                      <Image
                        src={offer.buyer_avatar_url || "/default-avatar.png"}
                        alt={offer.buyer_full_name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-500" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-[#102E4A]">
                        {offer.buyer_full_name ?? "Unknown Buyer"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(offer.created_at)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                      offer.status
                    )}`}
                  >
                    {offer.status}
                  </span>
                </div>

                {/* Offer details */}
                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                    <p className="text-xs text-blue-600 font-medium mb-1">
                      OFFERED PRICE
                    </p>
                    <p className="text-2xl font-bold text-[#E59E2C]">
                      ₱{offer.offered_price.toLocaleString()}
                    </p>
                  </div>

                  {offer.message && (
                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <p className="text-xs text-gray-500 font-medium mb-1">
                        MESSAGE
                      </p>
                      <p className="text-sm text-gray-700">{offer.message}</p>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                {offer.status === "Pending" && (
                  <div className="flex gap-3 mt-4">
                    <Button
                      className="bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 flex-1 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
                      onClick={() => acceptOffer(offer)}
                    >
                      ✓ Accept Offer
                    </Button>

                    <Button
                      variant="outline"
                      className="border-2 border-red-400 text-red-600 hover:bg-red-50 flex-1 rounded-lg font-medium transition-all"
                      onClick={() => rejectOffer(offer)}
                    >
                      ✕ Reject
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
