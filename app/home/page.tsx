import { createClient } from "@/utils/supabase/server";
import ItemCard from "@/components/ItemCard";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: items, error } = await supabase
    .from("posts")
    .select("id, item_title, item_price, users(full_name)")
    .order("created_at", { ascending: false });

  if (error) {
    return <div>Error fetching items: {error.message}</div>;
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {items?.map((item) => (
        <ItemCard
          key={item.id}
          id={item.id}
          title={item.item_title}
          price={item.item_price} // ✅ Ensure this is present
          seller={item.users?.full_name || "Unknown"}
        />
      ))}
    </div>
  );
}
