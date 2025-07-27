import { createClient } from "@/utils/supabase/server";

type Params = {
  id: string;
};

export default async function ItemDetails({ params }: { params: Params }) {
  const { id } = params;

  const supabase = await createClient(); // ✅ FIXED HERE

  const { data: item, error } = await supabase
    .from("posts")
    .select("item_title, item_description, item_price, users(full_name)")
    .eq("id", id)
    .single();

  if (error || !item) {
    return (
      <div className="text-red-600">
        <h1>Item not found or error: {error?.message}</h1>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h1 className="text-xl font-bold">{item.item_title}</h1>
      {item.item_description && <p>{item.item_description}</p>}
      {item.item_price !== null && <p>₱{item.item_price}</p>}
      {item.users?.full_name && (
        <p className="text-gray-600">Posted by: {item.users.full_name}</p>
      )}
    </div>
  );
}
