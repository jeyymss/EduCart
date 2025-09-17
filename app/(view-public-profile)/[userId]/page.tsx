"use client";

import { useParams, useRouter } from "next/navigation";
import { usePublicProfile, usePublicListings } from "@/hooks/queries/profiles";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, MessageCircle } from "lucide-react";
import {
  ItemCard,
  ItemCardSkeleton,
} from "@/components/posts/displayposts/ItemCard";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { useTransition } from "react";

export default function PublicProfilePage() {
  const { userId } = useParams() as { userId: string };
  const router = useRouter();
  const supabase = createClient();
  const [pending, start] = useTransition();

  const { data: profile, isLoading, error } = usePublicProfile(userId);

  // ✅ listings is always at least { data: [] }
  const {
    data: listings = { data: [] },
    isLoading: listingsLoading,
    error: listingsError,
  } = usePublicListings(userId, 1, 12);

  if (isLoading) return <div className="p-6">Loading…</div>;
  if (error || !profile)
    return <div className="p-6 text-red-600">Profile not found.</div>;

  const initials = profile.full_name
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const avatarSrc = profile.avatar_url
    ? `${profile.avatar_url}${profile.avatar_url.includes("?") ? "&" : "?"}v=${
        profile.user_id ?? "1"
      }`
    : undefined;

  // 🔹 Start chat with this user's first listing
  const startChat = () => {
    if (!listings.data.length) {
      alert("This user has no listings to message about.");
      return;
    }

    const firstPostId = listings.data[0].id; // ✅ use the first listing
    start(async () => {
      const { data, error } = await supabase.rpc("start_chat_for_post", {
        input_post_id: firstPostId,
      });
      if (error) {
        alert(error.message);
        return;
      }
      router.push(`/messages/${data?.conversation_id}`);
    });
  };

  return (
    <div>
      {/* 🔹 Cover photo */}
      <div className="w-full h-52 bg-gray-900 relative">
        {/* More options */}
        <button className="absolute top-4 right-6 p-2 hover:bg-gray-100 rounded-full bg-white/80">
          <MoreHorizontal className="h-6 w-6 text-gray-700" />
        </button>

        {/* Avatar */}
        <div className="absolute -bottom-14 left-35">
          <Avatar className="h-28 w-28 ring-4 ring-white">
            <AvatarImage
              key={profile.avatar_url ?? "no-avatar"}
              src={avatarSrc}
              alt={profile.full_name}
            />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* 🔹 Profile info */}
      <div className="px-10 mt-2">
        <div className="ml-57 flex justify-between items-start">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">{profile.full_name}</h1>
            <p className="text-base text-muted-foreground">
              {profile.bio ?? "This user has no bio yet."}
            </p>
            <div className="flex gap-2">
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                {profile.role}
              </span>
              {profile.university_abbreviation && (
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                  {profile.university_abbreviation}
                </span>
              )}
            </div>
          </div>

          {/* 🔹 Message button */}
          <Button
            onClick={startChat}
            disabled={pending}
            className="flex items-center gap-2 bg-[#F3D58D] hover:bg-[#F3D58D]/90 text-black font-medium px-4 py-2 rounded-lg"
          >
            <MessageCircle className="h-5 w-5" />
            {pending ? "Starting…" : "Message"}
          </Button>
        </div>

        <div className="mb-7"></div>

        {/* 🔹 Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-8">
          {/* Listings */}
          <section>
            <div className="border border-gray-300 rounded-2xl bg-white p-8 shadow-sm w-full">
              {/* Header + Filters */}
              <div className="flex justify-between items-center flex-wrap gap-3 mb-6">
                <h2 className="text-xl font-semibold">
                  Listings ({listings.data.length})
                </h2>

                <div className="flex gap-3">
                  <select className="border rounded-lg px-3 py-2 text-sm">
                    <option>Category</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Search items..."
                    className="border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>

              {/* Listings Grid */}
              {listingsLoading ? (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <ItemCardSkeleton key={i} />
                  ))}
                </div>
              ) : listingsError ? (
                <p className="text-red-600">Error loading listings.</p>
              ) : listings.data.length === 0 ? (
                <p className="text-gray-500">No listings yet.</p>
              ) : (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {listings.data.map((item) => (
                    <ItemCard
                      key={item.id}
                      id={item.id}
                      condition={item.item_condition ?? ""}
                      title={item.item_title ?? ""}
                      category_name={item.category_name ?? ""}
                      image_urls={item.image_urls ?? []}
                      price={item.item_price ?? undefined}
                      post_type={item.post_type_name ?? ""}
                      seller={profile.full_name ?? "Unknown"}
                      status={item.status}
                      created_at={item.created_at}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Reviews */}
          <aside>
            <div className="sticky top-20">
              <div className="border border-gray-300 rounded-2xl bg-white p-6 shadow-sm space-y-4">
                <h2 className="text-xl font-semibold">Reviews</h2>
                <div className="text-sm text-muted-foreground">
                  No reviews yet.
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
