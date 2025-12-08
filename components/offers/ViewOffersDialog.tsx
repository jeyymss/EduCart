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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DollarSign, Calendar, MessageSquare, CheckCircle, XCircle } from "lucide-react";

interface Offer {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerAvatar?: string;
  offerPrice: number;
  message?: string;
  createdAt: string;
  status: "pending" | "accepted" | "rejected";
}

interface ViewOffersDialogProps {
  itemTitle: string;
  itemPrice: number;
}

// Mock data for demonstration
const mockOffers: Offer[] = [
  {
    id: "1",
    buyerId: "user1",
    buyerName: "John Doe",
    buyerAvatar: undefined,
    offerPrice: 450,
    message: "Hi! I'm very interested in this item. Would you accept ₱450?",
    createdAt: "2025-12-08T10:30:00Z",
    status: "pending",
  },
  {
    id: "2",
    buyerId: "user2",
    buyerName: "Jane Smith",
    offerPrice: 480,
    message: "Can you do ₱480? I can pick it up today!",
    createdAt: "2025-12-08T14:15:00Z",
    status: "pending",
  },
  {
    id: "3",
    buyerId: "user3",
    buyerName: "Mike Johnson",
    offerPrice: 400,
    createdAt: "2025-12-07T16:45:00Z",
    status: "rejected",
  },
];

export default function ViewOffersDialog({ itemTitle, itemPrice }: ViewOffersDialogProps) {
  const [open, setOpen] = useState(false);
  const [offers, setOffers] = useState<Offer[]>(mockOffers);

  const handleAccept = (offerId: string) => {
    // TODO: Backend logic will go here
    console.log("Accepting offer:", offerId);
    setOffers(offers.map(offer =>
      offer.id === offerId ? { ...offer, status: "accepted" as const } : offer
    ));
  };

  const handleReject = (offerId: string) => {
    // TODO: Backend logic will go here
    console.log("Rejecting offer:", offerId);
    setOffers(offers.map(offer =>
      offer.id === offerId ? { ...offer, status: "rejected" as const } : offer
    ));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const pendingOffers = offers.filter(o => o.status === "pending");
  const acceptedOffers = offers.filter(o => o.status === "accepted");
  const rejectedOffers = offers.filter(o => o.status === "rejected");

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(s => s[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex-1 py-3 bg-[#F3D58D] hover:bg-[#F3D58D]/90 border-[#F3D58D] text-black font-medium hover:cursor-pointer"
        >
          View Offers ({offers.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#102E4A]">Offers for {itemTitle}</DialogTitle>
          <DialogDescription className="text-gray-600">
            Listing price: ₱{Number(itemPrice ?? 0).toFixed(2)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {offers.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No offers yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Buyers can make offers on your item
              </p>
            </div>
          ) : (
            <>
              {/* Pending Offers */}
              {pendingOffers.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-gray-700 uppercase tracking-wide">
                    Pending Offers ({pendingOffers.length})
                  </h3>
                  {pendingOffers.map((offer) => (
                    <OfferCard
                      key={offer.id}
                      offer={offer}
                      itemPrice={itemPrice}
                      onAccept={handleAccept}
                      onReject={handleReject}
                      formatDate={formatDate}
                      getInitials={getInitials}
                    />
                  ))}
                </div>
              )}

              {/* Accepted Offers */}
              {acceptedOffers.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-green-700 uppercase tracking-wide">
                    Accepted Offers ({acceptedOffers.length})
                  </h3>
                  {acceptedOffers.map((offer) => (
                    <OfferCard
                      key={offer.id}
                      offer={offer}
                      itemPrice={itemPrice}
                      onAccept={handleAccept}
                      onReject={handleReject}
                      formatDate={formatDate}
                      getInitials={getInitials}
                    />
                  ))}
                </div>
              )}

              {/* Rejected Offers */}
              {rejectedOffers.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide">
                    Rejected Offers ({rejectedOffers.length})
                  </h3>
                  {rejectedOffers.map((offer) => (
                    <OfferCard
                      key={offer.id}
                      offer={offer}
                      itemPrice={itemPrice}
                      onAccept={handleAccept}
                      onReject={handleReject}
                      formatDate={formatDate}
                      getInitials={getInitials}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface OfferCardProps {
  offer: Offer;
  itemPrice: number;
  onAccept: (offerId: string) => void;
  onReject: (offerId: string) => void;
  formatDate: (date: string) => string;
  getInitials: (name: string) => string;
}

function OfferCard({ offer, itemPrice, onAccept, onReject, formatDate, getInitials }: OfferCardProps) {
  const priceDiff = itemPrice - offer.offerPrice;
  const priceDiffPercent = ((priceDiff / itemPrice) * 100).toFixed(0);

  return (
    <div
      className={`bg-white rounded-lg border p-4 shadow-sm transition-all ${
        offer.status === "accepted"
          ? "border-green-200 bg-green-50/30"
          : offer.status === "rejected"
          ? "border-gray-200 bg-gray-50/30 opacity-70"
          : "border-gray-200 hover:shadow-md"
      }`}
    >
      <div className="flex items-start gap-4">
        <Avatar className="h-12 w-12 flex-shrink-0">
          <AvatarImage src={offer.buyerAvatar} alt={offer.buyerName} />
          <AvatarFallback className="bg-[#577C8E] text-white">
            {getInitials(offer.buyerName)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <h4 className="font-semibold text-gray-900">{offer.buyerName}</h4>
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                <Calendar className="h-3 w-3" />
                {formatDate(offer.createdAt)}
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-1 text-lg font-bold text-[#102E4A]">
                <DollarSign className="h-4 w-4" />
                ₱{offer.offerPrice.toFixed(2)}
              </div>
              {priceDiff !== 0 && (
                <p
                  className={`text-xs ${
                    priceDiff > 0 ? "text-orange-600" : "text-green-600"
                  }`}
                >
                  {priceDiff > 0 ? "-" : "+"}₱{Math.abs(priceDiff).toFixed(2)} ({priceDiff > 0 ? "-" : "+"}{Math.abs(Number(priceDiffPercent))}%)
                </p>
              )}
            </div>
          </div>

          {offer.message && (
            <div className="bg-gray-50 rounded-md p-3 mb-3 border border-gray-100">
              <p className="text-sm text-gray-700">{offer.message}</p>
            </div>
          )}

          {offer.status === "pending" ? (
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                onClick={() => onAccept(offer.id)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onReject(offer.id)}
                className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </div>
          ) : (
            <div className="mt-3">
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                  offer.status === "accepted"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {offer.status === "accepted" ? (
                  <>
                    <CheckCircle className="h-3.5 w-3.5" />
                    Accepted
                  </>
                ) : (
                  <>
                    <XCircle className="h-3.5 w-3.5" />
                    Rejected
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
