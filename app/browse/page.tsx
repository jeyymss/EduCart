"use client";

import { ItemCard } from "@/components/posts/displayposts/ItemCard";
import { useBrowsepageItems } from "@/hooks/queries/displayItems";

export default function BrowsePage() {
  const { data: items, isLoading, error } = useBrowsepageItems();

  if (error) return <div>Error: {(error as Error).message}</div>;

  return (
    <div className="p-10">
      <div>
        <h1 className="font-semibold text-[#102E4A]">Featured Listing</h1>
      </div>
      {isLoading ? (
        <p>Loading...</p>
      ) : !items || items.length === 0 ? (
        <p className="text-center text-gray-500 mt-4">No items available.</p>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3 xl:grid-cols-5 mt-3">
          {items.map((item) => (
            <ItemCard
              key={item.post_id}
              id={item.post_id}
              condition={item.item_condition}
              title={item.item_title}
              category_name={item.category_name}
              image_urls={item.image_urls}
              price={item.item_price}
              post_type={item.post_type_name}
              seller={item.full_name || "Unknown"}
              created_at={item.created_at}
            />
          ))}
        </div>
      )}
    </div>
  );
}
