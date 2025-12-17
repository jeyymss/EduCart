"use client";

import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAddGiveawayComment } from "@/hooks/queries/GiveawayPosts";
import { getRelativeTime } from "@/utils/getRelativeTime";
import { useUserProfile } from "@/hooks/useUserProfile";
import { GiveawayComment } from "@/hooks/queries/GiveawayPosts";
import { createPortal } from "react-dom";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";


export default function CommentItem({
  comment,
  postId,
  sellerId,
}: {
  comment: GiveawayComment;
  postId: string;
  sellerId: string;
}) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReplies, setShowReplies] = useState(false);
  const [showPickModal, setShowPickModal] = useState(false);

  const addComment = useAddGiveawayComment(postId);
  const { data: profile } = useUserProfile();

  const isSellerViewer = profile?.user_id === sellerId;
  const isCommenterSeller = comment.user_id === sellerId;

  const router = useRouter();
  const supabase = createClient();

  const handleReply = () => {
    if (!replyText.trim()) return;
    addComment.mutate({ body: replyText, parentId: comment.id });
    setReplyText("");
    setShowReply(false);
  };

  // ✅ FIXED — clean, correct version
  const handlePickConfirm = async () => {
    setShowPickModal(false);

    try {
      const { data: conversationId, error } = await supabase.rpc(
        "start_chat_with_user",
        {
          input_post_id: postId,           // the giveaway post
          input_user_id: comment.user_id,  // winner
        }
      );

      if (error) {
        console.error("❌ Failed to start chat with winner:", error.message);
        return;
      }

      if (conversationId) {
        router.push(`/messages/${conversationId}`);
      }
    } catch (err: any) {
      console.error("❌ Unexpected error starting chat:", err.message || err);
    }
  };

  return (
    <>
      <div className="flex items-start gap-2 py-2">
        <Avatar>
          <AvatarImage src={comment.avatar_url || ""} />
          <AvatarFallback>{comment.full_name?.[0]}</AvatarFallback>
        </Avatar>

        <div className="flex-1">

          {/* NAME + PICK BUTTON */}
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">{comment.full_name}</p>

            {/* Pick button only if seller AND commenter != seller */}
            {isSellerViewer && !isCommenterSeller && (
              <button
                onClick={() => setShowPickModal(true)}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                Pick
              </button>
            )}
          </div>

          <p className="text-sm text-gray-700">{comment.content}</p>
          <p className="text-xs text-gray-500">{getRelativeTime(comment.created_at)}</p>

          <div className="flex gap-3 mt-1 text-xs text-gray-600">
            <button onClick={() => setShowReply(!showReply)}>
              {showReply ? "Cancel" : "Reply"}
            </button>
          </div>

          {/* Reply input */}
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
                disabled={addComment.isPending || !replyText.trim()}
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
                  className="text-sm text-[#102E4A] hover:underline mt-1"
                >
                  View {comment.replies.length}{" "}
                  {comment.replies.length > 1 ? "replies" : "reply"}
                </button>
              )}

              {showReplies && (
                <>
                  {comment.replies.map((r) => (
                    <CommentItem
                      key={r.id}
                      comment={r}
                      postId={postId}
                      sellerId={sellerId}
                    />
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

      {/* PICK CONFIRMATION MODAL */}
      {showPickModal &&
        createPortal(
          <div className="fixed inset-0 z-[99999] bg-black/40 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg p-6 w-[90%] max-w-sm">
              <h2 className="text-lg text-center">
                Choose <span className="font-bold">{comment.full_name}</span> as the giveaway winner?
              </h2>

              <div className="flex justify-center gap-4 mt-6">
                <button
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
                  onClick={() => setShowPickModal(false)}
                >
                  Cancel
                </button>

                <button
                  className="px-4 py-2 rounded bg-[#F3D58D] hover:bg-[#E8C26A] text-[#102E4A]"
                  onClick={handlePickConfirm}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
