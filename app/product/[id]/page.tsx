"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProductDetails } from "@/hooks/queries/displayItems";
import { useParams, useRouter } from "next/navigation";
import SaleDetails from "@/components/posts/itemDetails/saleDetails";
import RentDetails from "@/components/posts/itemDetails/rentDetails";
import TradeDetails from "@/components/posts/itemDetails/tradeDetails";
import { getRelativeTime } from "@/utils/getRelativeTime";
import { usePublicProfile } from "@/hooks/queries/profiles";
import { ArrowLeft, Heart } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import MessageSellerButton from "@/components/messages/MessageSellerBtn";

function renderDetails(item: any) {
  switch (item?.post_type_name) {
    case "Sale":
      return <SaleDetails item={item} />;
    case "Rent":
      return <RentDetails item={item} />;
    case "Trade":
      return <TradeDetails item={item} />;
    default:
      return <p>Unsupported post type</p>;
  }
}

export default function ItemDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { data: item, isLoading, error } = useProductDetails(id ?? "");

  const listerUserId = item?.post_user_id as string | undefined;
  const { data: lister } = usePublicProfile(listerUserId ?? "");

  if (!id)
    return <div className="text-red-600">Invalid or missing item ID</div>;
  if (error)
    return (
      <div className="text-red-600">
        Item not found or error: {error.message}
      </div>
    );
  if (isLoading || !item) return <p className="p-10">Loading...</p>;

  const initials = (item.full_name ?? "U")
    .split(" ")
    .map((s: string) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const avatarSrc = lister?.avatar_url ?? undefined;

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-[#577C8E] hover:text-[#577C8E] hover:bg-[#577C8E]/10"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left side - Images */}
          <div className="space-y-4">
            {/* Main image */}
            {Array.isArray(item.image_urls) && item.image_urls.length > 0 && (
              <div className="relative aspect-square bg-white rounded-2xl overflow-hidden shadow-sm">
                <Image
                  src={
                    item.image_urls[selectedImageIndex] || "/placeholder.svg"
                  }
                  alt={item.item_title ?? "Item image"}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {Array.isArray(item.image_urls) && item.image_urls.length > 1 && (
              <div className="flex gap-3">
                {item.image_urls
                  .slice(0, 5)
                  .map((url: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative w-20 h-20 bg-white rounded-lg overflow-hidden shadow-sm transition-all ${
                        selectedImageIndex === index
                          ? "ring-2 ring-[#102E4A]"
                          : "hover:ring-2 hover:ring-gray-300"
                      }`}
                    >
                      <Image
                        src={url || "/placeholder.svg"}
                        alt={`Image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Right side - Product details */}
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">{renderDetails(item)}</div>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-600"
              >
                <Heart className="h-7 w-7" />
              </Button>
            </div>

            {item.created_at && (
              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-1">
                  Listed
                </h2>
                <p className="text-gray-700">
                  {getRelativeTime(item.created_at)}
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
              <MessageSellerButton
                className="flex-1 bg-[#F3D58D] hover:bg-[#F3D58D]/90 text-black font-medium py-3"
                postId={item.post_id}
                sellerId={item.post_user_id} // ✅ pass seller here
              />
              <Button variant="outline" className="flex-1 py-3 bg-transparent">
                Make an Offer
              </Button>
            </div>

            {/* Posted by section */}
            {item.post_user_id && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-4">
                  Posted By
                </h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        key={avatarSrc ?? "no-avatar"}
                        src={avatarSrc || "/placeholder.svg"}
                        alt={item.full_name ?? "Lister"}
                      />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {item.full_name ?? "Lister"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild variant="secondary">
                      <Link href={`/${item.post_user_id}`}>View lister</Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
