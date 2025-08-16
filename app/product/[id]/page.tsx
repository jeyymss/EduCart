"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProductDetails } from "@/hooks/displayItems";
import { useParams } from "next/navigation";
import SaleDetails from "@/components/posts/itemDetails/saleDetails";
import RentDetails from "@/components/posts/itemDetails/rentDetails";
import TradeDetails from "@/components/posts/itemDetails/tradeDetails";
import { getRelativeTime } from "@/utils/getRelativeTime";
import { usePublicProfile } from "@/hooks/profiles";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderDetails(item: any) {
  switch (item.post_type_name) {
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
  const id = params.id as string;

  const { data: item, isLoading, error } = useProductDetails(id);

  // once item is loaded, fetch seller public profile for avatar
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const listerUserId = (item as any)?.post_user_id as string | undefined;
  const { data: lister } = usePublicProfile(listerUserId);

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
    <div className="space-y-6 p-10">
      {renderDetails(item)}

      {/* Lister card */}
      {item.post_user_id && (
        <div className="flex items-center justify-between border rounded-2xl p-4">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-12 w-12">
              <AvatarImage
                key={avatarSrc ?? "no-avatar"}
                src={avatarSrc}
                alt={item.full_name ?? "Lister"}
              />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <p className="font-medium truncate">
                {item.full_name ?? "Lister"}
              </p>
            </div>
          </div>

          <Button asChild variant="secondary">
            <Link href={`/${item.post_user_id}`}>View lister</Link>
          </Button>
        </div>
      )}

      {item.created_at && (
        <p className="text-sm text-gray-500">
          Listed {getRelativeTime(item.created_at)}
        </p>
      )}

      {Array.isArray(item.image_urls) && item.image_urls.length > 0 && (
        <div className="flex gap-4 flex-wrap">
          {item.image_urls.map((url: string, index: number) => (
            <div key={index} className="relative w-40 h-40">
              <Image
                src={url}
                alt={`Image ${index + 1}`}
                fill
                className="object-cover rounded"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
