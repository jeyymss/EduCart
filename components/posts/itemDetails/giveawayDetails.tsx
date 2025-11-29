"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import {
  useGiveawayComments,
  useAddGiveawayComment,
  useToggleGiveawayLike,
  GiveawayComment,
} from "@/hooks/queries/GiveawayPosts";
import { getRelativeTime } from "@/utils/getRelativeTime";
import { useState } from "react";

function CommentItem({ comment, postId }: { comment: GiveawayComment; postId: string }) {
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
      <Avatar className="h-8 w-8">
        <AvatarImage src={comment.avatar_url || ""} />
        <AvatarFallback>{comment.full_name?.[0]}</AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <p className="text-sm font-medium">{comment.full_name}</p>
        <p className="text-sm text-gray-700">{comment.content}</p>
        <p className="text-xs text-gray-500">{getRelativeTime(comment.created_at)}</p>

        <div className="flex gap-3 mt-1 text-xs text-gray-600">
          <button onClick={() => setShowReply(!showReply)}>
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
              onClick={handleReply}
              disabled={!replyText.trim()}
              className="text-sm px-3 py-1 rounded bg-[#F3D58D] hover:bg-[#E8C26A] text-[#102E4A]"
            >
              Post
            </button>
          </div>
        )}

        {/* Replies */}
        {comment.replies?.length > 0 && (
          <div className="ml-8 mt-2 border-l pl-3">
            {!showReplies && (
              <button
                onClick={() => setShowReplies(true)}
                className="text-sm text-[#102E4A] hover:underline"
              >
                View {comment.replies.length}{" "}
                {comment.replies.length > 1 ? "replies" : "reply"}
              </button>
            )}
            {showReplies && (
              <>
                {comment.replies.map((r) => (
                  <CommentItem key={r.id} comment={r} postId={postId} />
                ))}
                <button
                  onClick={() => setShowReplies(false)}
                  className="text-sm text-[#102E4A] hover:underline mt-1"
                >
                  Hide replies
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* MAIN GIVEAWAY DETAILS COMPONENT */
export default function GiveawayDetails({ item }: { item: any }) {
  const { data: comments } = useGiveawayComments(item.post_id);
  const addComment = useAddGiveawayComment(item.post_id);
  const toggleLike = useToggleGiveawayLike(item.post_id);

  const [text, setText] = useState("");
  const [showAll, setShowAll] = useState(false);

  // Show only 2 comments by default
  const visibleComments = showAll ? comments : comments?.slice(0, 2);

  return (
    <div className="space-y-6">

      {/* Title */}
      <h1 className="text-2xl font-bold">{item.item_title}</h1>

      {/* Tags */}
      <div className="flex gap-2 text-sm">
        {item.item_condition && (
          <span className="bg-gray-200 px-2 py-1 rounded">{item.item_condition}</span>
        )}
        {item.category_name && (
          <span className="bg-gray-200 px-2 py-1 rounded">{item.category_name}</span>
        )}
      </div>

      {/* Description */}
      <p className="text-gray-700">{item.item_description}</p>

      {/* Like */}
      <Button
        variant="ghost"
        className={`flex items-center gap-2 ${
          item.is_liked ? "text-red-500" : "text-gray-400"
        }`}
        onClick={() => toggleLike.mutate()}
      >
        <Heart className={item.is_liked ? "fill-red-500" : ""} />
        {item.like_count}
      </Button>

      {/* Comments Section */}
      <div className="space-y-4">
        <h2 className="font-semibold text-lg">Comments</h2>

        {/* Render comments */}
        {(visibleComments ?? []).map((c) => (
          <CommentItem key={c.id} comment={c} postId={item.post_id} />
        ))}

        {/* View More / Hide */}
        {comments && comments.length > 2 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-[#102E4A] hover:underline"
          >
            {showAll ? "Hide comments" : `View all ${comments.length} comments`}
          </button>
        )}

        {/* Add Comment */}
        <div className="flex gap-2 pt-2">
          <input
            className="border rounded px-3 py-2"
            placeholder="Write a comment..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Button
            disabled={!text.trim()}
            className="bg-[#F3D58D] hover:bg-[#E8C26A] text-[#102E4A]"
            onClick={() => {
              addComment.mutate({ body: text });
              setText("");
            }}
          >
            Post
          </Button>
        </div>
      </div>
    </div>
  );
}
