"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import CommentItem from "../giveawayPost/comment-item";

/* Full-screen modal portal */
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
  const { data: profile } = useUserProfile();

  const [newComment, setNewComment] = useState("");
  const [showAllComments, setShowAllComments] = useState(false);

  const profileLink =
    profile?.id === post.post_user_id ? `/profile` : `/${post.post_user_id}`;

  // images
  const images = useMemo<string[]>(
    () => (Array.isArray(post.image_urls) ? post.image_urls.filter(Boolean) : []),
    [post.image_urls]
  );
  const imgCount = images.length;

  // modal
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

  const visibleComments = showAllComments ? comments || [] : (comments || []).slice(0, 1);
  const hasMoreThanOne = (comments?.length || 0) > 1;

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

        {/* Image */}
        {imgCount > 0 && (
          <div className="mt-3 mb-3">
            <button
              onClick={() => openModalAt(0)}
              className="relative block w-full overflow-hidden rounded-lg bg-black/5"
            >
              <img
                src={images[0]}
                alt={post.item_title}
                className="w-full h-auto max-h-[520px] object-cover rounded-lg transition-transform duration-200 hover:scale-[1.01]"
                loading="lazy"
              />
              {imgCount > 1 && (
                <span className="absolute bottom-2 right-2 rounded-full bg-black/70 text-white text-xs px-2 py-1">
                  +{imgCount - 1} more
                </span>
              )}
            </button>
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

        <Button variant="ghost" className="flex items-center gap-1 transition-colors hover:text-[#102E4A]">
          Comment
        </Button>
      </div>

      {/* Comments */}
      <div className="px-4 py-2">
        {visibleComments.map((c) => (
          <CommentItem
            key={c.id}
            comment={c}
            postId={post.id}
            sellerId={post.post_user_id}   
          />
        ))}

        {!showAllComments && hasMoreThanOne && (
          <button
            onClick={() => setShowAllComments(true)}
            className="text-sm mt-2 text-[#102E4A] hover:underline"
          >
            View all comments
          </button>
        )}
        {showAllComments && hasMoreThanOne && (
          <button
            onClick={() => setShowAllComments(false)}
            className="text-sm mt-2 text-[#102E4A] hover:underline"
          >
            Hide comments
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
            disabled={addComment.isPending || !newComment.trim()}
            onClick={() => {
              if (!newComment.trim()) return;
              addComment.mutate({ body: newComment });
              setNewComment("");
            }}
            className="bg-[#F3D58D] hover:bg-[#E8C26A] text-[#102E4A]"
          >
            Post
          </Button>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && imgCount > 0 && (
        <Portal>
          <ModalWithResponsiveGestures
            images={images}
            index={selectedImageIndex}
            setIndex={setSelectedImageIndex}
            onClose={() => setIsModalOpen(false)}
            goPrev={goPrev}
            goNext={goNext}
            count={imgCount}
          />
        </Portal>
      )}
    </div>
  );
}

/* ----------------------------------------------
  mobile swipe + hard scroll lock
-----------------------------------------------*/
function ModalWithResponsiveGestures({
  images,
  index,
  setIndex,
  onClose,
  goPrev,
  goNext,
  count,
}: {
  images: string[];
  index: number;
  setIndex: (i: number) => void;
  onClose: () => void;
  goPrev: () => void;
  goNext: () => void;
  count: number;
}) {
  useEffect(() => {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const { style } = document.body;
    const prev = {
      top: style.top,
      position: style.position,
      width: style.width,
      overflow: style.overflow,
    };
    style.position = "fixed";
    style.top = `-${scrollY}px`;
    style.width = "100%";
    style.overflow = "hidden";
    return () => {
      style.position = prev.position;
      style.top = prev.top;
      style.width = prev.width;
      style.overflow = prev.overflow;
      window.scrollTo(0, scrollY);
    };
  }, []);

  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const lastX = useRef<number>(0);
  const lastT = useRef<number>(0);
  const deltaX = useRef(0);
  const isSwiping = useRef(false);
  const imgWrapRef = useRef<HTMLDivElement | null>(null);

  const TOUCH_THRESHOLD = 30;
  const ANGLE_LOCK = 25;
  const FLICK_VELOCITY = 0.45;

  const setTranslate = (x: number, withTransition = false) => {
    if (!imgWrapRef.current) return;
    imgWrapRef.current.style.transition = withTransition ? "transform 200ms ease-out" : "none";
    imgWrapRef.current.style.transform = `translateX(${x}px)`;
  };

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    startX.current = t.clientX;
    startY.current = t.clientY;
    deltaX.current = 0;
    isSwiping.current = false;
    lastX.current = t.clientX;
    lastT.current = e.timeStamp;
    setTranslate(0, false);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (startX.current == null || startY.current == null) return;
    const t = e.touches[0];
    const dx = t.clientX - startX.current;
    const dy = t.clientY - startY.current;
    const angle = Math.abs((Math.atan2(dy, dx) * 180) / Math.PI);

    if (angle < ANGLE_LOCK || angle > 180 - ANGLE_LOCK) {
      isSwiping.current = true;
      deltaX.current = dx;
      setTranslate(dx * 0.15, false);
      lastX.current = t.clientX;
      lastT.current = e.timeStamp;
      e.preventDefault();
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const dt = Math.max(1, e.timeStamp - lastT.current);
    const vx = (lastX.current - (startX.current ?? lastX.current)) / dt;

    const shouldFlickNext = vx < -FLICK_VELOCITY;
    const shouldFlickPrev = vx > FLICK_VELOCITY;

    setTranslate(0, true);

    if (!isSwiping.current) return;

    const abs = Math.abs(deltaX.current);
    if (abs > TOUCH_THRESHOLD || shouldFlickNext || shouldFlickPrev) {
      if (deltaX.current < 0 || shouldFlickNext) goNext();
      else goPrev();
    }

    startX.current = null;
    startY.current = null;
    deltaX.current = 0;
    isSwiping.current = false;

    setTimeout(() => {
      if (imgWrapRef.current) imgWrapRef.current.style.transition = "none";
    }, 210);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="relative w-full h-full flex items-center justify-center p-4 md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative inline-flex items-center">
          {/* Image container */}
          <div
            ref={imgWrapRef}
            className="relative overflow-hidden rounded-lg shadow-2xl bg-black/10 will-change-transform touch-pan-y"
            style={{ maxWidth: "96vw", maxHeight: "90vh" }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <img
              src={images[index] || "/placeholder.svg"}
              alt="Full view"
              className="block w-[96vw] md:w-auto h-auto max-w-[96vw] md:max-w-[min(92vw,56rem)] max-h-[90vh] object-contain select-none"
              draggable={false}
            />
            {count > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs text-white bg-black/60">
                {index + 1} / {count}
              </div>
            )}
          </div>

          {count > 1 && (
            <>
              <button
                className="hidden md:flex absolute md:-left-16 top-1/2 -translate-y-1/2 bg-white/95 rounded-full p-3 shadow hover:bg-white"
                onClick={goPrev}
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6 text-black" />
              </button>
              <button
                className="hidden md:flex absolute md:-right-16 top-1/2 -translate-y-1/2 bg-white/95 rounded-full p-3 shadow hover:bg-white"
                onClick={goNext}
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6 text-black" />
              </button>
            </>
          )}

          <button
            className="absolute right-2 top-2 md:-top-4 md:-right-14 bg-white/95 hover:bg-white rounded-full p-2 shadow"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-5 w-5 text-black" />
          </button>
        </div>
      </div>
    </div>
  );
}


