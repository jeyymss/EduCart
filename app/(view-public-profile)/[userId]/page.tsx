"use client";

import { useParams, useRouter } from "next/navigation";
import { usePublicProfile, usePublicListings } from "@/hooks/queries/profiles";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, MessageCircle, ChevronDown } from "lucide-react";
import {
  ItemCard,
  ItemCardSkeleton,
} from "@/components/posts/displayposts/ItemCard";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { useTransition, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdvancedFilters } from "@/components/profile/AdvancedFilters";
import type {
  AdvancedFilterValue,
  PostOpt,
} from "@/components/profile/AdvancedFilters";
import Image from "next/image";

type PublicListing = {
  id: string;
  item_title: string | null;
  item_price: number | null;
  item_condition: string | null;
  category_name: string | null;
  post_type_name: string | null;
  created_at: string;
  image_urls: string[] | null;
  status: "Listed" | "Sold" | "Unlisted";
};

const POST_VALUE_MAP: Record<PostOpt, string> = {
  Sell: "Sale",
  Rent: "Rent",
  Trade: "Trade",
  "Emergency Lending": "Emergency Lending",
  Pasabuy: "Pasabuy",
  "Donation and Giveaway": "Giveaway",
};

const expandToAllSpellings = (p: PostOpt) => {
  const backend = POST_VALUE_MAP[p] ?? p;
  return backend === p ? [p] : [p, backend];
};

function byPrice(a: PublicListing, b: PublicListing, dir: "low" | "high") {
  const aHas = a.item_price != null;
  const bHas = b.item_price != null;
  if (!aHas && !bHas) return 0;
  if (!aHas) return dir === "low" ? 1 : -1;
  if (!bHas) return dir === "low" ? -1 : 1;
  return dir === "low"
    ? (a.item_price as number) - (b.item_price as number)
    : (b.item_price as number) - (a.item_price as number);
}

function byTime(a: PublicListing, b: PublicListing, dir: "newest" | "oldest") {
  const at = new Date(a.created_at).getTime();
  const bt = new Date(b.created_at).getTime();
  return dir === "newest" ? bt - at : at - bt;
}

export default function PublicProfilePage() {
  const { userId } = useParams() as { userId: string };
  const router = useRouter();
  const supabase = createClient();
  const [pending, start] = useTransition();

  const { data: profile, isLoading, error } = usePublicProfile(userId);

  const {
    data: listings = { data: [] as PublicListing[] },
    isLoading: listingsLoading,
    error: listingsError,
  } = usePublicListings(userId, 1, 12);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [postType, setPostType] = useState<string | null>(null);
  const [adv, setAdv] = useState<AdvancedFilterValue>({
    time: null,
    price: null,
    posts: [],
    category: undefined,
    minPrice: null,
    maxPrice: null,
  });

  if (isLoading) return <div className="p-6">Loading…</div>;
  if (error || !profile)
    return <div className="p-6 text-red-600">Profile not found.</div>;

  const initials = profile.full_name
    .split(" ")
    .map((s: string) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const avatarSrc = profile.avatar_url
    ? `${profile.avatar_url}${profile.avatar_url.includes("?") ? "&" : "?"}v=${
        profile.user_id ?? "1"
      }`
    : undefined;

  // Start chat
  const startChat = () => {
    if (!listings.data.length) {
      alert("This user has no listings to message about.");
      return;
    }
    const firstPostId = listings.data[0].id;
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

  // ----- Apply filters to listings -----
  const allowedPostTypes: string[] | null =
    adv.posts && adv.posts.length > 0
      ? (adv.posts as PostOpt[]).flatMap(expandToAllSpellings)
      : postType
      ? [postType]
      : null;

  const filteredListings = listings.data
    .filter((item) => {
      const matchesSearch = (item.item_title ?? "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesPostType = allowedPostTypes
        ? allowedPostTypes.includes(item.post_type_name ?? "")
        : true;

      let matchesAdv = true;
      if (adv.category && item.category_name !== adv.category)
        matchesAdv = false;
      if (
        adv.minPrice != null &&
        Number(item.item_price ?? 0) < Number(adv.minPrice)
      )
        matchesAdv = false;
      if (
        adv.maxPrice != null &&
        Number(item.item_price ?? 0) > Number(adv.maxPrice)
      )
        matchesAdv = false;

      return matchesSearch && matchesPostType && matchesAdv;
    })
    .sort((a, b) => {
      if (adv.price) return byPrice(a, b, adv.price);
      if (adv.time) return byTime(a, b, adv.time);
      return 0;
    });

  return (
    <div>
      {/* Cover photo */}
      <div className="w-full h-52 relative bg-black">
        {profile.background_url ? (
          <Image
            src={profile.background_url}
            alt="Background"
            fill
            className="object-cover"
            priority
          />
        ) : null}

        <button className="absolute top-4 right-6 p-2 hover:bg-gray-100 rounded-full bg-white/80">
          <MoreHorizontal className="h-6 w-6 text-gray-700" />
        </button>

        <div className="absolute -bottom-14 left-36">
          <Avatar className="h-28 w-28 ring-4 ring-white">
            <AvatarImage
              key={profile.avatar_url ?? "no-avatar"}
              src={avatarSrc ?? ""}
              alt={profile.full_name}
            />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Profile info */}
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

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-8">
          {/* Listings */}
          <section>
            <div className="border border-gray-300 rounded-2xl bg-white p-8 shadow-sm w-full">
              <div className="flex justify-between items-center flex-wrap gap-3 mb-6">
                <h2 className="text-xl font-semibold">
                  Listings ({filteredListings.length})
                </h2>

                <div className="flex items-center gap-3">
                  {/* Post Type Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-1 px-3 py-2 border rounded-lg bg-white shadow-sm text-sm font-medium hover:bg-gray-50">
                      Post Type <ChevronDown className="w-4 h-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setPostType("Sale")}>
                        Sale
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setPostType("Rent")}>
                        Rent
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setPostType("Trade")}>
                        Trade
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setPostType("Emergency Lending")}
                      >
                        Emergency Lending
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setPostType("Pasabuy")}>
                        Pasabuy
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setPostType("Giveaway")}>
                        Giveaway
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setPostType(null)}>
                        All
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Search */}
                  <Input
                    type="text"
                    placeholder="Search items"
                    className="h-9 w-[200px] text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />

                  {/* Advanced Filters */}
                  <AdvancedFilters
                    value={adv}
                    onApply={(next) =>
                      setAdv({ ...next, posts: [...(next.posts ?? [])] })
                    }
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
              ) : filteredListings.length === 0 ? (
                <p className="text-gray-500">No listings match your filters.</p>
              ) : (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl-grid-cols-4">
                  {filteredListings.map((item) => (
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
