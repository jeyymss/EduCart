"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import PostTypeBadge from "@/components/postTypeBadge";
import { useRelatedItems } from "@/hooks/queries/displayItems";

interface RelatedItemsProps {
  currentPostId: string;
  categoryName: string;
  postType: string;
}

export default function RelatedItems({
  currentPostId,
  categoryName,
  postType,
}: RelatedItemsProps) {
  const { data: relatedItems, isLoading } = useRelatedItems(
    currentPostId,
    categoryName,
    postType
  );

  if (isLoading) {
    return (
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="h-8 w-48 bg-gray-200 animate-pulse rounded mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-square bg-gray-200 animate-pulse rounded-xl" />
                <div className="h-4 bg-gray-200 animate-pulse rounded" />
                <div className="h-3 bg-gray-200 animate-pulse rounded w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!relatedItems || relatedItems.length === 0) {
    return null;
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#102E4A]">
            Related Items in {categoryName}
          </h2>
          <Link
            href={`/browse?category=${encodeURIComponent(categoryName)}`}
            className="text-sm text-[#E59E2C] hover:text-[#102E4A] font-medium flex items-center gap-1 transition-colors"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Related Items Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {relatedItems.map((item) => (
            <Link
              key={item.id}
              href={`/product/${item.id}`}
              className="group"
            >
              <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <Image
                    src={item.image_urls[0] || "/placeholder.svg"}
                    alt={item.item_title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Post Type Badge */}
                  <div className="absolute top-2 left-2">
                    <PostTypeBadge type={item.post_type_name} className="text-xs" />
                  </div>
                </div>

                {/* Details */}
                <div className="p-3 space-y-1">
                  <h3 className="font-medium text-sm text-[#102E4A] line-clamp-2 group-hover:text-[#E59E2C] transition-colors">
                    {item.item_title}
                  </h3>
                  {item.item_price !== null && (
                    <p className="text-[#E59E2C] font-semibold text-base">
                      ₱{item.item_price.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
