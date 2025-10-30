"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { useUserReviews } from "@/hooks/queries/useUserReviews";

export default function UserReviews({ userId }: { userId: string }) {
  const { data: reviews = [], isLoading, error } = useUserReviews(userId);

  if (isLoading)
    return <p className="text-gray-500 text-sm">Loading reviews...</p>;

  if (error)
    return (
      <p className="text-red-500 text-sm">
        Failed to load reviews. Please try again later.
      </p>
    );

  if (reviews.length === 0)
    return (
      <div className="text-center text-gray-500 text-sm py-8">
        No reviews yet.
      </div>
    );

  return (
    <div className="space-y-6">
      {reviews.map((r) => (
        <div
          key={r.id}
          className="flex gap-4 border-b pb-4 last:border-b-0"
        >
          {/* Avatar */}
          <div className="flex-shrink-0">
            <Image
              src={r.reviewer_avatar ?? "/avatarplaceholder.png"}
              alt={r.reviewer_name ?? "Reviewer"}
              width={48}
              height={48}
              className="rounded-full object-cover"
            />
          </div>

          {/* Review content */}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="font-semibold">
                {r.reviewer_name ?? "Unknown User"}
              </p>
              <p className="text-xs text-gray-400">
                {new Date(r.created_at).toLocaleDateString()}
              </p>
            </div>

            {/* Rating */}
            <div className="flex gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  size={16}
                  className={
                    i <= r.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }
                />
              ))}
            </div>

            {/* Comment */}
            {r.comment && (
              <p className="text-sm text-gray-700 mt-2">{r.comment}</p>
            )}

            {/* Reviewer details */}
            <p className="text-xs text-gray-500 mt-1">
              {r.reviewer_role ?? ""}
              {r.university_abbreviation
                ? ` • ${r.university_abbreviation}`
                : ""}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
