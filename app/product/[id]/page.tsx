import { createClient } from "@/utils/supabase/server";
import Image from "next/image";

type Params = {
  id: string;
};

type PostWithUser = {
  post_id: string;
  item_title: string;
  item_description: string;
  item_price: number;
  full_name: string;
  post_type_name: string;
  created_at: string;
  image_url: string;
};

function getRelativeTime(timestamp: string): string {
  const now = new Date();
  const created = new Date(timestamp);
  const diffMs = now.getTime() - created.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;

  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs} hour${diffHrs > 1 ? "s" : ""} ago`;

  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? "s" : ""} ago`;

  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
}

export default async function ItemDetails({ params }: { params: Params }) {
  const { id } = await params;

  if (!id || id === "NaN") {
    return <div className="text-red-600">Invalid or missing item ID</div>;
  }

  const supabase = await createClient();

  const { data: item, error } = await supabase
    .from("posts_with_user")
    .select("*")
    .eq("post_id", id)
    .single<PostWithUser>();

  console.log(item?.image_url);

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
      {item.post_type_name && <p>{item.post_type_name}</p>}
      {item.created_at && (
        <p className="text-sm text-gray-500">
          Listed {getRelativeTime(item.created_at)}
        </p>
      )}
      {item.item_price !== null && <p>₱{item.item_price}</p>}
      {item.full_name && (
        <p className="text-gray-600">Posted by: {item.full_name}</p>
      )}
      {item.image_url && (
        <Image
          src={item.image_url}
          alt={item.item_title}
          width={150}
          height={0}
          className="object-cover rounded-lg"
        />
      )}
    </div>
  );
}
