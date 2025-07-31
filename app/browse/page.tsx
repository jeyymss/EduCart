"use client";

import { useEffect, useState } from "react";
import ItemCard from "@/components/ItemCard";

type PostWithUser = {
  post_id: string;
  item_title: string;
  item_description: string;
  item_price: number;
  full_name: string;
  post_type_name: string;
  created_at: string;
};

export default function BrowsePage() {
  const [items, setItems] = useState<PostWithUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);

        const res = await fetch("/api/product");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch items");

        setLoading(false);

        setItems(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred.");
        }
      }
    };

    fetchItems();
  }, []);

  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div>
        <h1 className="text-2xl font-semibold">Browse Items</h1>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-center text-gray-500 mt-4">No items available.</p>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3 xl:grid-cols-5">
          {items.map((item) => (
            <ItemCard
              key={item.post_id}
              id={item.post_id}
              title={item.item_title}
              price={item.item_price}
              type={item.post_type_name}
              seller={item.full_name || "Unknown"}
              created_at={item.created_at}
            />
          ))}
        </div>
      )}
    </div>
  );
}
