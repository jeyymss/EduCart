"use client";
import LikeButton from "../giveawayPost/likeButton";
import CommentsSection from "../giveawayPost/commentSection";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getRelativeTime } from "@/utils/getRelativeTime";
import type { GiveawayPost } from "@/hooks/queries/displayItems";

export default function GiveawayPostCard({ post }: { post: GiveawayPost }) {
  return (
    <div className="border rounded-lg bg-white shadow-sm">
      {/* Header */}
      {post.user && (
        <div className="flex items-center gap-3 px-4 py-3">
          <Avatar>
            <AvatarImage src={post.user.avatar_url || ""} />
            <AvatarFallback>{post.user.full_name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{post.user.full_name}</p>
            <p className="text-xs text-gray-500">
              {getRelativeTime(post.created_at)}
            </p>
          </div>
        </div>
      )}

      {/* Body */}
      <div className="px-4">
        <h3 className="text-lg font-semibold">{post.item_title}</h3>
        <div className="flex gap-2 mt-1 text-xs">
          {post.category_name && (
            <span className="bg-gray-200 rounded px-2 py-0.5">
              {post.category_name}
            </span>
          )}
          {post.condition && (
            <span className="bg-gray-200 rounded px-2 py-0.5">
              {post.condition}
            </span>
          )}
        </div>
        {post.item_description && (
          <p className="text-sm text-gray-700 mt-2">{post.item_description}</p>
        )}
      </div>

      {post.image_urls?.[0] && (
        <img
          src={post.image_urls[0]}
          alt={post.item_title}
          className="mt-3 h-64 w-full object-cover"
        />
      )}

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <LikeButton
            postId={post.id}
            likeCount={post.like_count}
            isLiked={post.is_liked}
          />
          <span className="text-sm text-gray-500">
            {post.comment_count} comments
          </span>
        </div>
      </div>

      {/* Comments */}
      <div className="px-4 pb-3">
        <CommentsSection postId={post.id} />
      </div>
    </div>
  );
}
