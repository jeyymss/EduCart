"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
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
import { Heart, X, ChevronLeft, ChevronRight } from "lucide-react";
import { getRelativeTime } from "@/utils/getRelativeTime";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useUserProfile } from "@/hooks/useUserProfile";

/* full-screen modal */
function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

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

  // images
  const images = useMemo<string[]>(
    () => (Array.isArray(post.image_urls) ? post.image_urls.filter(Boolean) : []),
    [post.image_urls]
  );
  const imgCount = images.length;

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const openModalAt = (idx: number) => {
    setSelectedImageIndex(idx);
    setIsModalOpen(true);
  };

  const goPrev = useCallback(() => {
    setSelectedImageIndex((i) => (imgCount ? (i - 1 + imgCount) % imgCount : 0));
  }, [imgCount]);

  const goNext = useCallback(() => {
    setSelectedImageIndex((i) => (imgCount ? (i + 1) % imgCount : 0));
  }, [imgCount]);

  // scroll lock
  useEffect(() => {
    if (!isModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsModalOpen(false);
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = original;
    };
  }, [isModalOpen, goPrev, goNext]);

  const visibleComments = showAllComments ? comments || [] : (comments || []).slice(0, 3);

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
          <p className="text-xs text-gray-500">{getRelativeTime(post.created_at)}</p>
        </div>
      </div>

      {/* Body */}
      <div className="px-4">
        <h3 className="text-lg font-semibold">{post.item_title}</h3>
        <div className="flex gap-2 mt-1 text-xs">
          {post.item_condition && (
            <span className="bg-gray-200 rounded px-2 py-0.5">{post.item_condition}</span>
          )}
          {post.category_name && (
            <span className="bg-gray-200 rounded px-2 py-0.5">{post.category_name}</span>
          )}
        </div>

        <p className="mt-2 text-gray-700">{post.item_description}</p>

        {/* Feed Image(s) */}
        {imgCount > 0 && (
          <div className="mt-3 mb-3">
            <button
              type="button"
              onClick={() => openModalAt(0)}
              className="relative block w-full overflow-hidden rounded-lg bg-black/5"
              aria-label="Open image"
            >
              <img
                src={images[0]}
                alt={post.item_title}
                className="w-full h-auto max-h-[520px] object-cover rounded-lg transition-transform duration-200 hover:scale-[1.01]"
                loading="lazy"
                decoding="async"
              />
              {imgCount > 1 && (
                <span className="absolute bottom-2 right-2 rounded-full bg-black/70 text-white text-xs px-2 py-1">
                  +{imgCount - 1} more
                </span>
              )}
            </button>

            {imgCount > 1 && (
              <div className="mt-2 flex gap-2 overflow-x-auto">
                {images.slice(1, 5).map((url, i) => (
                  <button
                    key={url + i}
                    onClick={() => openModalAt(i + 1)}
                    className="relative w-20 h-20 flex-none overflow-hidden rounded-md hover:opacity-90"
                    aria-label={`Open image ${i + 2}`}
                  >
                    <img src={url} alt={`Thumbnail ${i + 2}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer stats */}
      <div className="flex justify-end items-center px-4 py-2 border-t text-sm text-gray-600">
        <p>{post.comment_count} comments</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 px-4 py-2 border-t text-sm text-gray-600">
        <Button
          variant="ghost"
          size="sm"
          disabled={toggleLike.isPending}
          onClick={() => toggleLike.mutate()}
          className={`flex items-center gap-1 hover:cursor-pointer ${
            post.is_liked ? "text-red-500" : "text-gray-400"
          } hover:text-red-600 transition-colors`}
        >
          <span className="text-sm">{post.like_count}</span>
          <Heart className={`h-6 w-6 ${post.is_liked ? "fill-red-500" : ""}`} />
        </Button>

        <Button variant="ghost" className="flex items-center gap-1 hover:text-blue-500 transition-colors">
          Comment
        </Button>
      </div>

      {/* Comments */}
      <div className="px-4 py-2">
        {visibleComments.map((c) => (
          <Comment key={c.id} comment={c} postId={post.id} />
        ))}

        {!showAllComments && comments && comments.length > 3 && (
          <button onClick={() => setShowAllComments(true)} className="text-sm text-blue-600 mt-2">
            View all {comments.length} comments
          </button>
        )}

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

      {/* FULL-SCREEN MODAL */}
      {isModalOpen && imgCount > 0 && (
        <Portal>
          <div
            className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center"
            onClick={() => setIsModalOpen(false)}
            aria-modal="true"
            role="dialog"
          >
            <div
              className="relative w-full h-full flex items-center justify-center p-4 md:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative inline-flex items-center">
                {/* Image frame */}
                <div
                  className="
                    relative overflow-hidden rounded-lg shadow-2xl
                    max-w-[min(92vw,56rem)] max-h-[80vh] bg-black/10
                  "
                >
                  <img
                    src={images[selectedImageIndex] || "/placeholder.svg"}
                    alt="Full view"
                    className="block w-auto h-auto max-w-[min(92vw,56rem)] max-h-[80vh] object-contain"
                    draggable={false}
                  />
                </div>

                {/* LEFT arrow */}
                {imgCount > 1 && (
                  <button
                    type="button"
                    className="absolute left-[-3.5rem] top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white rounded-full p-3 shadow"
                    onClick={goPrev}
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-6 w-6 text-black" />
                  </button>
                )}

                {/* RIGHT arrow */}
                {imgCount > 1 && (
                  <button
                    type="button"
                    className="absolute right-[-3.5rem] top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white rounded-full p-3 shadow"
                    onClick={goNext}
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-6 w-6 text-black" />
                  </button>
                )}

                <button
                  type="button"
                  className="absolute right-[-3.5rem] -top-4 bg-white/95 hover:bg-white rounded-full p-2 shadow"
                  onClick={() => setIsModalOpen(false)}
                  aria-label="Close image viewer"
                >
                  <X className="h-5 w-5 text-black" />
                </button>

                {/* Counter under the frame */}
                {imgCount > 1 && (
                  <div className="absolute left-1/2 -translate-x-1/2 mt-[calc(100%+12px)] text-white text-sm bg-black/50 inline-block px-3 py-1 rounded-full">
                    {selectedImageIndex + 1} / {imgCount}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}

/* Comment Component */
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
  const addComment = useAddGiveawayComment(postId);

  const handleReply = () => {
    if (!replyText.trim()) return;
    addComment.mutate({ body: replyText, parentId: comment.id });
    setReplyText("");
    setShowReply(false);
  };

  return (
    <div className="flex items-start gap-2 py-2">
      <Avatar>
        <AvatarImage src={comment.avatar_url || ""} className="object-cover" />
        <AvatarFallback>{comment.full_name?.[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p className="text-sm font-medium">{comment.full_name}</p>
        <p className="text-sm text-gray-700">{comment.content}</p>
        <p className="text-xs text-gray-500">{getRelativeTime(comment.created_at)}</p>

        <div className="flex gap-3 mt-1 text-xs text-gray-600">
          <button onClick={() => setShowReply((prev) => !prev)}>
            {showReply ? "Cancel" : "Reply"}
          </button>
        </div>

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

        {comment.replies?.length > 0 && (
          <div className="ml-8 mt-2 border-l pl-3">
            {comment.replies.slice(0, showReplies ? undefined : 1).map((r) => (
              <Comment key={r.id} comment={r} postId={postId} />
            ))}
            {comment.replies.length > 1 && !showReplies && (
              <button onClick={() => setShowReplies(true)} className="text-sm text-blue-600 mt-1">
                View all {comment.replies.length} replies
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
