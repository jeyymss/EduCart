"use client";

import Image from "next/image";
import { useProductDetails } from "@/hooks/displayItems";
import { useParams } from "next/navigation";
import SaleDetails from "@/components/posts/itemDetails/saleDetails";
import RentDetails from "@/components/posts/itemDetails/rentDetails";
import TradeDetails from "@/components/posts/itemDetails/tradeDetails";
import { getRelativeTime } from "@/utils/getRelativeTime";

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

  if (!id || id === "NaN") {
    return <div className="text-red-600">Invalid or missing item ID</div>;
  }

  if (error) {
    return (
      <div className="text-red-600">
        <h1>Item not found or error: {error.message}</h1>
      </div>
    );
  }

  if (isLoading || !item) {
    return <p className="p-10">Loading...</p>;
  }

  console.log("🕒 item.created_at =", item.created_at);

  return (
    <div className="space-y-4 p-10">
      {renderDetails(item)}

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
