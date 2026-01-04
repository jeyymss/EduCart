"use client";

import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";

interface Post {
  id: string;
  item_title: string;
  item_price: number | null;
  images: string[] | null;
  status: string | null;
  created_at: string;
  post_types?: {
    name: string;
  } | null;
  categories?: {
    name: string;
  } | null;
}

interface UserPostsListProps {
  posts: Post[];
  totalPosts: number;
}

const getPostTypeName = (post: Post) => {
  // Handle both array and object formats
  if (Array.isArray(post.post_types) && post.post_types.length > 0) {
    return (post.post_types as any)[0]?.name || "Unknown";
  }
  return post.post_types?.name || "Unknown";
};

const getStatusBadgeColor = (status: string | null) => {
  switch (status?.toLowerCase()) {
    case "available":
      return "bg-green-100 text-green-700 border-green-200";
    case "sold":
    case "completed":
      return "bg-gray-100 text-gray-700 border-gray-200";
    case "pending":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    default:
      return "bg-gray-100 text-gray-600 border-gray-200";
  }
};

export function UserPostsList({ posts, totalPosts }: UserPostsListProps) {
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Package className="h-8 w-8 text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-900 mb-1">No listings yet</p>
        <p className="text-xs text-gray-500">This user hasn&apos;t posted any items</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {posts.map((post) => (
        <div
          key={post.id}
          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3">
              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 mb-1 truncate">
                  {post.item_title}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {post.item_price && (
                    <span className="text-sm font-bold text-[#FDB813]">
                      ₱{Number(post.item_price).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </span>
                  )}
                  <Badge variant="secondary" className="text-xs">
                    {getPostTypeName(post)}
                  </Badge>
                  <Badge className={`text-xs ${getStatusBadgeColor(post.status)} border capitalize`}>
                    {post.status || 'Unknown'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
