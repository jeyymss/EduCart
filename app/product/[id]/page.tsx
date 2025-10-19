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
import { ArrowLeft, Heart, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import MessageSellerButton from "@/components/messages/MessageSellerBtn";
import {
  useIsFavorite,
  useToggleFavorite,
} from "@/hooks/queries/userFavorites";
import { createClient } from "@/utils/supabase/client";

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

const supabase = createClient();

export default function ItemDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: item, isLoading, error } = useProductDetails(id ?? "");
  const listerUserId = item?.post_user_id as string | undefined;
  const { data: lister } = usePublicProfile(listerUserId ?? "");

  // ✅ get logged-in user
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUserId(data.user.id);
    });
  }, []);

  // ✅ favorites state
  const { data: isFav = false, isLoading: favLoading } = useIsFavorite(
    id,
    userId ?? ""
  );
  const toggleFavorite = useToggleFavorite(id, userId ?? "");

  const images: string[] = useMemo(
    () => (Array.isArray(item?.image_urls) ? item!.image_urls : []),
    [item]
  );
  const imgCount = images.length;

  // Keep index valid if image set changes
  useEffect(() => {
    if (imgCount === 0) setSelectedImageIndex(0);
    else if (selectedImageIndex >= imgCount) setSelectedImageIndex(0);
  }, [imgCount, selectedImageIndex]);

  const goPrev = useCallback(() => {
    setSelectedImageIndex((i) =>
      imgCount ? (i - 1 + imgCount) % imgCount : 0
    );
  }, [imgCount]);

  const goNext = useCallback(() => {
    setSelectedImageIndex((i) => (imgCount ? (i + 1) % imgCount : 0));
  }, [imgCount]);

  // Keyboard controls for modal
  useEffect(() => {
    if (!isModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsModalOpen(false);
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isModalOpen, goPrev, goNext]);

  // Lock page scroll while modal is open
  useEffect(() => {
    if (!isModalOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [isModalOpen]);

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
      {/* Back button header */}
      <div className="bg-white px-6 py-4 mt-6">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-[#577C8E] hover:text-[#577C8E] hover:bg-[#577C8E]/10 hover:cursor-pointer"
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
            {imgCount > 0 && (
              <div
                className="relative aspect-square bg-white rounded-2xl overflow-hidden shadow-sm cursor-pointer"
                onClick={() => setIsModalOpen(true)}
              >
                <Image
                  src={images[selectedImageIndex] || "/placeholder.svg"}
                  alt={item.item_title ?? "Item image"}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {imgCount > 1 && (
              <div className="overflow-x-auto">
                <div className="flex gap-3 min-w-max pr-2">
                  {images.map((url, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative w-20 h-20 flex-none bg-white rounded-lg overflow-hidden shadow-sm transition-all ${
                        selectedImageIndex === index
                          ? "ring-2 ring-[#102E4A]"
                          : "hover:ring-2 hover:ring-gray-300"
                      }`}
                      aria-label={`Show image ${index + 1}`}
                    >
                      <Image
                        src={url || "/placeholder.svg"}
                        alt={`Image ${index + 1}`}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right side - Product details */}
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">{renderDetails(item)}</div>
              {userId && (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={favLoading || toggleFavorite.isPending}
                  onClick={() => toggleFavorite.mutate(isFav)}
                  className={`${
                    isFav ? "text-red-500" : "text-gray-400"
                  } hover:text-red-600 hover:cursor-pointer transition-colors`}
                >
                  <Heart
                    className={`h-7 w-7 hover:cursor-pointer ${
                      isFav ? "fill-red-500" : ""
                    }`}
                  />
                </Button>
              )}
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

            <div className="flex gap-3">
              <MessageSellerButton
                className="flex-1 bg-[#F3D58D] hover:bg-[#F3D58D]/90 text-black font-medium py-3 hover:cursor-pointer"
                postId={item.post_id}
                sellerId={item.post_user_id}
              />
              <Button variant="outline" className="flex-1 py-3 bg-transparent hover:cursor-pointer">
                Make an Offer
              </Button>
            </div>

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

      {/* Lightbox Modal */}
      {isModalOpen && imgCount > 0 && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative w-full max-w-6xl h-[90vh] px-12"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute top-4 right-4 bg-white/95 hover:bg-white rounded-full p-2 shadow z-50"
              onClick={() => setIsModalOpen(false)}
              aria-label="Close image viewer"
            >
              <X className="h-6 w-6 text-black" />
            </button>

            {imgCount > 1 && (
              <button
                type="button"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white rounded-full p-3 shadow z-50"
                onClick={goPrev}
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6 text-black" />
              </button>
            )}

            {imgCount > 1 && (
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white rounded-full p-3 shadow z-50"
                onClick={goNext}
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6 text-black" />
              </button>
            )}

            <div className="flex items-center justify-center w-full h-full">
              <img
                src={images[selectedImageIndex] || "/placeholder.svg"}
                alt="Full view"
                className="max-h-[90vh] max-w-full object-contain"
                draggable={false}
              />
            </div>

            {imgCount > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full z-50">
                {selectedImageIndex + 1} / {imgCount}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
