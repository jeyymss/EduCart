"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { useState } from "react";
import { useUserReviews } from "@/hooks/queries/useUserReviews";

export default function UserReviews({ userId }: { userId: string }) {
  const { data: reviews = [], isLoading, error } = useUserReviews(userId);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;

  // Derived pagination values
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const startIndex = (currentPage - 1) * reviewsPerPage;
  const currentReviews = reviews.slice(startIndex, startIndex + reviewsPerPage);

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
      {/* Reviews list */}
      {currentReviews.map((r) => (
        <div
          key={r.id}
          className="flex flex-col sm:flex-row gap-4 border-b pb-4 last:border-b-0"
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
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-sm sm:text-base">
                  {r.reviewer_name ?? "Unknown User"}
                </p>
                {/* Badge under or beside name */}
                {(r.reviewer_role || r.university_abbreviation) && (
                  <div className="flex flex-wrap items-center gap-1 mt-0.5">
                    {r.reviewer_role && (
                      <span className="text-xs text-gray-600">
                        {r.reviewer_role}
                      </span>
                    )}
                    {r.university_abbreviation && (
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                        {r.university_abbreviation}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1 sm:mt-0">
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
              <p className="text-sm text-gray-700 mt-2 whitespace-pre-line">
                {r.comment}
              </p>
            )}
          </div>
        </div>
      ))}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 pt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
          >
            Previous
          </button>

          <p className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </p>

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
