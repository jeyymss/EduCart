import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";

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
  Trade: "bg-[#3E5A73] text-white",
};

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

  const formatName = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 0) return "";

    const firstName = parts[0];
    const lastName = parts[parts.length - 1];
    const lastInitial = lastName.charAt(0).toUpperCase();

    return `${firstName} ${lastInitial}.`;
  };

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
              {price !== undefined
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
