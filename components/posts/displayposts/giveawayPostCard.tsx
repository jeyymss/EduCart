"use client";

import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  useGiveawayPosts,
  useGiveawayComments,
  useToggleGiveawayLike,
  useAddGiveawayComment,
  GiveawayPost,
  GiveawayComment,
} from "@/hooks/queries/GiveawayPosts";
import { Heart } from "lucide-react";
import { getRelativeTime } from "@/utils/getRelativeTime";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUserProfile } from "@/hooks/useUserProfile";

export default function GiveawayFeed() {
  const { data: posts, isLoading } = useGiveawayPosts();

  if (isLoading) return <p>Loading posts...</p>;

  if (!posts || posts.length === 0) return <p>No giveaway posts yet.</p>;

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <GiveawayPostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

export function GiveawayPostCard({ post }: { post: GiveawayPost }) {
  const { data: comments } = useGiveawayComments(post.id);
  const toggleLike = useToggleGiveawayLike(post.id);
  const addComment = useAddGiveawayComment(post.id);

  const [newComment, setNewComment] = useState("");
  const [showAllComments, setShowAllComments] = useState(false);
  const { data: profile } = useUserProfile();

  const profileLink =
    profile?.id === post.post_user_id ? `/profile` : `/${post.post_user_id}`;

  // ✅ show only 3 unless expanded
  const visibleComments = showAllComments
    ? comments || []
    : (comments || []).slice(0, 3);

  return (
    <div className="border rounded-lg bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <Avatar>
          <AvatarImage src={post.user_avatar_url || ""} />
          <AvatarFallback>{post.user_name?.[0]}</AvatarFallback>
        </Avatar>
        <div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href={profileLink}>
                <p className="font-medium">{post.user_name}</p>
                <p className="text-xs text-gray-500">
                  {post.user_role} • {post.university_abbr}
                </p>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <h1>Visit Profile</h1>
            </TooltipContent>
          </Tooltip>

          <p className="text-xs text-gray-500">
            {getRelativeTime(post.created_at)}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="px-4">
        <h3 className="text-lg font-semibold">{post.item_title}</h3>
        <div className="flex gap-2 mt-1 text-xs">
          {post.item_condition && (
            <span className="bg-gray-200 rounded px-2 py-0.5">
              {post.item_condition}
            </span>
          )}
          {post.category_name && (
            <span className="bg-gray-200 rounded px-2 py-0.5">
              {post.category_name}
            </span>
          )}
        </div>
        <p className="mt-2 text-gray-700 mb-2">{post.item_description}</p>
        {post.image_urls?.[0] && (
          <img
            src={post.image_urls[0]}
            alt={post.item_title}
            className="w-full mt-3 mb-3 rounded-lg"
          />
        )}
      </div>

      {/* Footer stats */}
      <div className="flex justify-end items-center px-4 py-2 border-t text-sm text-gray-600">
        <p>{post.comment_count} comments</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 px-4 py-2 border-t text-sm text-gray-600">
        {/* Like Button with Heart + Count */}
        <Button
          variant="ghost"
          size="sm"
          disabled={toggleLike.isPending}
          onClick={() => toggleLike.mutate()}
          className={`flex items-center gap-1 hover:cursor-pointer ${
            post.is_liked ? "text-red-500" : "text-gray-400"
          } hover:text-red-600 transition-colors`}
        >
          {/* Counter */}
          <span className="text-sm">{post.like_count}</span>

          {/* Heart icon */}
          <Heart className={`h-6 w-6 ${post.is_liked ? "fill-red-500" : ""}`} />
        </Button>

        {/* Comment Button */}
        <Button
          variant="ghost"
          className="flex items-center gap-1 hover:text-blue-500 transition-colors"
        >
          Comment
        </Button>
      </div>

      {/* Comments */}
      <div className="px-4 py-2">
        {visibleComments.map((c) => (
          <Comment key={c.id} comment={c} postId={post.id} />
        ))}

        {/* View All Button */}
        {!showAllComments && comments && comments.length > 3 && (
          <button
            onClick={() => setShowAllComments(true)}
            className="text-sm text-blue-600 mt-2"
          >
            View all {comments.length} comments
          </button>
        )}

        {/* Add Comment */}
        <div className="mt-3 flex gap-2">
          <input
            className="border rounded px-2 py-1 flex-1"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <Button
            size="sm"
            onClick={() => {
              if (!newComment.trim()) return;
              addComment.mutate({ body: newComment });
              setNewComment("");
            }}
          >
            Post
          </Button>
        </div>
      </div>
    </div>
  );
}

function Comment({
  comment,
  postId,
}: {
  comment: GiveawayComment;
  postId: string;
}) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReplies, setShowReplies] = useState(false);

  // ✅ always use postId, not comment.post_id
  const addComment = useAddGiveawayComment(postId);

  const handleReply = () => {
    if (!replyText.trim()) return;
    addComment.mutate({ body: replyText, parentId: comment.id });
    setReplyText("");
    setShowReply(false); // hide box after posting
  };

  return (
    <div className="flex items-start gap-2 py-2">
      <Avatar>
        <AvatarImage src={comment.avatar_url || ""} />
        <AvatarFallback>{comment.full_name?.[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        {/* Comment Content */}
        <p className="text-sm font-medium">{comment.full_name}</p>
        <p className="text-sm text-gray-700">{comment.content}</p>
        <p className="text-xs text-gray-500">
          {getRelativeTime(comment.created_at)}
        </p>

        {/* Action buttons */}
        <div className="flex gap-3 mt-1 text-xs text-gray-600">
          <button onClick={() => setShowReply((prev) => !prev)}>
            {showReply ? "Cancel" : "Reply"}
          </button>
        </div>

        {/* Reply input (only visible when Reply is clicked) */}
        {showReply && (
          <div className="mt-2 flex gap-2">
            <input
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="border rounded px-2 py-1 text-sm flex-1"
              placeholder="Write a reply..."
            />
            <button
              className="text-sm text-blue-600"
              onClick={handleReply}
              disabled={addComment.isPending}
            >
              Post
            </button>
          </div>
        )}

        {/* Nested replies */}
        {comment.replies?.length > 0 && (
          <div className="ml-8 mt-2 border-l pl-3">
            {comment.replies.slice(0, showReplies ? undefined : 1).map((r) => (
              <Comment key={r.id} comment={r} postId={postId} /> // ✅ always forward postId
            ))}

            {comment.replies.length > 1 && !showReplies && (
              <button
                onClick={() => setShowReplies(true)}
                className="text-sm text-blue-600 mt-1"
              >
                View all {comment.replies.length} replies
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
