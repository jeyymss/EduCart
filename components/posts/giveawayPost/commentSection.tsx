"use client";
import { useState } from "react";

type Comment = {
  id: string;
  content: string;
  created_at: string;
  user_full_name: string;
};

export default function CommentsSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  const loadComments = async () => {
    setLoading(true);
    const res = await fetch(`/api/posts/comments?postId=${postId}`);
    const data = await res.json();
    setComments(data);
    setLoading(false);
  };

  return (
    <div className="mt-2">
      <button
        onClick={loadComments}
        className="text-xs text-blue-500 underline"
      >
        {loading ? "Loading..." : "View comments"}
      </button>
      <ul className="mt-2 space-y-1">
        {comments.map((c) => (
          <li key={c.id} className="text-sm">
            <span className="font-medium">{c.user_full_name}:</span> {c.content}
          </li>
        ))}
      </ul>
    </div>
  );
}
