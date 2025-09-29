"use client";
import { useState } from "react";

type Props = {
  postId: string;
  likeCount: number;
  isLiked: boolean;
};

export default function LikeButton({ postId, likeCount, isLiked }: Props) {
  const [liked, setLiked] = useState(isLiked);
  const [count, setCount] = useState(likeCount);

  const toggleLike = async () => {
    setLiked(!liked);
    setCount((c) => c + (liked ? -1 : 1));

    await fetch("/api/posts/toggleLike", {
      method: "POST",
      body: JSON.stringify({ postId }),
    });
  };

  return (
    <button
      onClick={toggleLike}
      className={`flex items-center gap-1 text-sm ${
        liked ? "text-red-500" : "text-gray-500"
      }`}
    >
      ❤️ {count}
    </button>
  );
}
