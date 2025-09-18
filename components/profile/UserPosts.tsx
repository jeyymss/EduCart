"use client";

import {
  ItemCard,
  ItemCardSkeleton,
} from "@/components/posts/displayposts/ItemCard";
import { useUserPosts } from "@/hooks/queries/displayItems";

export type UserPost = {
  post_id: string;
  item_title: string;
  item_price: number | null;
  item_condition: string | null;
  category_name: string | null;
  post_type_name: string | null;
  created_at: string;
  image_urls: string[];
  full_name: string;
  status: "Listed" | "Sold" | "Unlisted";
};

type UserPostsProps = {
  userId: string;
  status?: "Listed" | "Sold" | "Unlisted";
};

export function UserPosts({ userId, status }: UserPostsProps) {
  const { data: posts, isLoading, error } = useUserPosts(userId, status);

  if (error)
    return <p className="text-red-600">Error: {(error as Error).message}</p>;

  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="w-full max-w-sm mx-auto">
            <ItemCardSkeleton />
          </div>
        ))}
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <p className="text-center text-gray-500 mt-4">
        {status
          ? `No ${status.toLowerCase()} posts yet.`
          : "You haven’t posted anything yet."}
      </p>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-3">
      {posts.map((item: UserPost) => (
        <div key={item.post_id} className="w-full max-w-sm mx-auto">
          <ItemCard
            id={item.post_id}
            title={item.item_title}
            price={item.item_price ?? undefined}
            condition={item.item_condition ?? ""}
            category_name={item.category_name ?? ""}
            post_type={item.post_type_name ?? ""}
            created_at={item.created_at}
            image_urls={item.image_urls ?? []}
            seller={item.full_name}
            isOwner={true}
            status={item.status}
            onEdit={(id) => console.log("Edit", id)}
            onDelete={(id) => console.log("Delete", id)}
          />
        </div>
      ))}
    </div>
  );
}

/* ✅ Subcomponent for count */
UserPosts.Count = function UserPostsCount({
  userId,
  status,
}: {
  userId: string;
  status?: "Listed" | "Sold" | "Unlisted";
}) {
  const { data: posts, isLoading } = useUserPosts(userId, status);
  if (isLoading) return <>…</>;
  return <>{posts?.length ?? 0}</>;
};
