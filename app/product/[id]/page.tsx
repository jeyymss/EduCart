"use client";

import Image from "next/image";
import { useProductDetails } from "@/hooks/displayItems";
import { useParams } from "next/navigation";

function getRelativeTime(timestamp: string): string {
  const now = new Date();
  const created = new Date(timestamp);
  const diffMs = now.getTime() - created.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;

  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs} hour${diffHrs > 1 ? "s" : ""} ago`;

  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? "s" : ""} ago`;

  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
}

export default function ItemDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: item, isLoading, error } = useProductDetails(id);

  if (item) {
    /* item.image_urls.forEach((element) => {
      console.log(element);
    }); */
    console.log(item.image_urls); // "string"
  }

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

  return (
    <div className="space-y-2 p-10">
      <h1 className="text-xl font-bold">{item.item_title}</h1>
      <h1 className="text-xl font-bold text-green-600">{item.category_name}</h1>
      {item.item_description && <p>{item.item_description}</p>}
      {item.post_type_name && <p>{item.post_type_name}</p>}
      {item.created_at && (
        <p className="text-sm text-gray-500">
          Listed {getRelativeTime(item.created_at)}
        </p>
      )}
      {item.item_price !== null && <p>₱{item.item_price}</p>}
      {item.full_name && (
        <p className="text-gray-600">Posted by: {item.full_name}</p>
      )}

      {Array.isArray(item.image_urls) && item.image_urls.length > 0 && (
        <div className="flex gap-4 mt-4 flex-wrap">
          {item.image_urls.map((url: string, index: number) => (
            <div key={index} className="relative w-40 h-40">
              <Image
                src={url}
                alt={`${item.item_title} image ${index + 1}`}
                fill
                className="object-cover rounded-lg"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
