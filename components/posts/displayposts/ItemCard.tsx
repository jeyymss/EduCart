import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getRelativeTime } from "@/utils/getRelativeTime";

type Props = {
  id: string;
  title: string;
  price?: number;
  seller: string;
  condition: string;
  category_name: string;
  post_type: string;
  created_at: string;
  image_urls: string[];
};

const typeBadgeStyles: Record<string, string> = {
  Sale: "bg-[#4B657A] text-white",
  Giveaway: "bg-[#7A2E2E] text-white",
  Rent: "bg-[#54766B] text-white",
  PasaBuy: "bg-[#785A28] text-white",
  "Emergency Lending": "bg-[#A02B2B] text-white",
  Trade: "bg-red-600 text-white",
};

export function ItemCard({
  id,
  title,
  price,
  category_name,
  post_type,
  created_at,
  image_urls,
}: Props) {
  const imageSrc =
    image_urls?.[0] && image_urls[0].trim() !== ""
      ? image_urls[0]
      : "/fallback.png";

  return (
    <Link href={`/product/${id}`}>
      <div className="rounded-md overflow-hidden border border-gray-200 shadow hover:shadow-md transition cursor-pointer bg-white flex flex-col h-full">
        <div className="relative w-full h-60">
          <Image
            src={imageSrc}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <span
            className={`absolute top-2 left-2 text-xs px-2 py-0.5 rounded font-medium shadow ${
              typeBadgeStyles[post_type] || "bg-gray-400 text-white"
            }`}
          >
            {post_type}
          </span>
        </div>
        <div className="p-3 flex flex-col flex-grow justify-between">
          <div className="space-y-1">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-lg font-semibold text-[#333333] line-clamp-2 min-h-[52px]">
                {title}
              </h2>
              <span className="text-xs border border-[#B8B8B8] px-2 py-0.5 rounded-full text-[#333333] flex-shrink-0">
                {category_name}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[#E59E2C] font-medium text-sm">
              {price != null
                ? `₱${price.toLocaleString()}`
                : "Price not listed"}
            </span>
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              {getRelativeTime(created_at)}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function ItemCardSkeleton() {
  return (
    <div className="rounded-md overflow-hidden border border-gray-200 shadow bg-white flex flex-col h-full animate-pulse">
      <div className="relative w-full h-60">
        <div className="absolute inset-0">
          <Skeleton className="w-full h-full bg-gray-300" />
        </div>
        <Skeleton className="absolute top-2 left-2 h-5 w-16 rounded-full bg-gray-400" />
      </div>

      <div className="p-3 flex flex-col flex-grow justify-between">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <Skeleton className="h-4 w-3/4 rounded bg-gray-400" />
            <Skeleton className="h-5 w-14 rounded-full bg-gray-400" />
          </div>
          <Skeleton className="h-4 w-2/3 rounded bg-gray-300" />
        </div>

        <div className="flex items-center justify-between mt-4">
          <Skeleton className="h-4 w-20 rounded bg-gray-300" />
          <Skeleton className="h-4 w-16 rounded bg-gray-300" />
        </div>
      </div>
    </div>
  );
}
