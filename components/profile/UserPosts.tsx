"use client";

import { ItemCard } from "@/components/posts/displayposts/ItemCard";
import { useUserPosts } from "@/hooks/queries/displayItems";

type UserPostsProps = {
  userId: string;
  status?: "Listed" | "Sold" | "Unlisted";
};

export function UserPosts({ userId, status }: UserPostsProps) {
  const { data: posts, isLoading, error } = useUserPosts(userId, status);

  if (error)
    return <p className="text-red-600">Error: {(error as Error).message}</p>;
  if (isLoading) return <p>Loading...</p>;

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
    <div className="grid gap-4 grid-cols-1 md:grid-cols-3 xl:grid-cols-5 mt-3">
      {posts.map((item: any) => (
        <ItemCard
          key={item.post_id}
          id={item.post_id}
          title={item.item_title}
          price={item.item_price}
          condition={item.item_condition}
          category_name={item.category_name}
          post_type={item.post_type_name}
          created_at={item.created_at}
          image_urls={item.image_urls}
          seller={item.full_name}
          isOwner={true}
          onEdit={(id) => console.log("Edit", id)}
          status={item.status}
          onDelete={(id) => console.log("Delete", id)}
        />
      ))}
    </div>
  );
}
